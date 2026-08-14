import { badRequest } from './http';
import { ANSWER_FORMATS, QUIZ_MODES, type AnswerFormat, type QuizMode } from './quizTypes';
import { userSettingsRepo, type UserSettingsRecord } from './userSettingsRepo';

/** The channels a reminder can be delivered over. See notifier.ts for what each one does today. */
export const REMINDER_CHANNELS = ['in-app'] as const;

export interface UpdateSettingsInput {
  quizMode?: unknown;
  quizAnswerFormat?: unknown;
  ratingExplainerSeen?: unknown;
  remindersEnabled?: unknown;
  reminderHour?: unknown;
  reminderMinute?: unknown;
  reminderTimezone?: unknown;
  reminderChannels?: unknown;
}

export const userSettingsService = {
  get(userId: string): Promise<UserSettingsRecord> {
    return userSettingsRepo.findByUser(userId);
  },

  /**
   * Partial merge, not a replace: the notification page and the quiz start screen both
   * write to this one row and must not clobber each other's fields. Notably, turning
   * reminders off changes only `remindersEnabled` — the configured hour/minute survive,
   * so re-enabling restores delivery at the previously chosen time (S-4.7.3).
   */
  async update(userId: string, input: UpdateSettingsInput): Promise<UserSettingsRecord> {
    const current = await userSettingsRepo.findByUser(userId);
    const next: UserSettingsRecord = { ...current };

    if (input.quizMode !== undefined) next.quizMode = parseMode(input.quizMode);
    if (input.quizAnswerFormat !== undefined) next.quizAnswerFormat = parseAnswerFormat(input.quizAnswerFormat);
    if (input.ratingExplainerSeen !== undefined) {
      next.ratingExplainerSeen = parseBoolean(input.ratingExplainerSeen, 'ratingExplainerSeen');
    }
    if (input.remindersEnabled !== undefined) {
      next.remindersEnabled = parseBoolean(input.remindersEnabled, 'remindersEnabled');
    }
    if (input.reminderHour !== undefined) next.reminderHour = parseWithinRange(input.reminderHour, 'reminderHour', 0, 23);
    if (input.reminderMinute !== undefined) {
      next.reminderMinute = parseWithinRange(input.reminderMinute, 'reminderMinute', 0, 59);
    }
    if (input.reminderTimezone !== undefined) next.reminderTimezone = parseTimezone(input.reminderTimezone);
    if (input.reminderChannels !== undefined) next.reminderChannels = parseChannels(input.reminderChannels);

    return userSettingsRepo.save(next);
  },
};

function parseMode(value: unknown): QuizMode {
  if (!QUIZ_MODES.includes(value as QuizMode)) {
    throw badRequest(`quizMode must be one of: ${QUIZ_MODES.join(', ')}`);
  }
  return value as QuizMode;
}

function parseAnswerFormat(value: unknown): AnswerFormat {
  if (!ANSWER_FORMATS.includes(value as AnswerFormat)) {
    throw badRequest(`quizAnswerFormat must be one of: ${ANSWER_FORMATS.join(', ')}`);
  }
  return value as AnswerFormat;
}

function parseBoolean(value: unknown, field: string): boolean {
  if (typeof value !== 'boolean') throw badRequest(`${field} must be true or false`);
  return value;
}

function parseWithinRange(value: unknown, field: string, min: number, max: number): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
    throw badRequest(`${field} must be a whole number between ${min} and ${max}`);
  }
  return parsed;
}

/**
 * Validated by asking the platform rather than against a hardcoded list — Node's ICU
 * data is the same thing the dispatcher later formats against, so anything that passes
 * here is guaranteed usable there.
 */
function parseTimezone(value: unknown): string {
  if (typeof value !== 'string' || !value.trim()) throw badRequest('reminderTimezone must be a time zone name');
  try {
    new Intl.DateTimeFormat('en-GB', { timeZone: value });
  } catch {
    throw badRequest(`Unknown time zone: ${value}`);
  }
  return value;
}

/** An empty list is valid and meaningful: it turns delivery off without losing the schedule. */
function parseChannels(value: unknown): string[] {
  if (!Array.isArray(value)) throw badRequest('reminderChannels must be a list');
  const channels = value.filter((channel): channel is string => typeof channel === 'string');
  const unknown = channels.filter((channel) => !REMINDER_CHANNELS.includes(channel as (typeof REMINDER_CHANNELS)[number]));
  if (unknown.length > 0) throw badRequest(`Unsupported notification channel: ${unknown.join(', ')}`);
  return [...new Set(channels)];
}
