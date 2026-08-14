/**
 * When a review reminder is due (E-4.7), expressed as a pure decision so every rule
 * in S-4.7.1 / S-4.7.2 / S-4.7.3 can be exercised against a fixed clock instead of by
 * waiting for a scheduler to fire.
 */

export interface ReminderSettings {
  remindersEnabled: boolean;
  reminderHour: number;
  reminderMinute: number;
  reminderTimezone: string;
  reminderChannels: string[];
  lastReminderSentOn: string | null;
}

export type SkipReason =
  | 'no-channel-enabled'
  | 'reminders-disabled'
  | 'nothing-due'
  | 'already-sent-today'
  | 'before-configured-time';

export type ReminderDecision =
  | { send: true; localDate: string; message: string; link: string }
  | { send: false; localDate: string; reason: SkipReason };

/** Where a reminder takes the user: straight into a session of the due cards. */
export const REMINDER_LINK = '/quiz?scope=due&start=1';

export function decideReminder({
  settings,
  dueCount,
  now,
}: {
  settings: ReminderSettings;
  dueCount: number;
  now: Date;
}): ReminderDecision {
  const { date: localDate, minutesSinceMidnight } = localWallClock(now, settings.reminderTimezone);

  // Ordered cheapest-and-most-absolute first. A user with no channel enabled is a
  // no-op rather than an error — the setting is simply skipped (S-4.7.1).
  if (settings.reminderChannels.length === 0) return { send: false, localDate, reason: 'no-channel-enabled' };
  if (!settings.remindersEnabled) return { send: false, localDate, reason: 'reminders-disabled' };
  // Having already cleared the day's reviews is indistinguishable from never having
  // had any: either way there is nothing to be reminded about (S-4.7.1).
  if (dueCount <= 0) return { send: false, localDate, reason: 'nothing-due' };
  if (settings.lastReminderSentOn === localDate) return { send: false, localDate, reason: 'already-sent-today' };

  const configured = settings.reminderHour * 60 + settings.reminderMinute;
  // `>=`, not `===`: the sweep runs on a coarse tick and must still fire for a user
  // whose minute fell between two runs. The once-a-day guard above keeps it to one.
  if (minutesSinceMidnight < configured) return { send: false, localDate, reason: 'before-configured-time' };

  return { send: true, localDate, message: reminderMessage(dueCount), link: REMINDER_LINK };
}

export function reminderMessage(dueCount: number): string {
  return dueCount === 1
    ? '1 contact is due for review. Tap to start your session.'
    : `${dueCount} contacts are due for review. Tap to start your session.`;
}

/**
 * The user's own wall clock. The reminder time is a local time by definition —
 * "9:00" means 9:00 where they are (S-4.7.2) — so both the comparison and the
 * once-a-day date key have to be computed in their timezone, not UTC.
 *
 * `en-CA` because its date format is already ISO-ordered; the parts are read
 * individually rather than by parsing the formatted string.
 */
export function localWallClock(now: Date, timeZone: string): { date: string; minutesSinceMidnight: number } {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);

  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? '00';

  return {
    date: `${get('year')}-${get('month')}-${get('day')}`,
    minutesSinceMidnight: Number(get('hour')) * 60 + Number(get('minute')),
  };
}
