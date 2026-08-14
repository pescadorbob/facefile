import { GetCommand, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { ddb, tableName } from './dynamo';
import { DEFAULT_CARD_STATE } from './sm2';

const TABLE = () => tableName('REVIEW_CARDS_TABLE_NAME');

/**
 * One review card per contact, keyed by the contact it belongs to — the card is
 * created alongside its contact (contactsRepo.create) and lives as long as it does,
 * so it has no id of its own.
 */
export interface ReviewCardRecord {
  userId: string;
  contactId: string;
  easeFactor: number;
  interval: number;
  repetitions: number;
  /** Absent on cards written before E-4.5 existed; readers must treat it as 0. */
  lapses?: number;
  nextReviewAt: string;
  createdAt: string;
  updatedAt: string;
}

export const reviewCardsRepo = {
  /**
   * ConsistentRead: everything downstream of this — the due count, the upcoming view,
   * the next session's questions — is read by the same user moments after they answered
   * a question and changed it. Seeing a card they just rescheduled still sitting in
   * today's queue reads as the rating not having registered.
   */
  async findAllByUser(userId: string): Promise<ReviewCardRecord[]> {
    const res = await ddb.send(
      new QueryCommand({
        TableName: TABLE(),
        ConsistentRead: true,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: { ':userId': userId },
      }),
    );
    return (res.Items ?? []) as ReviewCardRecord[];
  },

  async findByContact(userId: string, contactId: string): Promise<ReviewCardRecord | null> {
    const res = await ddb.send(new GetCommand({ TableName: TABLE(), Key: { userId, contactId } }));
    return (res.Item as ReviewCardRecord | undefined) ?? null;
  },

  /**
   * Counts cards whose next review has come due. Select: 'COUNT' avoids fetching items
   * to measure them.
   *
   * ConsistentRead because this feeds the reminder sweep, which decides whether to
   * message someone at all: a stale zero reads as "nothing due" and silently skips a
   * user who does have reviews waiting.
   */
  async countDue(userId: string, asOf: Date): Promise<number> {
    const res = await ddb.send(
      new QueryCommand({
        TableName: TABLE(),
        Select: 'COUNT',
        ConsistentRead: true,
        KeyConditionExpression: 'userId = :userId',
        FilterExpression: 'nextReviewAt <= :now',
        ExpressionAttributeValues: { ':userId': userId, ':now': asOf.toISOString() },
      }),
    );
    return res.Count ?? 0;
  },

  /**
   * Writes the post-review schedule back. A full Put rather than an Update: the
   * caller has just recomputed every scheduling field from the card it read, so
   * there is no partial-write case an Update expression would express better.
   */
  async save(card: ReviewCardRecord): Promise<ReviewCardRecord> {
    const updated = { ...card, updatedAt: new Date().toISOString() };
    await ddb.send(new PutCommand({ TableName: TABLE(), Item: updated }));
    return updated;
  },

  /**
   * A contact always gets a card when it is created, so this is a repair path for
   * rows that predate that (or that a partial failure left behind) — quizzing a
   * contact must never 500 just because its card went missing.
   */
  newCardFor(userId: string, contactId: string): ReviewCardRecord {
    const now = new Date().toISOString();
    return {
      userId,
      contactId,
      ...DEFAULT_CARD_STATE,
      nextReviewAt: now,
      createdAt: now,
      updatedAt: now,
    };
  },
};
