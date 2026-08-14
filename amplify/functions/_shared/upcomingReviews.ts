import { localWallClock } from './reminderSchedule';

/**
 * The "Upcoming" view (S-4.6.2): reviews grouped by the day they fall on, for a fixed
 * horizon, with empty days left out. Pure — dates in, buckets out — so the grouping,
 * the horizon boundary and the overdue roll-up can be checked against a fixed clock.
 */

export const DEFAULT_HORIZON_DAYS = 14;

export interface UpcomingContact {
  id: string;
  name: string;
  photoPath: string | null;
}

export interface UpcomingDay {
  /** `YYYY-MM-DD` in the user's own timezone. */
  date: string;
  count: number;
  contacts: UpcomingContact[];
}

export interface UpcomingReviews {
  horizonDays: number;
  timeZone: string;
  today: string;
  days: UpcomingDay[];
}

export function buildUpcomingReviews({
  contacts,
  cards,
  now,
  timeZone,
  horizonDays = DEFAULT_HORIZON_DAYS,
}: {
  contacts: UpcomingContact[];
  cards: { contactId: string; nextReviewAt: string }[];
  now: Date;
  timeZone: string;
  horizonDays?: number;
}): UpcomingReviews {
  const today = localWallClock(now, timeZone).date;
  const lastDay = localWallClock(addDays(now, horizonDays - 1), timeZone).date;

  const contactById = new Map(contacts.map((contact) => [contact.id, contact]));
  const buckets = new Map<string, UpcomingContact[]>();

  for (const card of cards) {
    const contact = contactById.get(card.contactId);
    // A card whose contact is gone has nothing to show a name for; skip rather than
    // render a blank row.
    if (!contact) continue;

    // Anything already overdue belongs to today — it is due now, not on the day it
    // originally became due, and a past date in an "upcoming" list reads as a bug.
    const dueDate = localWallClock(new Date(card.nextReviewAt), timeZone).date;
    const date = dueDate < today ? today : dueDate;
    if (date > lastDay) continue;

    const bucket = buckets.get(date) ?? [];
    bucket.push(contact);
    buckets.set(date, bucket);
  }

  const days = [...buckets.entries()]
    // Days with nothing due are never added in the first place, which is what keeps
    // the list concise (S-4.6.2) — there is no empty bucket to filter out.
    .map(([date, dayContacts]) => ({
      date,
      count: dayContacts.length,
      contacts: [...dayContacts].sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return { horizonDays, timeZone, today, days };
}

function addDays(from: Date, days: number): Date {
  return new Date(from.getTime() + days * 24 * 60 * 60 * 1000);
}
