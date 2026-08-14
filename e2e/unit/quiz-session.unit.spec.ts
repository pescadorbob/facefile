import { describe, expect, test } from '@jest/globals';
import {
  MAX_OPTIONS,
  buildQuizSession,
  type BuildQuizSessionParams,
  type QuizCard,
  type QuizContact,
} from '../../amplify/functions/_shared/quizSession';

/**
 * F-4.1 — Quiz Session Management. Drives the session builder straight, so the rules
 * about directions, distractors and due-only sessions are checked against known
 * contacts rather than whatever a database happens to hold.
 */
const NOW = new Date('2026-08-13T10:00:00.000Z');
const YESTERDAY = '2026-08-12T10:00:00.000Z';
const NEXT_WEEK = '2026-08-20T10:00:00.000Z';

function contact(name: string, overrides: Partial<QuizContact> = {}): QuizContact {
  return {
    id: `id-${name.toLowerCase()}`,
    name,
    photoPath: `https://photos.example/${name.toLowerCase()}.jpg`,
    nameImage: `${name} as a vivid image`,
    associationScene: `${name} doing something absurd at the coat rack`,
    ...overrides,
  };
}

function dueCard(contactId: string): QuizCard {
  return { contactId, nextReviewAt: YESTERDAY };
}

function futureCard(contactId: string): QuizCard {
  return { contactId, nextReviewAt: NEXT_WEEK };
}

function build(overrides: Partial<BuildQuizSessionParams> = {}) {
  const contacts = overrides.contacts ?? [contact('Priya'), contact('Sam'), contact('Tom'), contact('Ada'), contact('Rey')];
  return buildQuizSession({
    contacts,
    cards: contacts.map(c => dueCard(c.id)),
    mode: 'mixed',
    scope: 'due',
    answerFormat: 'choice',
    limit: 20,
    now: NOW,
    ...overrides,
  });
}

describe('S-4.1.1 User is shown photo and recalls name', () => {
  test('a face-to-name card shows the photo and never the name', () => {
    // GIVEN a session fixed to the face-first direction
    // WHEN the questions are built
    const session = build({ mode: 'face-to-name', answerFormat: 'typed' });

    // THEN every card offers the photo alone as the prompt
    for (const question of session.questions) {
      expect(question.direction).toBe('face-to-name');
      expect(question.prompt.photoPath).toBeTruthy();
      expect(question.prompt.name).toBeNull();
    }
  });

  test('typed answering offers no options to pick from', () => {
    // GIVEN the user has chosen to type their answers
    // WHEN the questions are built
    const session = build({ mode: 'face-to-name', answerFormat: 'typed' });

    // THEN no card presents a list of names
    expect(session.questions.every(question => question.options.length === 0)).toBe(true);
  });

  test('multiple-choice answering offers four names including the right one', () => {
    // GIVEN the user has chosen multiple choice and has plenty of contacts
    // WHEN the questions are built
    const session = build({ mode: 'face-to-name', answerFormat: 'choice' });

    // THEN each card offers four names, exactly one of which is the contact's
    for (const question of session.questions) {
      expect(question.options).toHaveLength(MAX_OPTIONS);
      expect(question.options.filter(option => option.contactId === question.contactId)).toHaveLength(1);
    }
  });
});

describe('S-4.1.2 User sees correct name after answering', () => {
  test('every card carries the details the reveal screen shows', () => {
    // GIVEN a session over contacts with name images and association scenes
    // WHEN the questions are built
    const session = build();

    // THEN each one carries the full name plus its encoding cues
    for (const question of session.questions) {
      expect(question.reveal.name).toBeTruthy();
      expect(question.reveal.nameImage).toBeTruthy();
      expect(question.reveal.associationScene).toBeTruthy();
    }
  });

  test('the reveal names the contact the question was actually about', () => {
    // GIVEN a session of one contact
    // WHEN the question is built
    const priya = contact('Priya');
    const session = build({ contacts: [priya], cards: [dueCard(priya.id)] });

    // THEN the reveal is that contact's, not another's
    expect(session.questions[0].reveal.name).toBe('Priya');
  });
});

describe('S-4.2.1 User is shown name and selects photo', () => {
  test('a name-to-face card shows the name and four photo options', () => {
    // GIVEN a session fixed to the recognition direction
    // WHEN the questions are built
    const session = build({ mode: 'name-to-face' });

    // THEN each card names the contact and offers four faces
    for (const question of session.questions) {
      expect(question.direction).toBe('name-to-face');
      expect(question.prompt.name).toBeTruthy();
      expect(question.prompt.photoPath).toBeNull();
      expect(question.options).toHaveLength(MAX_OPTIONS);
    }
  });

  test('exactly one option is the correct contact', () => {
    // GIVEN a name-to-face session
    // WHEN the questions are built
    const session = build({ mode: 'name-to-face' });

    // THEN there is one right answer per card and no duplicates among the options
    for (const question of session.questions) {
      const correct = question.options.filter(option => option.contactId === question.contactId);
      expect(correct).toHaveLength(1);
      expect(new Set(question.options.map(o => o.contactId)).size).toBe(question.options.length);
    }
  });
});

describe('S-4.2.2 Distractors are drawn from real contact list', () => {
  test('every distractor is one of the user’s own contacts', () => {
    // GIVEN a user with five contacts
    const contacts = [contact('Priya'), contact('Sam'), contact('Tom'), contact('Ada'), contact('Rey')];

    // WHEN a name-to-face session is built
    const session = buildQuizSession({
      contacts,
      cards: contacts.map(c => dueCard(c.id)),
      mode: 'name-to-face',
      scope: 'due',
      answerFormat: 'choice',
      limit: 20,
      now: NOW,
    });

    // THEN no option is anyone but a real contact
    const known = new Set(contacts.map(c => c.id));
    for (const question of session.questions) {
      expect(question.options.every(option => known.has(option.contactId))).toBe(true);
    }
  });

  test('a distractor is never the contact being asked about', () => {
    // GIVEN a name-to-face session
    // WHEN the questions are built
    const session = build({ mode: 'name-to-face' });

    // THEN the correct contact appears once, as the answer, never as a decoy
    for (const question of session.questions) {
      const appearances = question.options.filter(option => option.contactId === question.contactId).length;
      expect(appearances).toBe(1);
    }
  });

  test('a short contact list yields fewer options rather than failing', () => {
    // GIVEN a user with only three contacts
    const contacts = [contact('Priya'), contact('Sam'), contact('Tom')];

    // WHEN a name-to-face session is built
    const session = buildQuizSession({
      contacts,
      cards: contacts.map(c => dueCard(c.id)),
      mode: 'name-to-face',
      scope: 'due',
      answerFormat: 'choice',
      limit: 20,
      now: NOW,
    });

    // THEN each card offers as many faces as there are contacts, and still works
    for (const question of session.questions) {
      expect(question.options).toHaveLength(3);
      expect(question.options.filter(o => o.contactId === question.contactId)).toHaveLength(1);
    }
  });

  test('a single contact falls back to the other direction rather than offering one photo', () => {
    // GIVEN a user with exactly one contact
    const priya = contact('Priya');

    // WHEN a name-to-face session is requested
    const session = buildQuizSession({
      contacts: [priya],
      cards: [dueCard(priya.id)],
      mode: 'name-to-face',
      scope: 'due',
      answerFormat: 'choice',
      limit: 20,
      now: NOW,
    });

    // THEN the question degrades to face-to-name, which needs no distractors
    expect(session.questions[0].direction).toBe('face-to-name');
    expect(session.questions[0].answerFormat).toBe('typed');
  });

  test('a contact with no photo is never asked about face-first with a photo prompt', () => {
    // GIVEN a contact with no photo on file, among contacts that have them
    const noPhoto = contact('Priya', { photoPath: null });
    const contacts = [noPhoto, contact('Sam'), contact('Tom'), contact('Ada')];

    // WHEN a name-to-face session is requested
    const session = buildQuizSession({
      contacts,
      cards: [dueCard(noPhoto.id)],
      mode: 'name-to-face',
      scope: 'due',
      answerFormat: 'choice',
      limit: 20,
      now: NOW,
    });

    // THEN that contact is quizzed the other way round instead
    expect(session.questions[0].contactId).toBe(noPhoto.id);
    expect(session.questions[0].direction).toBe('face-to-name');
  });

  test('the distractors change between two sessions on the same contact', () => {
    // GIVEN a user with many contacts, so a repeated set would be a coincidence
    const contacts = Array.from({ length: 12 }, (_, i) => contact(`Person${i}`));
    const target = contacts[0];
    const askAgain = () =>
      buildQuizSession({
        contacts,
        cards: [dueCard(target.id)],
        mode: 'name-to-face',
        scope: 'due',
        answerFormat: 'choice',
        limit: 1,
        now: NOW,
      }).questions[0].options.map(option => option.contactId).sort().join(',');

    // WHEN the same contact is quizzed several times
    const sets = new Set(Array.from({ length: 8 }, askAgain));

    // THEN the options are not the same set every time
    expect(sets.size).toBeGreaterThan(1);
  });
});

describe('S-4.3.1 Session mixes both quiz directions', () => {
  test('mixed mode produces both directions across a session', () => {
    // GIVEN a mixed-mode session over enough questions for both to appear
    const contacts = Array.from({ length: 40 }, (_, i) => contact(`Person${i}`));

    // WHEN the questions are built
    const session = buildQuizSession({
      contacts,
      cards: contacts.map(c => dueCard(c.id)),
      mode: 'mixed',
      scope: 'due',
      answerFormat: 'choice',
      limit: 40,
      now: NOW,
    });

    // THEN both retrieval directions are represented
    const directions = new Set(session.questions.map(question => question.direction));
    expect(directions).toEqual(new Set(['face-to-name', 'name-to-face']));
  });

  test('the two directions come up with roughly equal frequency', () => {
    // GIVEN a large mixed-mode session
    const contacts = Array.from({ length: 400 }, (_, i) => contact(`Person${i}`));

    // WHEN the questions are built
    const session = buildQuizSession({
      contacts,
      cards: contacts.map(c => dueCard(c.id)),
      mode: 'mixed',
      scope: 'due',
      answerFormat: 'choice',
      limit: 400,
      now: NOW,
    });

    // THEN neither direction dominates
    const faceFirst = session.questions.filter(q => q.direction === 'face-to-name').length;
    expect(faceFirst).toBeGreaterThan(session.questions.length * 0.3);
    expect(faceFirst).toBeLessThan(session.questions.length * 0.7);
  });

  test('every card states which way round it is being asked', () => {
    // GIVEN a mixed-mode session
    // WHEN the questions are built
    const session = build();

    // THEN each one carries its direction
    expect(session.questions.every(q => q.direction === 'face-to-name' || q.direction === 'name-to-face')).toBe(true);
  });

  test('an explicitly chosen direction overrides the mix', () => {
    // GIVEN a user who has chosen the face-first direction
    // WHEN the questions are built
    const session = build({ mode: 'face-to-name' });

    // THEN nothing is asked the other way round
    expect(session.questions.every(q => q.direction === 'face-to-name')).toBe(true);
  });
});

describe('S-4.3.2 User starts session with only due contacts', () => {
  test('a due-only session contains just the contacts whose review date has passed', () => {
    // GIVEN two contacts due and one not due until next week
    const priya = contact('Priya');
    const sam = contact('Sam');
    const later = contact('Later');

    // WHEN a due-only session is built
    const session = buildQuizSession({
      contacts: [priya, sam, later],
      cards: [dueCard(priya.id), dueCard(sam.id), futureCard(later.id)],
      mode: 'mixed',
      scope: 'due',
      answerFormat: 'choice',
      limit: 20,
      now: NOW,
    });

    // THEN only the two due contacts are asked about
    expect(session.questions.map(q => q.contactId).sort()).toEqual([priya.id, sam.id].sort());
    expect(session.dueCount).toBe(2);
  });

  test('practising everything reaches beyond the schedule', () => {
    // GIVEN one contact due and one not due until next week
    const priya = contact('Priya');
    const later = contact('Later');

    // WHEN a practise-all session is built
    const session = buildQuizSession({
      contacts: [priya, later],
      cards: [dueCard(priya.id), futureCard(later.id)],
      mode: 'mixed',
      scope: 'all',
      answerFormat: 'choice',
      limit: 20,
      now: NOW,
    });

    // THEN both are included, while the due count still reports only the one due
    expect(session.questions).toHaveLength(2);
    expect(session.dueCount).toBe(1);
  });

  test('with nothing due, a due-only session is empty and reports the next date', () => {
    // GIVEN a user whose only contact is not due until next week
    const later = contact('Later');

    // WHEN a due-only session is built
    const session = buildQuizSession({
      contacts: [later],
      cards: [futureCard(later.id)],
      mode: 'mixed',
      scope: 'due',
      answerFormat: 'choice',
      limit: 20,
      now: NOW,
    });

    // THEN there is nothing to ask, and the next review date is available to show instead
    expect(session.questions).toHaveLength(0);
    expect(session.dueCount).toBe(0);
    expect(session.nextReviewAt).toBe(NEXT_WEEK);
  });

  test('a session never runs longer than the limit it was given', () => {
    // GIVEN twenty due contacts and a limit of five
    const contacts = Array.from({ length: 20 }, (_, i) => contact(`Person${i}`));

    // WHEN the session is built
    const session = buildQuizSession({
      contacts,
      cards: contacts.map(c => dueCard(c.id)),
      mode: 'mixed',
      scope: 'due',
      answerFormat: 'choice',
      limit: 5,
      now: NOW,
    });

    // THEN it holds five questions, while still reporting everything that is due
    expect(session.questions).toHaveLength(5);
    expect(session.dueCount).toBe(20);
  });
});

describe('S-4.8.1 Immediate post-add quiz', () => {
  test('naming one contact yields a single question about that contact', () => {
    // GIVEN a user who has just saved a new contact among several others
    const contacts = [contact('Priya'), contact('Sam'), contact('Tom'), contact('Ada')];
    const justAdded = contacts[2];

    // WHEN a session is built for that contact alone
    const session = buildQuizSession({
      contacts,
      cards: contacts.map(c => futureCard(c.id)),
      mode: 'mixed',
      scope: 'due',
      answerFormat: 'choice',
      limit: 20,
      now: NOW,
      onlyContactId: justAdded.id,
    });

    // THEN exactly one question is asked, about them, regardless of the schedule
    expect(session.questions).toHaveLength(1);
    expect(session.questions[0].contactId).toBe(justAdded.id);
  });

  test('the post-add question is a normal quiz card in one direction or the other', () => {
    // GIVEN a newly added contact with photos available for distractors
    const contacts = [contact('Priya'), contact('Sam'), contact('Tom'), contact('Ada')];

    // WHEN a single-contact session is built
    const session = buildQuizSession({
      contacts,
      cards: contacts.map(c => dueCard(c.id)),
      mode: 'mixed',
      scope: 'due',
      answerFormat: 'choice',
      limit: 20,
      now: NOW,
      onlyContactId: contacts[0].id,
    });

    // THEN it carries the same shape as any other card
    const question = session.questions[0];
    expect(['face-to-name', 'name-to-face']).toContain(question.direction);
    expect(question.reveal.name).toBe('Priya');
  });
});
