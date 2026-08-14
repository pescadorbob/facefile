/**
 * The vocabulary of a quiz session (F-4.1), kept in its own module so the
 * repositories can name a direction without pulling in the session builder.
 */

/** Which way round the retrieval runs. */
export type QuizDirection = 'face-to-name' | 'name-to-face';

/** What the user asked a session to contain. `mixed` is the default (S-4.3.1). */
export type QuizMode = 'mixed' | QuizDirection;

/** `due` honours the SM-2 schedule; `all` is deliberate over-practice (S-4.3.2). */
export type QuizScope = 'due' | 'all';

/** How a Face → Name question is answered (S-4.1.1). */
export type AnswerFormat = 'typed' | 'choice';

export const QUIZ_MODES: readonly QuizMode[] = ['mixed', 'face-to-name', 'name-to-face'];
export const QUIZ_SCOPES: readonly QuizScope[] = ['due', 'all'];
export const ANSWER_FORMATS: readonly AnswerFormat[] = ['typed', 'choice'];

/** A name/photo pair offered as a possible answer. Includes the correct one. */
export interface QuizOption {
  contactId: string;
  name: string;
  photoPath: string | null;
}

export interface QuizQuestion {
  contactId: string;
  direction: QuizDirection;
  /** Only meaningful for `face-to-name`; `name-to-face` is always a choice of photos. */
  answerFormat: AnswerFormat;
  /** What the card shows before the user answers — exactly one side of the pair. */
  prompt: { name: string | null; photoPath: string | null };
  options: QuizOption[];
  /**
   * What the reveal screen shows after answering (S-4.1.2). Sent with the question
   * rather than fetched on submit: for a photo-choice question the correct option is
   * inherent in the options the client already holds, so withholding the name would
   * hide nothing while costing a round trip mid-session.
   */
  reveal: {
    name: string;
    photoPath: string | null;
    nameImage: string | null;
    associationScene: string | null;
  };
}

export interface QuizSession {
  mode: QuizMode;
  scope: QuizScope;
  answerFormat: AnswerFormat;
  /** Cards due right now, regardless of how many this session actually took. */
  dueCount: number;
  contactCount: number;
  /** Earliest upcoming review, or null when the user has no cards at all. */
  nextReviewAt: string | null;
  questions: QuizQuestion[];
}
