// SM-2 spaced repetition, F-4.2. Descended from backend/src/services/sm2.js —
// the algorithm itself doesn't change with the storage backend, but two things
// did change when E-4.5 gave it acceptance criteria of its own:
//
//   1. `now` is a parameter rather than `new Date()` read inside. S-4.5.1
//      requires the calculation to be idempotent — replaying the same rating
//      against the same state must produce the same result — which a function
//      that reads the clock itself cannot satisfy.
//   2. Callers pass a named recall rating, not a raw 0-5 quality. The four
//      buttons the user actually sees (Forgot / Hard / Good / Easy) are the
//      domain vocabulary; the quality number is an implementation detail of
//      this module and is recorded alongside the rating for analytics.

export type RecallRating = 'forgot' | 'hard' | 'good' | 'easy';

export const RECALL_RATINGS: readonly RecallRating[] = ['forgot', 'hard', 'good', 'easy'];

/** SM-2's 0-5 quality scale. Only `forgot` is a failed recall (quality < 3). */
const RATING_QUALITY: Record<RecallRating, number> = {
  forgot: 0,
  hard: 3,
  good: 4,
  easy: 5,
};

export const MIN_EASE_FACTOR = 1.3;
/** S-4.5.2 states the lapse penalty explicitly rather than deriving it from the quality curve. */
const LAPSE_EASE_PENALTY = 0.2;

export const DEFAULT_CARD_STATE: ReviewCardState = { easeFactor: 2.5, interval: 0, repetitions: 0, lapses: 0 };

export interface ReviewCardState {
  easeFactor: number;
  interval: number;
  repetitions: number;
  /** Count of "Forgot" ratings — kept for the lapse analytics S-4.5.2 asks for. */
  lapses: number;
}

export interface Sm2Result extends ReviewCardState {
  quality: number;
  /** Whole days until the next review. Always >= 1. */
  interval: number;
  nextReviewAt: Date;
}

export function isRecallRating(value: unknown): value is RecallRating {
  return typeof value === 'string' && (RECALL_RATINGS as readonly string[]).includes(value);
}

export function qualityFor(rating: RecallRating): number {
  return RATING_QUALITY[rating];
}

/**
 * Applies one recall rating to a card's schedule.
 *
 * Pure: same (card, rating, now) always yields the same result, and nothing here
 * reads the clock, a database, or global state.
 *
 * The `forgot` branch deliberately does NOT use SM-2's quality curve for the
 * easiness factor. At quality 0 that curve subtracts 0.8, which collapses a card
 * to the 1.3 floor after a single slip; S-4.5.2 specifies a flat 0.2 lapse
 * penalty instead, which is the variant in common use (Anki and friends) and the
 * behaviour this product committed to.
 */
export function applyRating(card: ReviewCardState, rating: RecallRating, now: Date): Sm2Result {
  const quality = RATING_QUALITY[rating];
  const easeFactor = card.easeFactor || DEFAULT_CARD_STATE.easeFactor;

  if (rating === 'forgot') {
    return {
      quality,
      easeFactor: roundEase(Math.max(MIN_EASE_FACTOR, easeFactor - LAPSE_EASE_PENALTY)),
      interval: 1,
      repetitions: 0,
      lapses: (card.lapses ?? 0) + 1,
      nextReviewAt: addDays(now, 1),
    };
  }

  const repetitions = (card.repetitions ?? 0) + 1;
  const interval =
    repetitions === 1 ? 1 : repetitions === 2 ? 6 : Math.max(1, Math.round((card.interval || 1) * easeFactor));

  return {
    quality,
    easeFactor: roundEase(
      Math.max(MIN_EASE_FACTOR, easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)),
    ),
    interval,
    repetitions,
    lapses: card.lapses ?? 0,
    nextReviewAt: addDays(now, interval),
  };
}

/** Floating-point noise compounds over many reviews; two decimals is finer than SM-2 needs. */
function roundEase(value: number): number {
  return Math.round(value * 100) / 100;
}

function addDays(from: Date, days: number): Date {
  const next = new Date(from.getTime());
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}
