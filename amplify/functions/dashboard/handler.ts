import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { ddb, tableName } from '../_shared/dynamo';
import { errorResponse, json, preflight } from '../_shared/http';
import { resolveUserId } from '../_shared/session';

// Direct port of backend/src/routes/dashboard.js. Prisma's `.count()` becomes
// a DynamoDB Query with Select: 'COUNT' — cheaper than fetching full items
// just to measure `.length`, same as the SQL COUNT(*) it replaces.
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  if (event.httpMethod === 'OPTIONS') return preflight();

  const sub = (event.path.replace(/^\/dashboard/, '') || '/').replace(/\/+$/, '') || '/';

  try {
    if (event.httpMethod === 'GET' && sub === '/metrics') return await metrics(resolveUserId(event));
    return json(404, { error: 'Not found' });
  } catch (err) {
    return errorResponse(err);
  }
};

async function metrics(userId: string): Promise<APIGatewayProxyResult> {
  const [peopleAdded, cardsDue, totalQuizAnswers, correctQuizAnswers] = await Promise.all([
    countByUser(tableName('CONTACTS_TABLE_NAME'), userId),
    countByUser(tableName('REVIEW_CARDS_TABLE_NAME'), userId, {
      filter: 'nextReviewAt <= :now',
      values: { ':now': new Date().toISOString() },
    }),
    countByUser(tableName('QUIZ_RESULTS_TABLE_NAME'), userId),
    countByUser(tableName('QUIZ_RESULTS_TABLE_NAME'), userId, {
      filter: 'quality >= :minQuality',
      values: { ':minQuality': 3 },
    }),
  ]);

  const accuracyPercentage = totalQuizAnswers === 0 ? null : Math.round((100 * correctQuizAnswers) / totalQuizAnswers);

  return json(200, { peopleAdded, cardsDue, totalQuizAnswers, accuracyPercentage });
}

async function countByUser(
  table: string,
  userId: string,
  extra?: { filter: string; values: Record<string, unknown> },
): Promise<number> {
  const res = await ddb.send(
    new QueryCommand({
      TableName: table,
      Select: 'COUNT',
      KeyConditionExpression: 'userId = :userId',
      FilterExpression: extra?.filter,
      ExpressionAttributeValues: { ':userId': userId, ...extra?.values },
    }),
  );
  return res.Count ?? 0;
}
