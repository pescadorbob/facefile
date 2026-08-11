import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { ddb, tableName } from '../_shared/dynamo';
import { errorResponse, json, preflight } from '../_shared/http';
import { resolveUserId } from '../_shared/session';

const TABLE = () => tableName('TUTORIAL_PROGRESS_TABLE_NAME');

interface TutorialProgress {
  userId: string;
  currentStep: number;
  completed: boolean;
}

// Direct port of backend/src/routes/tutorial.js. TutorialProgress is a
// single item per user (PK = userId), so it needs no separate id/repo layer.
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  if (event.httpMethod === 'OPTIONS') return preflight();

  const sub = (event.path.replace(/^\/tutorial/, '') || '/').replace(/\/+$/, '') || '/';
  const userId = resolveUserId(event);

  try {
    if (event.httpMethod === 'GET' && sub === '/progress') return await getProgress(userId);
    if (event.httpMethod === 'PUT' && sub === '/progress') return await putProgress(event, userId);
    return json(404, { error: 'Not found' });
  } catch (err) {
    return errorResponse(err);
  }
};

async function getProgress(userId: string): Promise<APIGatewayProxyResult> {
  let progress = await find(userId);
  if (!progress) {
    progress = { userId, currentStep: 1, completed: false };
    await ddb.send(new PutCommand({ TableName: TABLE(), Item: progress }));
  }
  return json(200, { currentStep: progress.currentStep, completed: progress.completed });
}

async function putProgress(event: APIGatewayProxyEvent, userId: string): Promise<APIGatewayProxyResult> {
  const body = event.body ? JSON.parse(event.body) : {};
  const existing = await find(userId);

  const progress: TutorialProgress = {
    userId,
    currentStep: body.currentStep !== undefined ? body.currentStep : (existing?.currentStep ?? 1),
    completed: body.completed !== undefined ? body.completed : (existing?.completed ?? false),
  };
  await ddb.send(new PutCommand({ TableName: TABLE(), Item: progress }));
  return json(200, { currentStep: progress.currentStep, completed: progress.completed });
}

async function find(userId: string): Promise<TutorialProgress | null> {
  const res = await ddb.send(new GetCommand({ TableName: TABLE(), Key: { userId } }));
  return (res.Item as TutorialProgress | undefined) ?? null;
}
