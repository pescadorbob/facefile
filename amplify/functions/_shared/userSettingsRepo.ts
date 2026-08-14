import { PutCommand, GetCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { ddb, tableName } from './dynamo';
import type { AnswerFormat, QuizMode } from './quizTypes';

const TABLE = () => tableName('USER_SETTINGS_TABLE_NAME');

/**
 * One item per user holding every preference the retrieval-practice capability needs:
 * the quiz defaults a session falls back to (E-4.3, E-4.4) and the reminder schedule
 * (E-4.7). One table rather than two because the access pattern is identical — read
 * the whole row by userId — and a user has exactly one of each.
 */
export interface UserSettingsRecord {
  userId: string;
  /** Session type a quiz starts in unless the user overrides it for that session (S-4.3.1). */
  quizMode: QuizMode;
  quizAnswerFormat: AnswerFormat;
  /** Set once the rating explainer has been dismissed, so it never reappears (S-4.4.2). */
  ratingExplainerSeen: boolean;
  remindersEnabled: boolean;
  /** Hour/minute in `reminderTimezone`, not UTC — the user picks a wall-clock time (S-4.7.2). */
  reminderHour: number;
  reminderMinute: number;
  reminderTimezone: string;
  /** Empty means "no channel enabled": reminders are silently skipped (S-4.7.1). */
  reminderChannels: string[];
  /** `YYYY-MM-DD` in the user's own timezone — the once-a-day guard for the dispatcher. */
  lastReminderSentOn: string | null;
  createdAt: string;
  updatedAt: string;
}

export const DEFAULT_SETTINGS: Omit<UserSettingsRecord, 'userId' | 'createdAt' | 'updatedAt'> = {
  quizMode: 'mixed',
  quizAnswerFormat: 'choice',
  ratingExplainerSeen: false,
  // Opt-in: a user who has never opened notification settings is not messaged.
  remindersEnabled: false,
  reminderHour: 9,
  reminderMinute: 0,
  reminderTimezone: 'UTC',
  reminderChannels: ['in-app'],
  lastReminderSentOn: null,
};

export const userSettingsRepo = {
  /** Never null — a user with no stored row reads as the defaults, so callers need no special case. */
  async findByUser(userId: string): Promise<UserSettingsRecord> {
    const res = await ddb.send(new GetCommand({ TableName: TABLE(), Key: { userId } }));
    return hydrate(userId, res.Item as Partial<UserSettingsRecord> | undefined);
  },

  async save(settings: UserSettingsRecord): Promise<UserSettingsRecord> {
    const updated = { ...settings, updatedAt: new Date().toISOString() };
    await ddb.send(new PutCommand({ TableName: TABLE(), Item: updated }));
    return updated;
  },

  /**
   * The reminder sweep is the one access pattern that isn't per-user, so it Scans.
   * The table holds at most one small item per user, and only users who have opened
   * notification settings have a row at all — a Query would need a GSI whose only
   * purpose was to be scanned anyway.
   *
   * ConsistentRead because the sweep acts on what it reads: a user who enabled
   * reminders moments ago must not be skipped by a stale replica, and the
   * `lastReminderSentOn` stamp read here is what stops a second reminder going out
   * the same day. The table is one small item per opted-in user, so the doubled read
   * cost is immaterial next to getting either of those wrong.
   */
  async findAll(): Promise<UserSettingsRecord[]> {
    const items: UserSettingsRecord[] = [];
    let startKey: Record<string, unknown> | undefined;
    do {
      const res = await ddb.send(
        new ScanCommand({ TableName: TABLE(), ExclusiveStartKey: startKey, ConsistentRead: true }),
      );
      items.push(...((res.Items ?? []) as UserSettingsRecord[]));
      startKey = res.LastEvaluatedKey;
    } while (startKey);
    return items.map((item) => hydrate(item.userId, item));
  },
};

/**
 * Fills in any field a stored row is missing. Rows written before a setting existed
 * are the normal case here, not an edge one — every caller then reads a complete
 * record and none of them has to special-case an absent field.
 */
function hydrate(userId: string, stored: Partial<UserSettingsRecord> | undefined): UserSettingsRecord {
  const now = new Date().toISOString();
  // `userId` last: the key the caller asked for always wins over whatever the row carries.
  return { createdAt: now, updatedAt: now, ...DEFAULT_SETTINGS, ...stripNullish(stored ?? {}), userId };
}

/** Keeps a stored missing/null attribute from overwriting a default with nothing. */
function stripNullish<T extends object>(value: T): Partial<T> {
  return Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined && v !== null)) as Partial<T>;
}
