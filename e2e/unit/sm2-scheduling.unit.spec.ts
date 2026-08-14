import { describe, expect, test } from '@jest/globals';
import {
  DEFAULT_CARD_STATE,
  MIN_EASE_FACTOR,
  applyRating,
  qualityFor,
  type ReviewCardState,
} from '../../amplify/functions/_shared/sm2';

/**
 * E-4.5 — Interval Calculation and Storage.
 *
 * A fixed clock throughout: every assertion about "the following day" or "six days
 * out" is only meaningful against a known `now`, and passing one in is also what
 * makes the idempotency criterion checkable at all.
 */
const NOW = new Date('2026-08-13T10:00:00.000Z');

function card(overrides: Partial<ReviewCardState> = {}): ReviewCardState {
  return { ...DEFAULT_CARD_STATE, ...overrides };
}

function daysBetween(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000));
}

describe('S-4.5.1 System calculates next review date via SM-2', () => {
  test('a first successful recall schedules the next review one day out', () => {
    // GIVEN a contact that has never been reviewed
    // WHEN the user rates their recall "Good"
    const result = applyRating(card(), 'good', NOW);

    // THEN the interval, repetition count and next review date all advance together
    expect(result.repetitions).toBe(1);
    expect(result.interval).toBe(1);
    expect(daysBetween(NOW, result.nextReviewAt)).toBe(1);
  });

  test('a second successful recall schedules the next review six days out', () => {
    // GIVEN a contact recalled successfully once already
    // WHEN the user rates their recall "Good" again
    const result = applyRating(card({ repetitions: 1, interval: 1 }), 'good', NOW);

    // THEN the interval widens to the SM-2 second step
    expect(result.repetitions).toBe(2);
    expect(result.interval).toBe(6);
    expect(daysBetween(NOW, result.nextReviewAt)).toBe(6);
  });

  test('later successful recalls multiply the interval by the easiness factor', () => {
    // GIVEN a contact with an established interval and easiness factor
    // WHEN the user recalls it successfully again
    const result = applyRating(card({ repetitions: 2, interval: 6, easeFactor: 2.5 }), 'good', NOW);

    // THEN the next interval is the previous one stretched by that easiness factor
    expect(result.interval).toBe(15);
    expect(daysBetween(NOW, result.nextReviewAt)).toBe(15);
  });

  test('the easiness factor rises on an easy recall and falls on a hard one', () => {
    // GIVEN two contacts in the same state
    // WHEN one is rated "Easy" and the other "Hard"
    const easy = applyRating(card({ repetitions: 2, interval: 6 }), 'easy', NOW);
    const hard = applyRating(card({ repetitions: 2, interval: 6 }), 'hard', NOW);

    // THEN the easy one becomes easier to keep and the hard one harder
    expect(easy.easeFactor).toBeGreaterThan(DEFAULT_CARD_STATE.easeFactor);
    expect(hard.easeFactor).toBeLessThan(DEFAULT_CARD_STATE.easeFactor);
  });

  test('a hard rating still counts as a successful recall', () => {
    // GIVEN a contact recalled once already
    // WHEN the user rates their recall "Hard"
    const result = applyRating(card({ repetitions: 1, interval: 1 }), 'hard', NOW);

    // THEN the repetition count keeps climbing — effortful recall is still recall
    expect(result.repetitions).toBe(2);
    expect(result.lapses).toBe(0);
    expect(qualityFor('hard')).toBeGreaterThanOrEqual(3);
  });

  test('replaying the same rating on the same state produces the same result', () => {
    // GIVEN one card state and one rating
    const state = card({ repetitions: 4, interval: 21, easeFactor: 2.36, lapses: 1 });

    // WHEN the rating is applied twice
    const first = applyRating(state, 'good', NOW);
    const second = applyRating(state, 'good', NOW);

    // THEN both calculations agree exactly, and neither mutated the state it read
    expect(second).toEqual(first);
    expect(state).toEqual({ repetitions: 4, interval: 21, easeFactor: 2.36, lapses: 1 });
  });
});

describe('S-4.5.2 System resets interval on forgot rating', () => {
  test('a forgot rating brings the next review back to the following day', () => {
    // GIVEN a well-established contact reviewed at three-week intervals
    // WHEN the user rates their recall "Forgot"
    const result = applyRating(card({ repetitions: 5, interval: 21, easeFactor: 2.5 }), 'forgot', NOW);

    // THEN the schedule restarts from the beginning of the learning curve
    expect(result.interval).toBe(1);
    expect(daysBetween(NOW, result.nextReviewAt)).toBe(1);
  });

  test('a forgot rating reduces the easiness factor by 0.2', () => {
    // GIVEN a contact at the default easiness factor
    // WHEN the user rates their recall "Forgot"
    const result = applyRating(card({ easeFactor: 2.5 }), 'forgot', NOW);

    // THEN the easiness factor drops by exactly the lapse penalty
    expect(result.easeFactor).toBeCloseTo(2.3, 5);
  });

  test('the easiness factor never falls below the floor however often it lapses', () => {
    // GIVEN a contact already at the minimum easiness factor
    // WHEN the user forgets it again
    const result = applyRating(card({ easeFactor: MIN_EASE_FACTOR }), 'forgot', NOW);

    // THEN it holds at the floor rather than sinking further
    expect(result.easeFactor).toBe(MIN_EASE_FACTOR);
  });

  test('a forgot rating resets the repetition count to zero', () => {
    // GIVEN a contact with five successful repetitions behind it
    // WHEN the user rates their recall "Forgot"
    const result = applyRating(card({ repetitions: 5, interval: 21 }), 'forgot', NOW);

    // THEN the repetition count starts again
    expect(result.repetitions).toBe(0);
  });

  test('the lapse is counted so it can be reported on later', () => {
    // GIVEN a contact that has lapsed once before
    // WHEN the user forgets it again
    const result = applyRating(card({ lapses: 1 }), 'forgot', NOW);

    // THEN the lapse count records the new event
    expect(result.lapses).toBe(2);
  });

  test('a successful recall leaves the lapse history untouched', () => {
    // GIVEN a contact that has lapsed once before
    // WHEN the user recalls it successfully
    const result = applyRating(card({ lapses: 1, repetitions: 0 }), 'good', NOW);

    // THEN the earlier lapse is still on record
    expect(result.lapses).toBe(1);
  });
});
