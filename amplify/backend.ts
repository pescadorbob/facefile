import { defineBackend } from '@aws-amplify/backend';
import { Stack } from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';

import { adminUsersFunction } from './functions/adminUsers/resource';
import { contactsFunction } from './functions/contacts/resource';
import { dashboardFunction } from './functions/dashboard/resource';
import { palacesFunction } from './functions/palaces/resource';
import { sessionFunction } from './functions/session/resource';
import { tutorialFunction } from './functions/tutorial/resource';

// No `defineAuth`/Cognito here by design. Per CLAUDE.md, FaceFile's
// authorization is a deliberate single-user stub today (every route falls
// back to one DEFAULT_USER_ID) — this migration ports that behavior to
// Lambda as-is; fixing it is an explicit future story, not a side effect of
// moving infrastructure. See functions/_shared/session.ts.
const backend = defineBackend({
  sessionFunction,
  tutorialFunction,
  palacesFunction,
  contactsFunction,
  adminUsersFunction,
  dashboardFunction,
});

const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:4200';
// Prisma's autoincrement DEFAULT_USER_ID = 1 has no DynamoDB equivalent now
// that ids are UUIDs (functions/_shared/ids.ts) — this fixed id is seeded
// once (see amplify/seed.ts / CLAUDE.md) so the stub keeps working.
const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000001';

// ---------------------------------------------------------------------------
// Data: plain DynamoDB tables, one per Prisma model that an existing route
// actually reads/writes. `Locus` (always read nested under its Palace, no
// route of its own) is an embedded list on the Palace item, not a table.
// `UserMicrosoftConnection` has no route referencing it at all and is
// deliberately not carried over — see the migration plan for both calls.
// ---------------------------------------------------------------------------
const dataStack = backend.createStack('facefile-data');

const usersTable = new dynamodb.Table(dataStack, 'UsersTable', {
  partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
  billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
});
usersTable.addGlobalSecondaryIndex({
  indexName: 'byEmail',
  partitionKey: { name: 'email', type: dynamodb.AttributeType.STRING },
});

const palacesTable = new dynamodb.Table(dataStack, 'PalacesTable', {
  partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
  sortKey: { name: 'id', type: dynamodb.AttributeType.STRING },
  billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
});

const contactsTable = new dynamodb.Table(dataStack, 'ContactsTable', {
  partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
  sortKey: { name: 'id', type: dynamodb.AttributeType.STRING },
  billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
});

const reviewCardsTable = new dynamodb.Table(dataStack, 'ReviewCardsTable', {
  partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
  sortKey: { name: 'contactId', type: dynamodb.AttributeType.STRING },
  billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
});

const quizResultsTable = new dynamodb.Table(dataStack, 'QuizResultsTable', {
  partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
  sortKey: { name: 'id', type: dynamodb.AttributeType.STRING },
  billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
});

const tutorialProgressTable = new dynamodb.Table(dataStack, 'TutorialProgressTable', {
  partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
  billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
});

// ---------------------------------------------------------------------------
// Storage: contact photos. Replaces Multer writing to backend/uploads/
// (served unauthenticated via Express's static /uploads route) — the
// `photos/*` prefix is public-read here for the same reason: nothing in the
// app requires auth to view a contact photo today, so this preserves that
// rather than tightening it as a side effect of the migration.
// ---------------------------------------------------------------------------
const photosBucket = new s3.Bucket(dataStack, 'PhotosBucket', {
  blockPublicAccess: new s3.BlockPublicAccess({
    blockPublicAcls: true,
    ignorePublicAcls: true,
    blockPublicPolicy: false,
    restrictPublicBuckets: false,
  }),
  cors: [{ allowedMethods: [s3.HttpMethods.GET], allowedOrigins: [FRONTEND_URL], allowedHeaders: ['*'] }],
});
photosBucket.addToResourcePolicy(
  new iam.PolicyStatement({
    actions: ['s3:GetObject'],
    resources: [photosBucket.arnForObjects('photos/*')],
    principals: [new iam.AnyPrincipal()],
  }),
);

// ---------------------------------------------------------------------------
// Per-function environment + least-privilege grants. Table/bucket names
// aren't known until CDK synth, so they're injected via addEnvironment here
// rather than each function's own defineFunction (which only handles
// statically-known values like the SESSION_COOKIE_SECRET reference).
// ---------------------------------------------------------------------------
// backend.<fn>.resources.lambda is typed as the CDK lambda.IFunction interface
// (which has no addEnvironment), but Amplify's Node.js function construct is
// always a concrete lambda.Function under the hood — this cast matches the
// pattern from Amplify's own "modify Lambda resources with CDK" docs.
function wire(fn: lambda.IFunction, env: Record<string, string>) {
  const concrete = fn as lambda.Function;
  for (const [key, value] of Object.entries(env)) concrete.addEnvironment(key, value);
}

const sessionLambda = backend.sessionFunction.resources.lambda;
// Write access as well as read: POST /session/profiles creates the profile it
// then signs in (S-1.7.4) — the picker is the only way into an app with no
// profiles yet, so that path can't be admin-only.
usersTable.grantReadWriteData(sessionLambda);
wire(sessionLambda, {
  USERS_TABLE_NAME: usersTable.tableName,
  FRONTEND_URL,
  DEFAULT_USER_ID,
});

const tutorialLambda = backend.tutorialFunction.resources.lambda;
tutorialProgressTable.grantReadWriteData(tutorialLambda);
wire(tutorialLambda, {
  TUTORIAL_PROGRESS_TABLE_NAME: tutorialProgressTable.tableName,
  FRONTEND_URL,
  DEFAULT_USER_ID,
});

const palacesLambda = backend.palacesFunction.resources.lambda;
// Write access as well as read since S-3.3.1: users create their own palaces
// (POST /palaces) and can remove one (DELETE /palaces/{id}).
palacesTable.grantReadWriteData(palacesLambda);
wire(palacesLambda, {
  PALACES_TABLE_NAME: palacesTable.tableName,
  FRONTEND_URL,
  DEFAULT_USER_ID,
});

const contactsLambda = backend.contactsFunction.resources.lambda;
contactsTable.grantReadWriteData(contactsLambda);
reviewCardsTable.grantReadWriteData(contactsLambda);
quizResultsTable.grantReadWriteData(contactsLambda); // DELETE /contacts cascades into quiz results too
photosBucket.grantPut(contactsLambda);
wire(contactsLambda, {
  CONTACTS_TABLE_NAME: contactsTable.tableName,
  REVIEW_CARDS_TABLE_NAME: reviewCardsTable.tableName,
  QUIZ_RESULTS_TABLE_NAME: quizResultsTable.tableName,
  PHOTOS_BUCKET_NAME: photosBucket.bucketName,
  FRONTEND_URL,
  DEFAULT_USER_ID,
});

const adminUsersLambda = backend.adminUsersFunction.resources.lambda;
usersTable.grantReadWriteData(adminUsersLambda);
wire(adminUsersLambda, {
  USERS_TABLE_NAME: usersTable.tableName,
  FRONTEND_URL,
});

const dashboardLambda = backend.dashboardFunction.resources.lambda;
contactsTable.grantReadData(dashboardLambda);
reviewCardsTable.grantReadData(dashboardLambda);
quizResultsTable.grantReadData(dashboardLambda);
wire(dashboardLambda, {
  CONTACTS_TABLE_NAME: contactsTable.tableName,
  REVIEW_CARDS_TABLE_NAME: reviewCardsTable.tableName,
  QUIZ_RESULTS_TABLE_NAME: quizResultsTable.tableName,
  FRONTEND_URL,
  DEFAULT_USER_ID,
});

// ---------------------------------------------------------------------------
// API Gateway REST API. One resource per old Express route-file mount, each
// wired ANY-method to its Lambda (which does its own method/path dispatch,
// same as the Express router it replaces) — see the plan for why this is a
// proxy-per-resource design rather than enumerating every method in CDK.
// ---------------------------------------------------------------------------
const apiStack = backend.createStack('facefile-api');
const restApi = new apigateway.RestApi(apiStack, 'FaceFileApi', {
  restApiName: 'facefile-api',
  deployOptions: { stageName: 'api' },
  // Only multipart bodies (contact photo upload) need base64 pass-through;
  // JSON bodies for every other route are unaffected.
  binaryMediaTypes: ['multipart/form-data'],
  defaultCorsPreflightOptions: {
    allowOrigins: [FRONTEND_URL],
    allowCredentials: true,
    allowMethods: apigateway.Cors.ALL_METHODS,
    allowHeaders: ['Content-Type'],
  },
});

function mountLambda(parent: apigateway.IResource, pathPart: string, fn: lambda.IFunction): apigateway.IResource {
  const resource = parent.addResource(pathPart);
  const integration = new apigateway.LambdaIntegration(fn);
  resource.addMethod('ANY', integration);
  resource.addProxy({ defaultIntegration: integration, anyMethod: true });
  return resource;
}

mountLambda(restApi.root, 'session', sessionLambda);
mountLambda(restApi.root, 'tutorial', tutorialLambda);
mountLambda(restApi.root, 'palaces', palacesLambda);
mountLambda(restApi.root, 'contacts', contactsLambda);
mountLambda(restApi.root, 'dashboard', dashboardLambda);
mountLambda(restApi.root.addResource('admin'), 'users', adminUsersLambda);

// Custom (non-Data/non-Auth) resources surface to the frontend under
// `custom` in amplify_outputs.json — see frontend/src/app/services/api-url.ts.
// `tables`/`photosBucket` aren't needed by the frontend but are read the same
// way by amplify/seed.ts (there's no other post-deploy way to learn CDK's
// generated table names).
backend.addOutput({
  custom: {
    API: {
      facefileApi: {
        endpoint: restApi.url,
        region: Stack.of(restApi).region,
      },
    },
    tables: {
      users: usersTable.tableName,
      palaces: palacesTable.tableName,
      contacts: contactsTable.tableName,
      reviewCards: reviewCardsTable.tableName,
      quizResults: quizResultsTable.tableName,
      tutorialProgress: tutorialProgressTable.tableName,
    },
    photosBucket: photosBucket.bucketName,
    defaultUserId: DEFAULT_USER_ID,
  },
});
