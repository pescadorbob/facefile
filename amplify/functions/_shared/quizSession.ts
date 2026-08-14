import type {
  AnswerFormat,
  QuizDirection,
  QuizMode,
  QuizOption,
  QuizQuestion,
  QuizScope,
  QuizSession,
} from './quizTypes';

/**
 * Building a quiz session is pure: contacts and cards in, questions out. It lives
 * apart from quizService (which does the fetching) so every rule E-4.1/E-4.2/E-4.3
 * states — the four-option ceiling, distractors drawn from real contacts, graceful
 * degradation on a short list, the mixed-mode coin flip — is exercised directly
 * against known input rather than through a deployed stack.
 *
 * Randomness is injected for the same reason.
 */

/** The slice of a contact a question needs. Deliberately not the full ContactRecord. */
export interface QuizContact {
  id: string;
  name: string;
  photoPath: string | null;
  nameImage: string | null;
  associationScene: string | null;
}

/** The slice of a review card the scheduler needs. */
export interface QuizCard {
  contactId: string;
  nextReviewAt: string;
}

export interface BuildQuizSessionParams {
  contacts: QuizContact[];
  cards: QuizCard[];
  mode: QuizMode;
  scope: QuizScope;
  answerFormat: AnswerFormat;
  limit: number;
  now: Date;
  /** Set for the immediate post-add quiz (E-4.8): one question, this contact, schedule ignored. */
  onlyContactId?: string | null;
  random?: () => number;
}

/** Four options is the ceiling S-4.2.1 sets; a shorter contact list simply yields fewer. */
export const MAX_OPTIONS = 4;

export function buildQuizSession({
  contacts,
  cards,
  mode,
  scope,
  answerFormat,
  limit,
  now,
  onlyContactId = null,
  random = Math.random,
}: BuildQuizSessionParams): QuizSession {
  const nowIso = now.toISOString();
  const cardByContact = new Map(cards.map((card) => [card.contactId, card]));

  const dueCount = contacts.filter((contact) => {
    const card = cardByContact.get(contact.id);
    return card !== undefined && card.nextReviewAt <= nowIso;
  }).length;

  const nextReviewAt = contacts
    .map((contact) => cardByContact.get(contact.id)?.nextReviewAt)
    .filter((value): value is string => value !== undefined)
    .sort()[0] ?? null;

  const selected = selectContacts({ contacts, cardByContact, scope, limit, nowIso, onlyContactId, random });

  const questions = selected.map((contact) =>
    buildQuestion({ contact, others: contacts.filter((other) => other.id !== contact.id), mode, answerFormat, random }),
  );

  return { mode, scope, answerFormat, dueCount, contactCount: contacts.length, nextReviewAt, questions };
}

function selectContacts({
  contacts,
  cardByContact,
  scope,
  limit,
  nowIso,
  onlyContactId,
  random,
}: {
  contacts: QuizContact[];
  cardByContact: Map<string, QuizCard>;
  scope: QuizScope;
  limit: number;
  nowIso: string;
  onlyContactId: string | null;
  random: () => number;
}): QuizContact[] {
  if (onlyContactId) {
    const contact = contacts.find((candidate) => candidate.id === onlyContactId);
    return contact ? [contact] : [];
  }

  if (scope === 'due') {
    // Most overdue first, so a session cut short by `limit` spends its questions on
    // the cards that have been waiting longest rather than an arbitrary slice.
    const due = contacts
      .filter((contact) => {
        const card = cardByContact.get(contact.id);
        return card !== undefined && card.nextReviewAt <= nowIso;
      })
      .sort((a, b) => (cardByContact.get(a.id)!.nextReviewAt < cardByContact.get(b.id)!.nextReviewAt ? -1 : 1));
    return shuffle(due.slice(0, limit), random);
  }

  return shuffle([...contacts], random).slice(0, limit);
}

function buildQuestion({
  contact,
  others,
  mode,
  answerFormat,
  random,
}: {
  contact: QuizContact;
  others: QuizContact[];
  mode: QuizMode;
  answerFormat: AnswerFormat;
  random: () => number;
}): QuizQuestion {
  const photoDistractors = others.filter((other) => hasPhoto(other));
  // Name → Face needs a photo to point at and at least one plausible wrong photo,
  // otherwise there is no recognition task left to perform (S-4.2.3).
  const nameToFacePossible = hasPhoto(contact) && photoDistractors.length > 0;
  const direction = chooseDirection(mode, nameToFacePossible, random);

  const reveal = {
    name: contact.name,
    photoPath: contact.photoPath,
    nameImage: contact.nameImage,
    associationScene: contact.associationScene,
  };

  if (direction === 'name-to-face') {
    return {
      contactId: contact.id,
      direction,
      answerFormat: 'choice',
      prompt: { name: contact.name, photoPath: null },
      options: withDistractors(contact, photoDistractors, random),
      reveal,
    };
  }

  // Multiple choice needs wrong names to offer; with none available the question
  // degrades to a typed answer rather than presenting a list of one.
  const nameDistractors = others;
  const format: AnswerFormat = answerFormat === 'choice' && nameDistractors.length > 0 ? 'choice' : 'typed';

  return {
    contactId: contact.id,
    direction,
    answerFormat: format,
    prompt: { name: null, photoPath: contact.photoPath },
    options: format === 'choice' ? withDistractors(contact, nameDistractors, random) : [],
    reveal,
  };
}

/**
 * Mixed mode assigns each question a direction by coin flip, so both retrieval
 * directions are practised across a session (S-4.3.1). An explicit mode is honoured
 * except where the question cannot be built that way at all.
 */
function chooseDirection(mode: QuizMode, nameToFacePossible: boolean, random: () => number): QuizDirection {
  if (mode === 'name-to-face') return nameToFacePossible ? 'name-to-face' : 'face-to-name';
  if (mode === 'face-to-name') return 'face-to-name';
  if (!nameToFacePossible) return 'face-to-name';
  return random() < 0.5 ? 'name-to-face' : 'face-to-name';
}

/**
 * The correct contact plus up to three wrong ones drawn from the user's real list,
 * shuffled so the answer's position carries no signal. The pool is re-shuffled on
 * every call, so quizzing the same contact twice yields a different set of
 * distractors and pattern-matching the options can't stand in for recall (S-4.2.2).
 */
function withDistractors(contact: QuizContact, pool: QuizContact[], random: () => number): QuizOption[] {
  const distractors = shuffle([...pool], random).slice(0, MAX_OPTIONS - 1);
  return shuffle([contact, ...distractors], random).map(toOption);
}

function toOption(contact: QuizContact): QuizOption {
  return { contactId: contact.id, name: contact.name, photoPath: contact.photoPath };
}

function hasPhoto(contact: QuizContact): boolean {
  return typeof contact.photoPath === 'string' && contact.photoPath.length > 0;
}

/** Fisher-Yates, in place on the array handed in (callers always pass a copy). */
function shuffle<T>(items: T[], random: () => number): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}
