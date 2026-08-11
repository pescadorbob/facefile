import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { requiredEnv } from './env';

const client = new DynamoDBClient({});

// marshallOptions.removeUndefinedValues lets handlers build update/put payloads
// with optional fields left `undefined` instead of having to prune them by hand.
export const ddb = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});

// Each function is only granted (and only has env vars for) the tables it
// actually touches, so table names are read on demand rather than eagerly
// validated as a fixed set here — a function without CONTACTS_TABLE_NAME,
// say, should never fail to cold-start just because some other function uses it.
export const tableName = requiredEnv;
