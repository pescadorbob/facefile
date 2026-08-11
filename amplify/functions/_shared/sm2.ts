// Direct port of backend/src/services/sm2.js — the algorithm itself doesn't
// change with the storage backend.

export interface ReviewCardState {
  easeFactor: number;
  interval: number;
  repetitions: number;
}

export interface Sm2Result extends ReviewCardState {
  nextReviewAt: Date;
}

/**
 * SM-2 spaced repetition algorithm.
 * quality: 0-5 (FaceFile uses 1=Hard, 3=Good, 5=Easy)
 */
export function sm2(card: ReviewCardState, quality: number): Sm2Result {
  let { easeFactor, interval, repetitions } = card;

  if (quality < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 6;
    else interval = Math.round(interval * easeFactor);
    repetitions += 1;
  }

  easeFactor = Math.max(1.3, easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

  const nextReviewAt = new Date();
  nextReviewAt.setDate(nextReviewAt.getDate() + interval);

  return { easeFactor, interval, repetitions, nextReviewAt };
}
