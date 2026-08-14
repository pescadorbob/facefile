import { BatchWriteCommand, PutCommand, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { ddb, tableName } from './dynamo';
import { newId } from './ids';

const TABLE = () => tableName('NOTIFICATIONS_TABLE_NAME');

/**
 * A delivered reminder. The `in-app` channel *is* this row — the user's notification
 * list reads straight from here — so a row is both the delivery and its own record.
 * An email or push channel would write the same row and hand it to a provider; see
 * notifier.ts for where that adapter goes.
 */
export interface NotificationRecord {
  userId: string;
  id: string;
  channel: string;
  message: string;
  /** Where tapping the notification takes the user (S-4.7.1). */
  link: string;
  dueCount: number;
  sentAt: string;
  readAt: string | null;
}

export interface CreateNotificationInput {
  userId: string;
  channel: string;
  message: string;
  link: string;
  dueCount: number;
  sentAt: string;
}

export const notificationsRepo = {
  async create(input: CreateNotificationInput): Promise<NotificationRecord> {
    const notification: NotificationRecord = { ...input, id: newId(), readAt: null };
    await ddb.send(new PutCommand({ TableName: TABLE(), Item: notification }));
    return notification;
  },

  /**
   * Newest first — a notification list is read from the top. ConsistentRead because a
   * reminder that has just been dispatched must be on the dashboard when the user
   * arrives; a stale read here shows them nothing and looks like the sweep never ran.
   */
  async findAllByUser(userId: string): Promise<NotificationRecord[]> {
    const res = await ddb.send(
      new QueryCommand({
        TableName: TABLE(),
        ConsistentRead: true,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: { ':userId': userId },
      }),
    );
    return ((res.Items ?? []) as NotificationRecord[]).sort((a, b) => b.sentAt.localeCompare(a.sentAt));
  },

  async markRead(userId: string, id: string): Promise<void> {
    await ddb.send(
      new UpdateCommand({
        TableName: TABLE(),
        Key: { userId, id },
        UpdateExpression: 'SET readAt = :now',
        ExpressionAttributeValues: { ':now': new Date().toISOString() },
      }),
    );
  },

  async deleteAllForUser(userId: string): Promise<void> {
    const res = await ddb.send(
      new QueryCommand({
        TableName: TABLE(),
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: { ':userId': userId },
        ProjectionExpression: 'id',
      }),
    );
    const ids = (res.Items ?? []).map((item) => item.id as string);
    // DynamoDB BatchWriteItem caps at 25 requests per call.
    for (let i = 0; i < ids.length; i += 25) {
      const chunk = ids.slice(i, i + 25);
      if (chunk.length === 0) continue;
      await ddb.send(
        new BatchWriteCommand({
          RequestItems: { [TABLE()]: chunk.map((id) => ({ DeleteRequest: { Key: { userId, id } } })) },
        }),
      );
    }
  },
};
