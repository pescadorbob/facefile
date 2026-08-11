import { BatchWriteCommand, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { ddb, tableName } from './dynamo';
import { newId } from './ids';

const CONTACTS_TABLE = () => tableName('CONTACTS_TABLE_NAME');
const REVIEW_CARDS_TABLE = () => tableName('REVIEW_CARDS_TABLE_NAME');
const QUIZ_RESULTS_TABLE = () => tableName('QUIZ_RESULTS_TABLE_NAME');

export interface ContactRecord {
  userId: string;
  id: string;
  name: string;
  photoPath: string | null;
  notes: string | null;
  palaceId: string | null;
  locusId: string | null;
  nameImage: string | null;
  associationScene: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewCardRecord {
  userId: string;
  contactId: string;
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContactInput {
  userId: string;
  name: string;
  notes: string | null;
  photoPath: string | null;
  palaceId: string | null;
  locusId: string | null;
  nameImage: string | null;
  associationScene: string | null;
}

const nowIso = () => new Date().toISOString();

// Port of the Contact/ReviewCard/QuizResult slices of contacts.js — Contact
// no longer needs a separate ReviewCard "include" query since both live in
// per-user-partitioned tables and are fetched/written together explicitly.
export const contactsRepo = {
  async findAllByUser(userId: string): Promise<ContactRecord[]> {
    const res = await ddb.send(
      new QueryCommand({
        TableName: CONTACTS_TABLE(),
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: { ':userId': userId },
      }),
    );
    return ((res.Items ?? []) as ContactRecord[]).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  },

  async create(input: CreateContactInput): Promise<{ contact: ContactRecord; reviewCard: ReviewCardRecord }> {
    const now = nowIso();
    const contact: ContactRecord = { ...input, id: newId(), createdAt: now, updatedAt: now };
    const reviewCard: ReviewCardRecord = {
      userId: input.userId,
      contactId: contact.id,
      easeFactor: 2.5,
      interval: 0,
      repetitions: 0,
      nextReviewAt: now,
      createdAt: now,
      updatedAt: now,
    };

    await Promise.all([
      ddb.send(new PutCommand({ TableName: CONTACTS_TABLE(), Item: contact })),
      ddb.send(new PutCommand({ TableName: REVIEW_CARDS_TABLE(), Item: reviewCard })),
    ]);

    return { contact, reviewCard };
  },

  /** Mirrors the cascading `quizResult` → `reviewCard` → `contact` deletes in
   * contacts.js's `DELETE /` route. */
  async deleteAllForUser(userId: string): Promise<void> {
    const targets = [
      { table: CONTACTS_TABLE(), sortKeyName: 'id' },
      { table: REVIEW_CARDS_TABLE(), sortKeyName: 'contactId' },
      { table: QUIZ_RESULTS_TABLE(), sortKeyName: 'id' },
    ];

    await Promise.all(
      targets.map(async ({ table, sortKeyName }) => {
        const keys = await queryKeys(table, userId, sortKeyName);
        await batchDelete(table, sortKeyName, userId, keys);
      }),
    );
  },
};

async function queryKeys(table: string, userId: string, sortKeyName: string): Promise<string[]> {
  const res = await ddb.send(
    new QueryCommand({
      TableName: table,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: { ':userId': userId },
      ProjectionExpression: '#sk',
      ExpressionAttributeNames: { '#sk': sortKeyName },
    }),
  );
  return (res.Items ?? []).map((item) => item[sortKeyName] as string);
}

async function batchDelete(table: string, sortKeyName: string, userId: string, sortKeyValues: string[]): Promise<void> {
  // DynamoDB BatchWriteItem caps at 25 requests per call.
  for (let i = 0; i < sortKeyValues.length; i += 25) {
    const chunk = sortKeyValues.slice(i, i + 25);
    if (chunk.length === 0) continue;
    await ddb.send(
      new BatchWriteCommand({
        RequestItems: {
          [table]: chunk.map((sk) => ({ DeleteRequest: { Key: { userId, [sortKeyName]: sk } } })),
        },
      }),
    );
  }
}
