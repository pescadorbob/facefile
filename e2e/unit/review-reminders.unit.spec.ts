import { describe, expect, test } from '@jest/globals';
import {
  REMINDER_LINK,
  decideReminder,
  reminderMessage,
  type ReminderSettings,
} from '../../amplify/functions/_shared/reminderSchedule';
import { buildUpcomingReviews } from '../../amplify/functions/_shared/upcomingReviews';

/**
 * F-4.3 — Review Dashboard and Reminders. Both the reminder decision and the upcoming
 * grouping are driven against a fixed instant, which is the only way "at the time the
 * user configured, in their own timezone" is checkable without waiting for a clock.
 */

/** 08:30 UTC — which is 18:30 the same day in Sydney and 04:30 in New York. */
const NOW = new Date('2026-08-13T08:30:00.000Z');

function settings(overrides: Partial<ReminderSettings> = {}): ReminderSettings {
  return {
    remindersEnabled: true,
    reminderHour: 8,
    reminderMinute: 0,
    reminderTimezone: 'UTC',
    reminderChannels: ['in-app'],
    lastReminderSentOn: null,
    ...overrides,
  };
}

describe('S-4.7.1 User receives notification when reviews due', () => {
  test('a reminder goes out on a day with contacts due', () => {
    // GIVEN a user with reminders on and three contacts due
    // WHEN the reminder sweep runs after their configured time
    const decision = decideReminder({ settings: settings(), dueCount: 3, now: NOW });

    // THEN a reminder is sent
    expect(decision.send).toBe(true);
  });

  test('the reminder says how many are due and links to the session', () => {
    // GIVEN a user with three contacts due
    // WHEN the reminder is composed
    const decision = decideReminder({ settings: settings(), dueCount: 3, now: NOW });

    // THEN it states the count and points at a due-review session
    expect(decision.send && decision.message).toContain('3 contacts');
    expect(decision.send && decision.link).toBe(REMINDER_LINK);
  });

  test('a single due contact is described in the singular', () => {
    // GIVEN exactly one contact due
    // WHEN the reminder is composed
    // THEN the wording matches
    expect(reminderMessage(1)).toContain('1 contact is due');
    expect(reminderMessage(2)).toContain('2 contacts are due');
  });

  test('no reminder goes out once the day’s reviews are all done', () => {
    // GIVEN a user with reminders on who has already cleared their queue
    // WHEN the reminder sweep runs
    const decision = decideReminder({ settings: settings(), dueCount: 0, now: NOW });

    // THEN nothing is sent
    expect(decision.send).toBe(false);
    expect(decision.send === false && decision.reason).toBe('nothing-due');
  });

  test('a user with no channel enabled is skipped rather than errored', () => {
    // GIVEN a user who has turned every delivery channel off
    // WHEN the reminder sweep runs with contacts due
    const decision = decideReminder({ settings: settings({ reminderChannels: [] }), dueCount: 5, now: NOW });

    // THEN they are quietly passed over
    expect(decision.send).toBe(false);
    expect(decision.send === false && decision.reason).toBe('no-channel-enabled');
  });

  test('only one reminder is sent per day however often the sweep runs', () => {
    // GIVEN a user already reminded today
    const already = settings({ lastReminderSentOn: '2026-08-13' });

    // WHEN the sweep runs again the same day
    const decision = decideReminder({ settings: already, dueCount: 4, now: NOW });

    // THEN no second reminder goes out
    expect(decision.send).toBe(false);
    expect(decision.send === false && decision.reason).toBe('already-sent-today');
  });

  test('a reminder sent yesterday does not block today’s', () => {
    // GIVEN a user last reminded the previous day
    const yesterday = settings({ lastReminderSentOn: '2026-08-12' });

    // WHEN the sweep runs today with contacts due
    const decision = decideReminder({ settings: yesterday, dueCount: 4, now: NOW });

    // THEN today's reminder is sent
    expect(decision.send).toBe(true);
  });
});

describe('S-4.7.2 User configures reminder time of day', () => {
  test('nothing is sent before the configured time of day', () => {
    // GIVEN a user who asked for reminders at 09:00, with the local clock at 08:30
    // WHEN the sweep runs
    const decision = decideReminder({ settings: settings({ reminderHour: 9 }), dueCount: 2, now: NOW });

    // THEN the reminder waits
    expect(decision.send).toBe(false);
    expect(decision.send === false && decision.reason).toBe('before-configured-time');
  });

  test('the reminder goes out once the configured time has passed', () => {
    // GIVEN a user who asked for reminders at 08:00, with the local clock at 08:30
    // WHEN the sweep runs
    const decision = decideReminder({ settings: settings({ reminderHour: 8, reminderMinute: 0 }), dueCount: 2, now: NOW });

    // THEN it is sent
    expect(decision.send).toBe(true);
  });

  test('the minute of the configured time is respected, not just the hour', () => {
    // GIVEN a user who asked for 08:45, with the local clock at 08:30
    // WHEN the sweep runs
    const decision = decideReminder({
      settings: settings({ reminderHour: 8, reminderMinute: 45 }),
      dueCount: 2,
      now: NOW,
    });

    // THEN it is still too early
    expect(decision.send).toBe(false);
    expect(decision.send === false && decision.reason).toBe('before-configured-time');
  });

  test('the configured time is read in the user’s own timezone', () => {
    // GIVEN two users who both asked for 09:00 — one in Sydney, one in New York —
    // at the same instant, when it is 18:30 in Sydney and 04:30 in New York
    const sydney = decideReminder({
      settings: settings({ reminderHour: 9, reminderTimezone: 'Australia/Sydney' }),
      dueCount: 2,
      now: NOW,
    });
    const newYork = decideReminder({
      settings: settings({ reminderHour: 9, reminderTimezone: 'America/New_York' }),
      dueCount: 2,
      now: NOW,
    });

    // THEN the Sydney user's 09:00 has passed and the New York user's has not
    expect(sydney.send).toBe(true);
    expect(newYork.send).toBe(false);
  });

  test('the once-a-day key is the user’s local date, not the UTC one', () => {
    // GIVEN a user in Sydney, where the same instant is already the following day
    const decision = decideReminder({
      settings: settings({ reminderHour: 9, reminderTimezone: 'Australia/Sydney' }),
      dueCount: 2,
      now: new Date('2026-08-13T22:00:00.000Z'),
    });

    // WHEN the sweep runs
    // THEN the day it records is their day
    expect(decision.localDate).toBe('2026-08-14');
  });

  test('changing the time takes effect from the next sweep onwards', () => {
    // GIVEN a user whose reminder was waiting for 09:00
    const before = decideReminder({ settings: settings({ reminderHour: 9 }), dueCount: 2, now: NOW });
    expect(before.send).toBe(false);

    // WHEN they move it earlier, to 08:00
    const after = decideReminder({ settings: settings({ reminderHour: 8 }), dueCount: 2, now: NOW });

    // THEN the very next sweep sends it
    expect(after.send).toBe(true);
  });
});

describe('S-4.7.3 User disables reminders without losing schedule', () => {
  test('turning reminders off stops delivery immediately', () => {
    // GIVEN a user who has just turned reminders off, with contacts due
    // WHEN the sweep runs
    const decision = decideReminder({ settings: settings({ remindersEnabled: false }), dueCount: 6, now: NOW });

    // THEN nothing is sent
    expect(decision.send).toBe(false);
    expect(decision.send === false && decision.reason).toBe('reminders-disabled');
  });

  test('turning them back on restores delivery at the time they had chosen', () => {
    // GIVEN a user who had configured 08:00 and then disabled reminders
    const disabled = settings({ remindersEnabled: false, reminderHour: 8, reminderMinute: 0 });

    // WHEN they enable them again, changing nothing else
    const reEnabled = decideReminder({ settings: { ...disabled, remindersEnabled: true }, dueCount: 2, now: NOW });

    // THEN the reminder resumes at their original time
    expect(reEnabled.send).toBe(true);
  });
});

describe('S-4.6.2 User views upcoming reviews by date', () => {
  const contacts = [
    { id: 'a', name: 'Ada', photoPath: null },
    { id: 'p', name: 'Priya', photoPath: null },
    { id: 's', name: 'Sam', photoPath: null },
    { id: 'z', name: 'Zeno', photoPath: null },
  ];

  test('reviews are grouped by the day they fall on', () => {
    // GIVEN three contacts due across two different days
    const cards = [
      { contactId: 'a', nextReviewAt: '2026-08-14T06:00:00.000Z' },
      { contactId: 'p', nextReviewAt: '2026-08-14T20:00:00.000Z' },
      { contactId: 's', nextReviewAt: '2026-08-16T09:00:00.000Z' },
    ];

    // WHEN the upcoming view is built
    const upcoming = buildUpcomingReviews({ contacts, cards, now: NOW, timeZone: 'UTC' });

    // THEN each day carries its own count and names
    expect(upcoming.days.map(day => day.date)).toEqual(['2026-08-14', '2026-08-16']);
    expect(upcoming.days[0].count).toBe(2);
    expect(upcoming.days[0].contacts.map(c => c.name)).toEqual(['Ada', 'Priya']);
    expect(upcoming.days[1].contacts.map(c => c.name)).toEqual(['Sam']);
  });

  test('days with nothing due are left out entirely', () => {
    // GIVEN a single contact due four days from now
    const cards = [{ contactId: 'a', nextReviewAt: '2026-08-17T09:00:00.000Z' }];

    // WHEN the upcoming view is built
    const upcoming = buildUpcomingReviews({ contacts, cards, now: NOW, timeZone: 'UTC' });

    // THEN only that day appears — the empty ones in between are not listed
    expect(upcoming.days).toHaveLength(1);
    expect(upcoming.days[0].date).toBe('2026-08-17');
  });

  test('the view covers fourteen days and stops there', () => {
    // GIVEN one contact due on the last day of the window and one just past it
    const cards = [
      { contactId: 'a', nextReviewAt: '2026-08-26T09:00:00.000Z' },
      { contactId: 'p', nextReviewAt: '2026-08-27T09:00:00.000Z' },
    ];

    // WHEN the upcoming view is built
    const upcoming = buildUpcomingReviews({ contacts, cards, now: NOW, timeZone: 'UTC' });

    // THEN the day inside the window is shown and the one beyond it is not
    expect(upcoming.horizonDays).toBe(14);
    expect(upcoming.days.map(day => day.date)).toEqual(['2026-08-26']);
  });

  test('anything already overdue is listed under today', () => {
    // GIVEN a contact whose review date passed three days ago
    const cards = [{ contactId: 'a', nextReviewAt: '2026-08-10T09:00:00.000Z' }];

    // WHEN the upcoming view is built
    const upcoming = buildUpcomingReviews({ contacts, cards, now: NOW, timeZone: 'UTC' });

    // THEN it appears under today rather than in the past
    expect(upcoming.days).toHaveLength(1);
    expect(upcoming.days[0].date).toBe(upcoming.today);
  });

  test('days are grouped in the user’s own timezone', () => {
    // GIVEN a review at 22:00 UTC, which is already the next day in Sydney
    const cards = [{ contactId: 'a', nextReviewAt: '2026-08-14T22:00:00.000Z' }];

    // WHEN the upcoming view is built for each timezone
    const utc = buildUpcomingReviews({ contacts, cards, now: NOW, timeZone: 'UTC' });
    const sydney = buildUpcomingReviews({ contacts, cards, now: NOW, timeZone: 'Australia/Sydney' });

    // THEN each user sees it on their own calendar day
    expect(utc.days[0].date).toBe('2026-08-14');
    expect(sydney.days[0].date).toBe('2026-08-15');
  });

  test('a card whose contact no longer exists is not listed', () => {
    // GIVEN a leftover card pointing at a deleted contact
    const cards = [{ contactId: 'gone', nextReviewAt: '2026-08-15T09:00:00.000Z' }];

    // WHEN the upcoming view is built
    const upcoming = buildUpcomingReviews({ contacts, cards, now: NOW, timeZone: 'UTC' });

    // THEN nothing is shown for it
    expect(upcoming.days).toHaveLength(0);
  });
});
