import { badRequest, notFound } from './http';
import { contactsRepo } from './contactsRepo';
import { reviewCardsRepo, type ReviewCardRecord } from './reviewCardsRepo';
import { quizResultsRepo, type QuizResultRecord } from './quizResultsRepo';
import { buildQuizSession, type QuizContact } from './quizSession';
import {
  ANSWER_FORMATS,
  QUIZ_MODES,
  QUIZ_SCOPES,
  type AnswerFormat,
  type QuizDirection,
  type QuizMode,
  type QuizScope,
  type QuizSession,
} from './quizTypes';
import { applyRating, isRecallRating, qualityFor, type RecallRating } from './sm2';
import { userSettingsRepo } from './userSettingsRepo';

/** Long enough to be a real session, short enough that a session ends. */
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

export interface StartSessionInput {
  mode?: string | null;
  scope?: string | null;
  answerFormat?: string | null;
  limit?: string | null;
  contactId?: string | null;
}

export interface RecordAnswerInput {
  contactId?: unknown;
  direction?: unknown;
  rating?: unknown;
  correct?: unknown;
}

export interface RecordAnswerResult {
  quizResult: QuizResultRecord;
  reviewCard: ReviewCardRecord;
}

export const quizService = {
  /**
   * Assembles a session for the user. Anything the caller leaves unset falls back to the
   * user's stored preference rather than a constant — that is what makes mixed mode "the
   * default unless the user has overridden their preference" (S-4.3.1) true of every
   * entry point into a quiz, not just the start screen.
   */
  async startSession(userId: string, input: StartSessionInput): Promise<QuizSession> {
    const [contacts, cards, settings] = await Promise.all([
      contactsRepo.findAllByUser(userId),
      reviewCardsRepo.findAllByUser(userId),
      userSettingsRepo.findByUser(userId),
    ]);

    return buildQuizSession({
      contacts: contacts.map(toQuizContact),
      cards: cards.map((card) => ({ contactId: card.contactId, nextReviewAt: card.nextReviewAt })),
      mode: parseEnum(input.mode, QUIZ_MODES, 'mode') ?? settings.quizMode,
      scope: parseEnum(input.scope, QUIZ_SCOPES, 'scope') ?? 'due',
      answerFormat: parseEnum(input.answerFormat, ANSWER_FORMATS, 'answerFormat') ?? settings.quizAnswerFormat,
      limit: parseLimit(input.limit),
      now: new Date(),
      onlyContactId: input.contactId ?? null,
    });
  },

  /**
   * Records one answered question: the review history row (S-4.4.1) and the recomputed
   * SM-2 schedule (S-4.5.1) are written together, because a rating that moved the card
   * but left no history — or the reverse — is not a state this app has a meaning for.
   */
  async recordAnswer(userId: string, input: RecordAnswerInput): Promise<RecordAnswerResult> {
    const contactId = requireString(input.contactId, 'contactId');
    const rating = requireRating(input.rating);
    const direction = requireDirection(input.direction);
    const correct = input.correct === true;

    const contact = await contactsRepo.findById(userId, contactId);
    if (!contact) throw notFound('Contact not found');

    const existing = (await reviewCardsRepo.findByContact(userId, contactId)) ?? reviewCardsRepo.newCardFor(userId, contactId);
    const answeredAt = new Date();
    const schedule = applyRating(
      {
        easeFactor: existing.easeFactor,
        interval: existing.interval,
        repetitions: existing.repetitions,
        lapses: existing.lapses ?? 0,
      },
      rating,
      answeredAt,
    );

    const [reviewCard, quizResult] = await Promise.all([
      reviewCardsRepo.save({
        ...existing,
        easeFactor: schedule.easeFactor,
        interval: schedule.interval,
        repetitions: schedule.repetitions,
        lapses: schedule.lapses,
        nextReviewAt: schedule.nextReviewAt.toISOString(),
      }),
      quizResultsRepo.create({
        userId,
        contactId,
        direction,
        rating,
        quality: qualityFor(rating),
        correct,
        lapse: rating === 'forgot',
        answeredAt: answeredAt.toISOString(),
      }),
    ]);

    return { quizResult, reviewCard };
  },

  /** The contact's review history, newest first — what the lapse analytics read. */
  history(userId: string, contactId: string): Promise<QuizResultRecord[]> {
    return quizResultsRepo.findAllByContact(userId, contactId);
  },
};

function toQuizContact(contact: {
  id: string;
  name: string;
  photoPath: string | null;
  nameImage: string | null;
  associationScene: string | null;
}): QuizContact {
  return {
    id: contact.id,
    name: contact.name,
    photoPath: contact.photoPath,
    nameImage: contact.nameImage,
    associationScene: contact.associationScene,
  };
}

/** Returns undefined (not a default) for an absent value, so callers choose their own fallback. */
function parseEnum<T extends string>(value: string | null | undefined, allowed: readonly T[], field: string): T | undefined {
  if (value === null || value === undefined || value === '') return undefined;
  if (!allowed.includes(value as T)) throw badRequest(`${field} must be one of: ${allowed.join(', ')}`);
  return value as T;
}

function parseLimit(value: string | null | undefined): number {
  if (!value) return DEFAULT_LIMIT;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) throw badRequest('limit must be a whole number of at least 1');
  return Math.min(parsed, MAX_LIMIT);
}

function requireString(value: unknown, field: string): string {
  if (typeof value !== 'string' || !value.trim()) throw badRequest(`${field} is required`);
  return value.trim();
}

function requireRating(value: unknown): RecallRating {
  if (!isRecallRating(value)) throw badRequest('rating must be one of: forgot, hard, good, easy');
  return value;
}

function requireDirection(value: unknown): QuizDirection {
  if (value !== 'face-to-name' && value !== 'name-to-face') {
    throw badRequest('direction must be one of: face-to-name, name-to-face');
  }
  return value;
}

export type { QuizMode, QuizScope, AnswerFormat };
