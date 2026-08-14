import { PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { ddb, tableName } from './dynamo';
import { newId } from './ids';
import type { RecallRating } from './sm2';
import type { QuizDirection } from './quizTypes';

const TABLE = () => tableName('QUIZ_RESULTS_TABLE_NAME');

/**
 * The review history for a contact: one row per answered question. `quality` is the
 * SM-2 number the rating maps to and is what the dashboard's accuracy metric reads;
 * `rating` is the word the user actually pressed, kept so history stays readable if
 * the mapping is ever retuned.
 */
export interface QuizResultRecord {
  userId: string;
  id: string;
  contactId: string;
  direction: QuizDirection;
  rating: RecallRating;
  quality: number;
  /** Whether the answer given matched the contact, independent of the self-rating. */
  correct: boolean;
  /** True when this answer reset the interval — the lapse event S-4.5.2 wants logged. */
  lapse: boolean;
  answeredAt: string;
}

export interface CreateQuizResultInput {
  userId: string;
  contactId: string;
  direction: QuizDirection;
  rating: RecallRating;
  quality: number;
  correct: boolean;
  lapse: boolean;
  answeredAt: string;
}

export const quizResultsRepo = {
  async create(input: CreateQuizResultInput): Promise<QuizResultRecord> {
    const result: QuizResultRecord = { ...input, id: newId() };
    await ddb.send(new PutCommand({ TableName: TABLE(), Item: result }));
    return result;
  },

  /**
   * Newest first — the review history is read as "what happened recently", and
   * ConsistentRead because the answer the reader is most likely looking for is the one
   * they just gave.
   */
  async findAllByUser(userId: string): Promise<QuizResultRecord[]> {
    const res = await ddb.send(
      new QueryCommand({
        TableName: TABLE(),
        ConsistentRead: true,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: { ':userId': userId },
      }),
    );
    return ((res.Items ?? []) as QuizResultRecord[]).sort((a, b) => b.answeredAt.localeCompare(a.answeredAt));
  },

  async findAllByContact(userId: string, contactId: string): Promise<QuizResultRecord[]> {
    const all = await quizResultsRepo.findAllByUser(userId);
    return all.filter((result) => result.contactId === contactId);
  },

  /** Select: 'COUNT' rather than measuring `.length` — the dashboard only wants the number. */
  async countByUser(userId: string, opts: { minQuality?: number } = {}): Promise<number> {
    const res = await ddb.send(
      new QueryCommand({
        TableName: TABLE(),
        Select: 'COUNT',
        KeyConditionExpression: 'userId = :userId',
        FilterExpression: opts.minQuality === undefined ? undefined : 'quality >= :minQuality',
        ExpressionAttributeValues:
          opts.minQuality === undefined ? { ':userId': userId } : { ':userId': userId, ':minQuality': opts.minQuality },
      }),
    );
    return res.Count ?? 0;
  },
};
