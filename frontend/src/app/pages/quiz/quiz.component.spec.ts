import type { MockInstance } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { Observable, Subject, of } from 'rxjs';
import { QuizComponent } from './quiz.component';
import { DashboardMetrics, DashboardService } from '../../services/dashboard.service';
import { SettingsService, UserSettings } from '../../services/settings.service';
import { SpeechRecognitionService } from '../../services/speech-recognition.service';
import {
  AnswerOutcome,
  QuizQuestion,
  QuizService,
  QuizSession,
  StartSessionParams,
  SubmitAnswerPayload,
} from '../../services/quiz.service';

function question(name: string, overrides: Partial<QuizQuestion> = {}): QuizQuestion {
  return {
    contactId: `id-${name.toLowerCase()}`,
    direction: 'face-to-name',
    answerFormat: 'typed',
    prompt: { name: null, photoPath: `https://photos.example/${name.toLowerCase()}.jpg` },
    options: [],
    reveal: {
      name,
      photoPath: `https://photos.example/${name.toLowerCase()}.jpg`,
      nameImage: `${name} as a marquee tent`,
      associationScene: `${name} swinging from the coat rack`,
    },
    ...overrides,
  };
}

function nameToFace(name: string, distractors: string[]): QuizQuestion {
  return question(name, {
    direction: 'name-to-face',
    answerFormat: 'choice',
    prompt: { name, photoPath: null },
    options: [name, ...distractors].map(n => ({
      contactId: `id-${n.toLowerCase()}`,
      name: n,
      photoPath: `https://photos.example/${n.toLowerCase()}.jpg`,
    })),
  });
}

function session(questions: QuizQuestion[], overrides: Partial<QuizSession> = {}): QuizSession {
  return {
    mode: 'mixed',
    scope: 'due',
    answerFormat: 'typed',
    dueCount: questions.length,
    contactCount: questions.length,
    nextReviewAt: null,
    questions,
    ...overrides,
  };
}

function metrics(overrides: Partial<DashboardMetrics> = {}): DashboardMetrics {
  return { peopleAdded: 3, cardsDue: 2, totalQuizAnswers: 0, accuracyPercentage: null, nextReviewAt: null, ...overrides };
}

function settings(overrides: Partial<UserSettings> = {}): UserSettings {
  return {
    quizMode: 'mixed',
    quizAnswerFormat: 'choice',
    ratingExplainerSeen: false,
    remindersEnabled: false,
    reminderHour: 9,
    reminderMinute: 0,
    reminderTimezone: 'UTC',
    reminderChannels: ['in-app'],
    lastReminderSentOn: null,
    ...overrides,
  };
}

function outcome(nextReviewAt: string): AnswerOutcome {
  return {
    quizResult: {
      id: 'result-1',
      contactId: 'id-priya',
      direction: 'face-to-name',
      rating: 'good',
      quality: 4,
      correct: true,
      lapse: false,
      answeredAt: '2026-08-13T10:00:00.000Z',
    },
    reviewCard: { contactId: 'id-priya', easeFactor: 2.6, interval: 1, repetitions: 1, lapses: 0, nextReviewAt },
  };
}

describe('QuizComponent', () => {
  let startCalls: StartSessionParams[];
  let answerCalls: SubmitAnswerPayload[];
  let settingsUpdates: Partial<UserSettings>[];
  let navigateSpy: MockInstance;
  let fixture: ComponentFixture<QuizComponent>;

  async function render(options: {
    session?: QuizSession;
    metrics?: DashboardMetrics;
    settings?: UserSettings;
    /** For exercising a settings response that resolves after the user has acted. */
    settingsSource?: Observable<UserSettings>;
    queryParams?: Record<string, string>;
    answer?: () => Observable<AnswerOutcome>;
    /** Defaults to a browser that supports speech recognition and hears nothing. */
    speech?: { isSupported: boolean; listenOnce?: () => Promise<string | null> };
  } = {}): Promise<ComponentFixture<QuizComponent>> {
    startCalls = [];
    answerCalls = [];
    settingsUpdates = [];

    const quizServiceStub = {
      startSession: (params: StartSessionParams = {}) => {
        startCalls.push(params);
        return of(options.session ?? session([question('Priya')]));
      },
      submitAnswer: (payload: SubmitAnswerPayload) => {
        answerCalls.push(payload);
        return (options.answer ?? (() => of(outcome('2026-08-14T10:00:00.000Z'))))();
      },
    };

    const speechStub = {
      isSupported: options.speech?.isSupported ?? true,
      listenOnce: options.speech?.listenOnce ?? (() => Promise.resolve(null)),
    };

    await TestBed.configureTestingModule({
      imports: [QuizComponent],
      providers: [
        provideRouter([]),
        { provide: QuizService, useValue: quizServiceStub },
        { provide: DashboardService, useValue: { getMetrics: () => of(options.metrics ?? metrics()) } },
        {
          provide: SettingsService,
          useValue: {
            get: () => options.settingsSource ?? of(options.settings ?? settings()),
            update: (changes: Partial<UserSettings>) => {
              settingsUpdates.push(changes);
              return of(settings({ ...changes }));
            },
          },
        },
        { provide: SpeechRecognitionService, useValue: speechStub },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: convertToParamMap(options.queryParams ?? {}) } },
        },
      ],
    }).compileComponents();

    navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(QuizComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  afterEach(() => {
    // The start screen keeps a countdown ticking; destroying stops it.
    fixture?.destroy();
  });

  function el(testId: string): HTMLElement | null {
    return (fixture.nativeElement as HTMLElement).querySelector(`[data-testid="${testId}"]`);
  }

  function all(testId: string): HTMLElement[] {
    return Array.from((fixture.nativeElement as HTMLElement).querySelectorAll(`[data-testid="${testId}"]`));
  }

  function text(): string {
    return (fixture.nativeElement as HTMLElement).textContent ?? '';
  }

  async function click(testId: string, index = 0): Promise<void> {
    all(testId)[index].click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  // ── Start screen (S-4.3.2) ───────────────────────────────────────────────────

  describe('the session start screen', () => {
    it('shows how many contacts are currently due', async () => {
      await render({ metrics: metrics({ cardsDue: 4 }) });

      expect(el('due-count')?.textContent).toContain('4');
    });

    it('offers a Review Due button that starts a due-only session', async () => {
      await render({ metrics: metrics({ cardsDue: 4 }) });

      await click('review-due-btn');

      expect(startCalls.at(-1)?.scope).toBe('due');
    });

    it('replaces the Review Due button with the next due date when nothing is due', async () => {
      await render({ metrics: metrics({ cardsDue: 0, nextReviewAt: '2099-01-01T10:00:00.000Z' }) });

      expect(el('review-due-btn')).toBeNull();
      expect(el('next-due-date')).not.toBeNull();
      expect(el('next-due-countdown')?.textContent).toContain('in');
    });

    it('offers Practice All for drilling beyond the schedule', async () => {
      await render({ metrics: metrics({ cardsDue: 0 }) });

      await click('practice-all-btn');

      expect(startCalls.at(-1)?.scope).toBe('all');
    });

    it('defaults the session type to the user’s stored preference', async () => {
      await render({ settings: settings({ quizMode: 'name-to-face' }) });

      expect(el('mode-name-to-face')?.getAttribute('data-selected')).toBe('true');
    });

    it('sends no session type of its own when the user has not chosen one', async () => {
      // Leaving it unset is what lets the stored preference apply — and means a settings
      // response that has not arrived yet cannot be raced into sending the wrong one.
      await render({ settings: settings({ quizMode: 'name-to-face' }) });

      await click('practice-all-btn');

      expect(startCalls.at(-1)?.mode).toBeUndefined();
      expect(startCalls.at(-1)?.answerFormat).toBeUndefined();
    });

    it('keeps a chosen session type even if the stored settings arrive afterwards', async () => {
      // The start screen is usable before settings resolve; a late response must not
      // overwrite a choice the user has already made.
      const late = new Subject<UserSettings>();
      await render({ settingsSource: late.asObservable() });

      await click('mode-face-to-name');
      late.next(settings({ quizMode: 'name-to-face' }));
      late.complete();
      fixture.detectChanges();

      // Checked while the start screen is still mounted — starting the session unmounts it.
      expect(el('mode-face-to-name')?.getAttribute('data-selected')).toBe('true');
      expect(el('mode-name-to-face')?.getAttribute('data-selected')).toBe('false');

      await click('practice-all-btn');
      expect(startCalls.at(-1)?.mode).toBe('face-to-name');
    });

    it('lets the user override the session type for this session', async () => {
      await render();

      await click('mode-face-to-name');
      await click('practice-all-btn');

      expect(startCalls.at(-1)?.mode).toBe('face-to-name');
    });

    it('lets the user choose between typing and picking a name', async () => {
      await render();

      await click('answer-format-typed');
      await click('practice-all-btn');

      expect(startCalls.at(-1)?.answerFormat).toBe('typed');
    });
  });

  // ── Face → Name (E-4.1) ──────────────────────────────────────────────────────

  describe('a face-to-name question', () => {
    it('shows the photo and no name hint before the answer is given', async () => {
      await render({ queryParams: { start: '1' }, session: session([question('Priya')]) });

      expect(el('prompt-photo')).not.toBeNull();
      expect(el('prompt-name')).toBeNull();
      expect(text()).not.toContain('Priya');
    });

    it('states the direction of the task', async () => {
      await render({ queryParams: { start: '1' }, session: session([question('Priya')]) });

      expect(el('direction-label')?.textContent).toContain('Face → Name');
    });

    it('reveals the correct name when the typed answer is right', async () => {
      await render({ queryParams: { start: '1' }, session: session([question('Priya')]) });

      const input = el('answer-input') as HTMLInputElement;
      input.value = 'priya';
      input.dispatchEvent(new Event('input'));
      await click('submit-answer-btn');

      expect(el('reveal-name')?.textContent).toContain('Priya');
      expect(el('answer-feedback')?.getAttribute('data-correct')).toBe('true');
    });

    it('reveals the correct name without negative language when the answer is wrong', async () => {
      await render({ queryParams: { start: '1' }, session: session([question('Priya')]) });

      const input = el('answer-input') as HTMLInputElement;
      input.value = 'Somebody Else';
      input.dispatchEvent(new Event('input'));
      await click('submit-answer-btn');

      expect(el('reveal-name')?.textContent).toContain('Priya');
      expect(el('answer-feedback')?.getAttribute('data-correct')).toBe('false');
      expect(el('answer-feedback')?.textContent?.toLowerCase()).not.toContain('wrong');
      expect(el('answer-feedback')?.textContent?.toLowerCase()).not.toContain('incorrect');
    });

    it('shows the name image and association scene on the reveal', async () => {
      await render({ queryParams: { start: '1' }, session: session([question('Priya')]) });

      await click('submit-answer-btn');

      expect(el('reveal-name-image')?.textContent).toContain('marquee tent');
      expect(el('reveal-association-scene')?.textContent).toContain('coat rack');
    });

    it('offers a list of names when the session is set to multiple choice', async () => {
      const choice = question('Priya', {
        answerFormat: 'choice',
        options: ['Priya', 'Sam', 'Tom', 'Ada'].map(n => ({ contactId: `id-${n.toLowerCase()}`, name: n, photoPath: null })),
      });
      await render({ queryParams: { start: '1' }, session: session([choice]) });

      expect(all('name-option')).toHaveLength(4);
    });
  });

  // ── Spoken answering (S-4.1.3) ────────────────────────────────────────────────

  describe('answering by speaking', () => {
    /** Chooses "Say the name" on the start screen and begins a session. */
    async function startSpokenSession(): Promise<void> {
      await click('answer-format-spoken');
      await click('practice-all-btn');
    }

    it('offers "Say the name" as an answering choice', async () => {
      await render();

      expect(el('answer-format-spoken')).not.toBeNull();
    });

    it('does not offer it when the browser cannot listen for speech', async () => {
      await render({ speech: { isSupported: false } });

      expect(el('answer-format-spoken')).toBeNull();
    });

    it('starts a spoken session as a typed request under the hood', async () => {
      await render();

      await startSpokenSession();

      expect(startCalls.at(-1)?.answerFormat).toBe('typed');
    });

    it('offers a listening control instead of a typed field or a choice list', async () => {
      await render();

      await startSpokenSession();

      expect(el('speak-answer-btn')).not.toBeNull();
      expect(el('answer-input')).toBeNull();
      expect(el('name-options')).toBeNull();
    });

    it('shows what was heard as text once speech is recognized', async () => {
      await render({ speech: { isSupported: true, listenOnce: () => Promise.resolve('Pria') } });

      await startSpokenSession();
      await click('speak-answer-btn');

      expect(el('spoken-transcript')?.textContent).toContain('Pria');
    });

    it('accepts a close but imperfect spoken answer as correctly recalled', async () => {
      await render({
        session: session([question('Priya')]),
        speech: { isSupported: true, listenOnce: () => Promise.resolve('Pria') },
      });

      await startSpokenSession();
      await click('speak-answer-btn');

      expect(el('reveal-name')?.textContent).toContain('Priya');
      expect(el('answer-feedback')?.getAttribute('data-correct')).toBe('true');
    });

    it('marks an unrelated spoken answer as not recalled', async () => {
      await render({
        session: session([question('Priya')]),
        speech: { isSupported: true, listenOnce: () => Promise.resolve('Somebody Else') },
      });

      await startSpokenSession();
      await click('speak-answer-btn');

      expect(el('reveal-name')?.textContent).toContain('Priya');
      expect(el('answer-feedback')?.getAttribute('data-correct')).toBe('false');
    });
  });

  // ── Name → Face (E-4.2) ──────────────────────────────────────────────────────

  describe('a name-to-face question', () => {
    it('shows the name and four photo options', async () => {
      await render({
        queryParams: { start: '1' },
        session: session([nameToFace('Priya', ['Sam', 'Tom', 'Ada'])]),
      });

      expect(el('prompt-name')?.textContent).toContain('Priya');
      expect(all('photo-option')).toHaveLength(4);
    });

    it('locks in the selection and reveals whether it was right', async () => {
      await render({
        queryParams: { start: '1' },
        session: session([nameToFace('Priya', ['Sam', 'Tom', 'Ada'])]),
      });

      const options = all('photo-option');
      const correctIndex = options.findIndex(o => o.getAttribute('data-contact-id') === 'id-priya');
      await click('photo-option', correctIndex);

      expect(el('reveal-panel')).not.toBeNull();
      expect(el('answer-feedback')?.getAttribute('data-correct')).toBe('true');
    });

    it('highlights the correct photo even when a different one was chosen', async () => {
      await render({
        queryParams: { start: '1' },
        session: session([nameToFace('Priya', ['Sam', 'Tom', 'Ada'])]),
      });

      const wrongIndex = all('photo-option').findIndex(o => o.getAttribute('data-contact-id') !== 'id-priya');
      await click('photo-option', wrongIndex);

      const marked = all('photo-option').filter(o => o.getAttribute('data-correct') === 'true');
      expect(marked).toHaveLength(1);
      expect(marked[0].getAttribute('data-contact-id')).toBe('id-priya');
    });
  });

  // ── Rating (E-4.4) ───────────────────────────────────────────────────────────

  describe('rating recall after an answer', () => {
    it('offers all four ratings on the reveal screen', async () => {
      await render({ queryParams: { start: '1' }, session: session([question('Priya')]) });
      await click('submit-answer-btn');

      for (const rating of ['forgot', 'hard', 'good', 'easy']) {
        expect(el(`rating-${rating}`)).not.toBeNull();
      }
    });

    it('gives each rating a one-line description', async () => {
      await render({ queryParams: { start: '1' }, session: session([question('Priya')]) });
      await click('submit-answer-btn');

      expect(el('rating-good')?.textContent).toContain('recalled with some effort');
    });

    it('records the rating and moves to the next question', async () => {
      await render({
        queryParams: { start: '1' },
        session: session([question('Priya'), question('Sam')]),
      });
      await click('submit-answer-btn');
      await click('rating-good');

      expect(answerCalls).toHaveLength(1);
      expect(answerCalls[0]).toMatchObject({ contactId: 'id-priya', rating: 'good', direction: 'face-to-name' });
      expect(el('question-progress')?.textContent).toContain('02 / 02');
    });

    it('records whether the answer itself was right, alongside the self-rating', async () => {
      await render({ queryParams: { start: '1' }, session: session([question('Priya')]) });

      const input = el('answer-input') as HTMLInputElement;
      input.value = 'Priya';
      input.dispatchEvent(new Event('input'));
      await click('submit-answer-btn');
      await click('rating-easy');

      expect(answerCalls[0].correct).toBe(true);
    });

    it('explains the ratings the first time they are shown', async () => {
      await render({
        queryParams: { start: '1' },
        session: session([question('Priya')]),
        settings: settings({ ratingExplainerSeen: false }),
      });

      await click('submit-answer-btn');

      expect(el('rating-explainer')).not.toBeNull();
    });

    it('does not explain them again once dismissed', async () => {
      await render({
        queryParams: { start: '1' },
        session: session([question('Priya'), question('Sam')]),
        settings: settings({ ratingExplainerSeen: false }),
      });

      await click('submit-answer-btn');
      await click('dismiss-explainer');
      expect(el('rating-explainer')).toBeNull();
      expect(settingsUpdates).toContainEqual({ ratingExplainerSeen: true });

      await click('rating-good');
      await click('submit-answer-btn');

      expect(el('rating-explainer')).toBeNull();
    });

    it('skips the explainer entirely for a user who has already seen it', async () => {
      await render({
        queryParams: { start: '1' },
        session: session([question('Priya')]),
        settings: settings({ ratingExplainerSeen: true }),
      });

      await click('submit-answer-btn');

      expect(el('rating-explainer')).toBeNull();
    });

    it('lets the explanation be re-read at any time from the help icon', async () => {
      await render({
        queryParams: { start: '1' },
        session: session([question('Priya')]),
        settings: settings({ ratingExplainerSeen: true }),
      });

      await click('submit-answer-btn');
      await click('rating-help');

      expect(el('rating-explainer')).not.toBeNull();
    });
  });

  // ── Session summary (S-4.3.1, S-4.4.1) ───────────────────────────────────────

  describe('the session summary', () => {
    it('counts how many questions of each type were asked', async () => {
      await render({
        queryParams: { start: '1' },
        session: session([question('Priya'), nameToFace('Sam', ['Tom', 'Ada', 'Rey'])]),
      });

      await click('submit-answer-btn');
      await click('rating-good');
      await click('photo-option', 0);
      await click('rating-good');

      expect(el('summary-face-to-name')?.textContent).toContain('1');
      expect(el('summary-name-to-face')?.textContent).toContain('1');
    });

    it('shows the updated next-review date for each contact answered', async () => {
      await render({ queryParams: { start: '1' }, session: session([question('Priya')]) });

      await click('submit-answer-btn');
      await click('rating-good');

      expect(el('session-summary')).not.toBeNull();
      expect(all('summary-row')).toHaveLength(1);
      expect(el('summary-next-review')?.textContent?.trim()).not.toBe('—');
    });
  });

  // ── Post-add prompt (E-4.8) ──────────────────────────────────────────────────

  describe('the immediate post-add prompt', () => {
    it('asks a single question about the contact just saved', async () => {
      await render({ queryParams: { contactId: 'id-priya' }, session: session([question('Priya')]) });

      expect(startCalls[0]).toMatchObject({ contactId: 'id-priya', limit: 1 });
      expect(el('direction-label')).not.toBeNull();
    });

    it('uses the same reveal and rating flow as a full session', async () => {
      await render({ queryParams: { contactId: 'id-priya' }, session: session([question('Priya')]) });

      await click('submit-answer-btn');

      expect(el('reveal-name')?.textContent).toContain('Priya');
      expect(el('rating-good')).not.toBeNull();
    });

    it('updates the contact’s schedule just as a regular session would', async () => {
      await render({ queryParams: { contactId: 'id-priya' }, session: session([question('Priya')]) });

      await click('submit-answer-btn');
      await click('rating-good');

      expect(answerCalls).toHaveLength(1);
      expect(answerCalls[0].contactId).toBe('id-priya');
    });

    it('offers a visible way to skip', async () => {
      await render({ queryParams: { contactId: 'id-priya' }, session: session([question('Priya')]) });

      expect(el('skip-quiz-btn')).not.toBeNull();
    });

    it('returns the user to the dashboard when they skip, recording no answer', async () => {
      await render({ queryParams: { contactId: 'id-priya' }, session: session([question('Priya')]) });

      await click('skip-quiz-btn');

      expect(navigateSpy).toHaveBeenCalledWith(['/dashboard']);
      expect(answerCalls).toHaveLength(0);
    });

    it('offers no skip option in a regular session', async () => {
      await render({ queryParams: { start: '1' }, session: session([question('Priya')]) });

      expect(el('skip-quiz-btn')).toBeNull();
    });
  });

  describe('when there is nothing to ask', () => {
    it('says so rather than showing an empty card', async () => {
      await render({ queryParams: { start: '1' }, session: session([]) });

      expect(el('quiz-empty-state')).not.toBeNull();
    });
  });
});
