import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DashboardService } from '../../services/dashboard.service';
import { SettingsService, UserSettings } from '../../services/settings.service';
import { SpeechRecognitionService } from '../../services/speech-recognition.service';
import { namesMatch, normalise } from './name-match';
import {
  AnswerFormat,
  QuizDirection,
  QuizMode,
  QuizQuestion,
  QuizScope,
  QuizService,
  QuizSession,
  RecallRating,
} from '../../services/quiz.service';

/**
 * The four ratings the user actually presses. The one-line descriptions are the
 * calibration aid S-4.4.2 asks for and are shown on the buttons themselves, not only
 * inside the explainer — the explainer goes away, the labels don't.
 */
const RATINGS: { rating: RecallRating; label: string; description: string }[] = [
  { rating: 'forgot', label: 'Forgot', description: 'no recall — start this one over' },
  { rating: 'hard', label: 'Hard', description: 'recalled, but only with real effort' },
  { rating: 'good', label: 'Good', description: 'recalled with some effort' },
  { rating: 'easy', label: 'Easy', description: 'instant, effortless recall' },
];

const MODES: { mode: QuizMode; label: string }[] = [
  { mode: 'mixed', label: 'Mixed' },
  { mode: 'face-to-name', label: 'Face → Name' },
  { mode: 'name-to-face', label: 'Name → Face' },
];

/** The typed/choice split the backend knows about, plus a spoken option (S-4.1.3) that
 * rides on top of a `typed` session — the server never needs to know the user is
 * speaking rather than typing, only that no multiple-choice options are wanted. */
type UiAnswerFormat = AnswerFormat | 'spoken';

const ANSWER_FORMATS: { format: UiAnswerFormat; label: string }[] = [
  { format: 'choice', label: 'Multiple choice' },
  { format: 'typed', label: 'Type the name' },
  { format: 'spoken', label: 'Say the name' },
];

/** One answered question, kept for the end-of-session summary (S-4.3.1, S-4.4.1). */
interface SessionEntry {
  name: string;
  direction: QuizDirection;
  rating: RecallRating;
  correct: boolean;
  nextReviewAt: string | null;
}

type Phase = 'start' | 'question' | 'reveal' | 'summary' | 'empty';

@Component({
  selector: 'app-quiz',
  standalone: true,
  styles: [`
    :host {
      --bg:     #f4ede0;
      --card:   #ede3d0;
      --fg:     #1e1710;
      --accent: #8c3a2a;
      --muted:  #6b5c45;
      --border: rgba(30,23,16,0.18);
      --good:   #3d6b4a;
      display: block;
    }
    button { border-radius: 0; cursor: pointer; }
    input[type=text] {
      width: 100%;
      border: 1px solid var(--border);
      padding: 12px 16px;
      font-family: 'Lora', serif;
      font-size: 1rem;
      background: var(--bg);
      color: var(--fg);
      outline: none;
      border-radius: 0;
    }
    input[type=text]:focus { border-color: var(--fg); }
  `],
  template: `
    <div class="min-h-screen flex flex-col" style="background:var(--bg)">

      <header class="sticky top-0 z-20 border-b flex items-center gap-4 px-5"
        style="background:var(--card);border-color:var(--border);height:52px;min-height:52px">
        <button (click)="leave()" aria-label="Go back"
          style="background:none;border:none;font-family:'DM Mono',monospace;font-size:18px;color:var(--fg);line-height:1;flex-shrink:0">
          ←
        </button>
        <p class="flex-1 truncate" style="font-family:'Playfair Display',serif;font-size:15px;color:var(--fg)">
          {{ singleContactMode() ? 'One quick check' : 'Quiz session' }}
        </p>
        @if (phase() === 'question' || phase() === 'reveal') {
          <span class="text-xs tracking-widest shrink-0" data-testid="question-progress"
            style="font-family:'DM Mono',monospace;color:var(--muted)">
            {{ pad(index() + 1) }} / {{ pad(questionCount()) }}
          </span>
        }
      </header>

      <main class="flex-1 overflow-y-auto">
        <div class="max-w-2xl mx-auto px-5 pt-7 pb-16">

          <!-- ── Start screen ─────────────────────────────────────────────── -->
          @if (phase() === 'start') {
            <div class="space-y-6" data-testid="quiz-start-screen">

              <div class="border px-5 py-6 text-center" data-testid="due-count-panel"
                style="background:var(--card);border-color:var(--border)">
                <p class="text-xs uppercase tracking-widest mb-2"
                  style="font-family:'DM Mono',monospace;color:var(--muted)">Contacts due now</p>
                <p data-testid="due-count" style="font-family:'Playfair Display',serif;font-size:2.6rem;color:var(--fg);line-height:1">
                  {{ dueCount() }}
                </p>
              </div>

              @if (dueCount() > 0) {
                <button (click)="start('due')" data-testid="review-due-btn"
                  class="w-full border px-5 py-4 flex items-center justify-between"
                  style="background:var(--fg);border-color:var(--fg)">
                  <span style="font-family:'Lora',serif;font-size:15px;color:var(--bg)">Review Due</span>
                  <span style="font-family:'DM Mono',monospace;font-size:12px;letter-spacing:0.06em;color:var(--bg)">
                    {{ dueCount() }} {{ dueCount() === 1 ? 'card' : 'cards' }} →
                  </span>
                </button>
              } @else {
                <!-- Nothing due: the Review Due button is replaced by when the next one lands (S-4.3.2). -->
                <div class="border px-5 py-4" data-testid="next-due-panel"
                  style="background:var(--card);border-color:var(--border)">
                  <p class="text-xs uppercase tracking-widest mb-2"
                    style="font-family:'DM Mono',monospace;color:var(--muted)">Nothing due right now</p>
                  @if (nextReviewAt()) {
                    <p data-testid="next-due-date" style="font-family:'Lora',serif;font-size:15px;color:var(--fg)">
                      Next review {{ formatDateTime(nextReviewAt()!) }}
                    </p>
                    <p data-testid="next-due-countdown" class="mt-1"
                      style="font-family:'DM Mono',monospace;font-size:12px;letter-spacing:0.05em;color:var(--accent)">
                      in {{ countdown() }}
                    </p>
                  } @else {
                    <p data-testid="next-due-date" style="font-family:'Lora',serif;font-size:15px;color:var(--fg)">
                      Add someone to start building a review schedule.
                    </p>
                  }
                </div>
              }

              <button (click)="start('all')" data-testid="practice-all-btn"
                class="w-full border px-5 py-4 flex items-center justify-between"
                style="background:var(--card);border-color:var(--border)">
                <span style="font-family:'Lora',serif;font-size:15px;color:var(--fg)">Practice All</span>
                <span style="font-family:'DM Mono',monospace;font-size:12px;letter-spacing:0.06em;color:var(--muted)">
                  drill beyond the schedule →
                </span>
              </button>

              <div>
                <p class="text-xs uppercase tracking-widest mb-2"
                  style="font-family:'DM Mono',monospace;color:var(--muted)">Session type</p>
                <div class="flex flex-wrap gap-2" data-testid="mode-picker">
                  @for (option of modes; track option.mode) {
                    <button (click)="chooseMode(option.mode)"
                      [attr.data-testid]="'mode-' + option.mode"
                      [attr.data-selected]="mode() === option.mode"
                      [attr.aria-pressed]="mode() === option.mode"
                      class="px-3 py-2 text-xs border"
                      style="font-family:'DM Mono',monospace;letter-spacing:0.04em"
                      [style.background]="mode() === option.mode ? 'var(--fg)' : 'transparent'"
                      [style.color]="mode() === option.mode ? 'var(--bg)' : 'var(--fg)'"
                      [style.border-color]="mode() === option.mode ? 'var(--fg)' : 'var(--border)'">
                      {{ option.label }}
                    </button>
                  }
                </div>
              </div>

              <div>
                <p class="text-xs uppercase tracking-widest mb-2"
                  style="font-family:'DM Mono',monospace;color:var(--muted)">Answering Face → Name</p>
                <div class="flex flex-wrap gap-2" data-testid="answer-format-picker">
                  @for (option of answerFormats(); track option.format) {
                    <button (click)="chooseAnswerFormat(option.format)"
                      [attr.data-testid]="'answer-format-' + option.format"
                      [attr.data-selected]="uiAnswerFormat() === option.format"
                      [attr.aria-pressed]="uiAnswerFormat() === option.format"
                      class="px-3 py-2 text-xs border"
                      style="font-family:'DM Mono',monospace;letter-spacing:0.04em"
                      [style.background]="uiAnswerFormat() === option.format ? 'var(--fg)' : 'transparent'"
                      [style.color]="uiAnswerFormat() === option.format ? 'var(--bg)' : 'var(--fg)'"
                      [style.border-color]="uiAnswerFormat() === option.format ? 'var(--fg)' : 'var(--border)'">
                      {{ option.label }}
                    </button>
                  }
                </div>
              </div>

            </div>
          }

          <!-- ── Nothing to quiz ──────────────────────────────────────────── -->
          @if (phase() === 'empty') {
            <div class="border px-5 py-10 text-center" data-testid="quiz-empty-state"
              style="background:var(--card);border-color:var(--border)">
              <p style="font-family:'Lora',serif;color:var(--fg)">Nothing to quiz just yet.</p>
              <p class="mt-2 text-xs" style="font-family:'DM Mono',monospace;color:var(--muted)">
                Add someone first, or come back when a review falls due.
              </p>
              <button (click)="leave()" class="mt-4 text-xs uppercase tracking-widest"
                style="font-family:'DM Mono',monospace;color:var(--accent);background:none;border:none">
                Back to dashboard →
              </button>
            </div>
          }

          <!-- ── Question / reveal ────────────────────────────────────────── -->
          @if (currentQuestion(); as question) {
            @if (phase() === 'question' || phase() === 'reveal') {
              <div class="space-y-6">

                <div class="flex items-center justify-between">
                  <span class="inline-block border px-3 py-1.5 text-xs uppercase tracking-widest"
                    data-testid="direction-label"
                    style="font-family:'DM Mono',monospace;background:var(--fg);border-color:var(--fg);color:var(--bg)">
                    {{ directionLabel(question.direction) }}
                  </span>
                  @if (singleContactMode() && phase() === 'question') {
                    <button (click)="skip()" data-testid="skip-quiz-btn"
                      class="text-xs uppercase tracking-widest"
                      style="font-family:'DM Mono',monospace;color:var(--muted);background:none;border:none">
                      Skip for now
                    </button>
                  }
                </div>

                <!-- Prompt: exactly one side of the pair before the answer is in. -->
                @if (question.direction === 'face-to-name') {
                  <div class="border flex items-center justify-center py-6" data-testid="prompt-photo"
                    style="background:var(--card);border-color:var(--border)">
                    @if (question.prompt.photoPath) {
                      <img [src]="question.prompt.photoPath" alt="Who is this?"
                        style="width:180px;height:180px;object-fit:cover;border-radius:50%" />
                    } @else {
                      <span class="flex items-center justify-center"
                        style="width:180px;height:180px;border-radius:50%;background:var(--bg);font-family:'DM Mono',monospace;font-size:12px;letter-spacing:0.06em;color:var(--muted);text-align:center;padding:0 20px">
                        no photo on file
                      </span>
                    }
                  </div>
                } @else {
                  <div class="border px-5 py-8 text-center" data-testid="prompt-name"
                    style="background:var(--card);border-color:var(--border)">
                    <p class="text-xs uppercase tracking-widest mb-2"
                      style="font-family:'DM Mono',monospace;color:var(--muted)">Which face is</p>
                    <p style="font-family:'Playfair Display',serif;font-size:clamp(1.8rem,7vw,2.6rem);color:var(--fg);line-height:1.1">
                      {{ question.prompt.name }}?
                    </p>
                  </div>
                }

                <!-- Answering -->
                @if (phase() === 'question') {
                  @if (question.direction === 'name-to-face') {
                    <div class="grid grid-cols-2 gap-3" data-testid="photo-options">
                      @for (option of question.options; track option.contactId) {
                        <button (click)="answerWithOption(option.contactId)"
                          data-testid="photo-option" [attr.data-contact-id]="option.contactId"
                          class="border flex items-center justify-center py-4"
                          [attr.aria-label]="'Photo option ' + ($index + 1)"
                          style="background:var(--card);border-color:var(--border)">
                          @if (option.photoPath) {
                            <img [src]="option.photoPath" [alt]="'Photo option ' + ($index + 1)"
                              style="width:110px;height:110px;object-fit:cover;border-radius:50%" />
                          } @else {
                            <span style="width:110px;height:110px;border-radius:50%;background:var(--bg);display:flex;align-items:center;justify-content:center;font-family:'DM Mono',monospace;font-size:11px;color:var(--muted)">—</span>
                          }
                        </button>
                      }
                    </div>
                  } @else if (question.answerFormat === 'choice') {
                    <div class="space-y-2" data-testid="name-options">
                      @for (option of question.options; track option.contactId) {
                        <button (click)="answerWithOption(option.contactId)"
                          data-testid="name-option" [attr.data-contact-id]="option.contactId"
                          class="w-full border px-4 py-3 text-left"
                          style="background:var(--card);border-color:var(--border)">
                          <span style="font-family:'Lora',serif;font-size:15px;color:var(--fg)">{{ option.name }}</span>
                        </button>
                      }
                    </div>
                  } @else if (spokenAnswering()) {
                    <!-- Spoken answering (S-4.1.3): heard text is graded as a close match, not an exact one. -->
                    <div class="space-y-3" data-testid="spoken-answer">
                      <button (click)="toggleListening()" data-testid="speak-answer-btn"
                        [attr.aria-pressed]="listening()"
                        class="w-full border px-5 py-4"
                        [style.background]="listening() ? 'var(--accent)' : 'var(--fg)'"
                        style="border-color:var(--fg);font-family:'DM Mono',monospace;font-size:12px;letter-spacing:0.09em;text-transform:uppercase;color:var(--bg)">
                        {{ listening() ? 'Listening…' : 'Tap to speak the name' }}
                      </button>
                      @if (speechUnsupported()) {
                        <p data-testid="speech-unsupported" class="text-center text-xs"
                          style="font-family:'DM Mono',monospace;color:var(--accent)">
                          Voice answers aren't supported in this browser — try typing instead.
                        </p>
                      }
                    </div>
                  } @else {
                    <div class="space-y-3">
                      <input type="text" data-testid="answer-input" [value]="typedAnswer()"
                        (input)="typedAnswer.set($any($event.target).value)"
                        (keyup.enter)="answerWithTypedName()"
                        placeholder="Type the name you recall" aria-label="Type the name you recall" />
                      <button (click)="answerWithTypedName()" data-testid="submit-answer-btn"
                        class="w-full border px-5 py-3"
                        style="background:var(--fg);border-color:var(--fg);font-family:'DM Mono',monospace;font-size:12px;letter-spacing:0.09em;text-transform:uppercase;color:var(--bg)">
                        Reveal the answer
                      </button>
                    </div>
                  }
                }

                <!-- Reveal (S-4.1.2): the name is always shown, right or wrong. -->
                @if (phase() === 'reveal') {
                  <div class="space-y-4" data-testid="reveal-panel">

                    @if (question.direction === 'name-to-face') {
                      <div class="grid grid-cols-2 gap-3">
                        @for (option of question.options; track option.contactId) {
                          <div class="border flex flex-col items-center justify-center gap-2 py-4"
                            data-testid="photo-option"
                            [attr.data-contact-id]="option.contactId"
                            [attr.data-correct]="option.contactId === question.contactId"
                            [attr.data-selected]="option.contactId === selectedOptionId()"
                            [style.background]="option.contactId === question.contactId ? 'var(--good)' : 'var(--card)'"
                            [style.border-color]="option.contactId === question.contactId ? 'var(--good)' : 'var(--border)'">
                            @if (option.photoPath) {
                              <img [src]="option.photoPath" [alt]="'Photo option ' + ($index + 1)"
                                style="width:110px;height:110px;object-fit:cover;border-radius:50%" />
                            } @else {
                              <span style="width:110px;height:110px;border-radius:50%;background:var(--bg);display:flex;align-items:center;justify-content:center;font-family:'DM Mono',monospace;font-size:11px;color:var(--muted)">—</span>
                            }
                            @if (option.contactId === question.contactId) {
                              <span class="text-xs uppercase tracking-widest"
                                style="font-family:'DM Mono',monospace;color:var(--bg)">The one</span>
                            }
                          </div>
                        }
                      </div>
                    }

                    @if (spokenTranscript()) {
                      <!-- Confirms what the user actually said (S-4.1.3), heard text and all. -->
                      <p data-testid="spoken-transcript" class="text-center"
                        style="font-family:'Lora',serif;font-style:italic;font-size:14px;color:var(--muted)">
                        You said "{{ spokenTranscript() }}"
                      </p>
                    }

                    <div class="border px-5 py-5 text-center" style="background:var(--card);border-color:var(--border)">
                      <p class="text-xs uppercase tracking-widest mb-2"
                        style="font-family:'DM Mono',monospace;color:var(--muted)">The name</p>
                      <p data-testid="reveal-name"
                        style="font-family:'Playfair Display',serif;font-size:clamp(1.8rem,7vw,2.6rem);color:var(--fg);line-height:1.1">
                        {{ question.reveal.name }}
                      </p>
                      <!-- Wrong answers get the name and a nudge, never a scolding (S-4.1.2). -->
                      <p data-testid="answer-feedback" class="mt-3 text-xs uppercase tracking-widest"
                        style="font-family:'DM Mono',monospace"
                        [attr.data-correct]="lastCorrect()"
                        [style.color]="lastCorrect() ? 'var(--good)' : 'var(--accent)'">
                        {{ lastCorrect() ? 'Correct — well recalled' : 'This one is still settling — here it is again' }}
                      </p>
                    </div>

                    <!-- Encoding reinforcement: the same cues used when the contact was added. -->
                    <div class="border divide-y" style="background:var(--card);border-color:var(--border)">
                      <div class="px-4 py-3" style="border-color:var(--border)">
                        <p class="text-xs uppercase tracking-widest mb-1"
                          style="font-family:'DM Mono',monospace;color:var(--muted)">Name image</p>
                        <p data-testid="reveal-name-image" style="font-family:'Lora',serif;font-size:14.5px;font-style:italic;line-height:1.65"
                          [style.color]="question.reveal.nameImage ? 'var(--fg)' : 'var(--muted)'">
                          {{ question.reveal.nameImage || 'None recorded yet.' }}
                        </p>
                      </div>
                      <div class="px-4 py-3" style="border-color:var(--border)">
                        <p class="text-xs uppercase tracking-widest mb-1"
                          style="font-family:'DM Mono',monospace;color:var(--muted)">Association scene</p>
                        <p data-testid="reveal-association-scene" style="font-family:'Lora',serif;font-size:14.5px;font-style:italic;line-height:1.65"
                          [style.color]="question.reveal.associationScene ? 'var(--fg)' : 'var(--muted)'">
                          {{ question.reveal.associationScene || 'None recorded yet.' }}
                        </p>
                      </div>
                    </div>

                    <!-- Rating (E-4.4) -->
                    <div>
                      <div class="flex items-center justify-between mb-2">
                        <p class="text-xs uppercase tracking-widest"
                          style="font-family:'DM Mono',monospace;color:var(--muted)">How well did you recall it?</p>
                        <button (click)="toggleExplainer()" data-testid="rating-help"
                          aria-label="What do the ratings mean?"
                          class="text-xs border"
                          style="font-family:'DM Mono',monospace;color:var(--muted);background:transparent;border-color:var(--border);width:24px;height:24px;line-height:1">
                          ?
                        </button>
                      </div>

                      @if (explainerVisible()) {
                        <div class="border px-4 py-3 mb-3" data-testid="rating-explainer"
                          style="background:var(--card);border-color:var(--accent)">
                          <p class="text-xs uppercase tracking-widest mb-2"
                            style="font-family:'DM Mono',monospace;color:var(--accent)">What the ratings mean</p>
                          <ul class="space-y-1">
                            @for (option of ratings; track option.rating) {
                              <li style="font-family:'Lora',serif;font-size:13.5px;line-height:1.6;color:var(--fg)">
                                <strong>{{ option.label }}</strong> — {{ option.description }}
                              </li>
                            }
                          </ul>
                          <p class="mt-2" style="font-family:'Lora',serif;font-size:13px;color:var(--muted)">
                            Rate honestly — the schedule is only as good as the signal you give it.
                          </p>
                          <button (click)="dismissExplainer()" data-testid="dismiss-explainer"
                            class="mt-3 text-xs uppercase tracking-widest"
                            style="font-family:'DM Mono',monospace;color:var(--accent);background:none;border:none">
                            Got it
                          </button>
                        </div>
                      }

                      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2" data-testid="rating-buttons">
                        @for (option of ratings; track option.rating) {
                          <button (click)="rate(option.rating)" [disabled]="submitting()"
                            [attr.data-testid]="'rating-' + option.rating"
                            class="border px-3 py-3 text-left"
                            style="background:var(--card);border-color:var(--border)"
                            [style.opacity]="submitting() ? '0.5' : '1'">
                            <span class="block text-xs uppercase tracking-widest"
                              style="font-family:'DM Mono',monospace;color:var(--fg)">{{ option.label }}</span>
                            <span class="block mt-1"
                              style="font-family:'Lora',serif;font-size:12px;line-height:1.45;color:var(--muted)">
                              {{ option.description }}
                            </span>
                          </button>
                        }
                      </div>
                    </div>

                  </div>
                }

              </div>
            }
          }

          <!-- ── Summary ──────────────────────────────────────────────────── -->
          @if (phase() === 'summary') {
            <div class="space-y-5" data-testid="session-summary">

              <h1 style="font-family:'Playfair Display',serif;font-size:1.8rem;color:var(--fg)">Session complete</h1>

              <div class="grid grid-cols-2 gap-3">
                <div class="border px-4 py-3" data-testid="summary-face-to-name"
                  style="background:var(--card);border-color:var(--border)">
                  <p class="text-xs uppercase tracking-widest mb-1"
                    style="font-family:'DM Mono',monospace;color:var(--muted)">Face → Name</p>
                  <p style="font-family:'Playfair Display',serif;font-size:1.6rem;color:var(--fg)">
                    {{ faceToNameCount() }}
                  </p>
                </div>
                <div class="border px-4 py-3" data-testid="summary-name-to-face"
                  style="background:var(--card);border-color:var(--border)">
                  <p class="text-xs uppercase tracking-widest mb-1"
                    style="font-family:'DM Mono',monospace;color:var(--muted)">Name → Face</p>
                  <p style="font-family:'Playfair Display',serif;font-size:1.6rem;color:var(--fg)">
                    {{ nameToFaceCount() }}
                  </p>
                </div>
              </div>

              <div>
                <p class="text-xs uppercase tracking-widest mb-2"
                  style="font-family:'DM Mono',monospace;color:var(--muted)">Next reviews</p>
                <div class="border divide-y" data-testid="summary-schedule"
                  style="background:var(--card);border-color:var(--border)">
                  @for (entry of entries(); track $index) {
                    <div class="px-4 py-3 flex items-center justify-between gap-3" data-testid="summary-row"
                      [attr.data-rating]="entry.rating" style="border-color:var(--border)">
                      <span style="font-family:'Lora',serif;font-size:14.5px;color:var(--fg)">{{ entry.name }}</span>
                      <span class="text-xs shrink-0" data-testid="summary-next-review"
                        style="font-family:'DM Mono',monospace;color:var(--muted)">
                        {{ entry.nextReviewAt ? formatDate(entry.nextReviewAt) : '—' }}
                      </span>
                    </div>
                  }
                </div>
              </div>

              <button (click)="leave()" data-testid="finish-session-btn"
                class="w-full border px-5 py-4"
                style="background:var(--fg);border-color:var(--fg);font-family:'DM Mono',monospace;font-size:12px;letter-spacing:0.09em;text-transform:uppercase;color:var(--bg)">
                Back to dashboard
              </button>

            </div>
          }

        </div>
      </main>

    </div>
  `,
})
export class QuizComponent implements OnInit, OnDestroy {
  private quizService = inject(QuizService);
  private dashboardService = inject(DashboardService);
  private settingsService = inject(SettingsService);
  private speech = inject(SpeechRecognitionService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  readonly ratings = RATINGS;
  readonly modes = MODES;
  /** "Say the name" is only offered when the browser can actually listen (S-4.1.3). */
  readonly answerFormats = computed(() =>
    this.speech.isSupported ? ANSWER_FORMATS : ANSWER_FORMATS.filter(option => option.format !== 'spoken'),
  );

  readonly phase = signal<Phase>('start');
  readonly session = signal<QuizSession | null>(null);
  readonly index = signal(0);
  readonly typedAnswer = signal('');
  readonly selectedOptionId = signal<string | null>(null);
  readonly lastCorrect = signal(false);
  readonly submitting = signal(false);
  readonly entries = signal<SessionEntry[]>([]);
  readonly explainerVisible = signal(false);

  readonly dueCount = signal(0);
  readonly nextReviewAt = signal<string | null>(null);
  readonly countdown = signal('—');

  readonly mode = signal<QuizMode>('mixed');
  readonly answerFormat = signal<AnswerFormat>('choice');
  /** Local-only overlay on top of `answerFormat`: a spoken session still asks the
   * backend for `typed` (no options), it just answers by voice instead of a field. */
  readonly spokenAnswering = signal(false);
  readonly uiAnswerFormat = computed<UiAnswerFormat>(() => (this.spokenAnswering() ? 'spoken' : this.answerFormat()));
  readonly listening = signal(false);
  readonly spokenTranscript = signal<string | null>(null);
  readonly speechUnsupported = signal(false);
  readonly singleContactMode = signal(false);

  /**
   * Set the moment the user picks a session type or answer format. The start screen is
   * usable before the settings request resolves, so without this a response landing a
   * beat later would silently overwrite a choice already made — and the session would
   * run in a direction the user did not ask for.
   */
  private readonly preferencesTouched = signal(false);

  readonly currentQuestion = computed<QuizQuestion | null>(() => this.session()?.questions[this.index()] ?? null);
  readonly questionCount = computed(() => this.session()?.questions.length ?? 0);
  readonly faceToNameCount = computed(() => this.entries().filter(e => e.direction === 'face-to-name').length);
  readonly nameToFaceCount = computed(() => this.entries().filter(e => e.direction === 'name-to-face').length);

  /** Explainer suppression is persisted, so it survives a reload mid-first-session. */
  /**
   * `null` until the stored settings say. Three states rather than two because a user
   * who answers quickly can reach the reveal before the settings request resolves —
   * defaulting to `false` there would re-show an explainer they had already dismissed.
   * Unknown means "don't nag"; the answer arriving is what opens it if it should.
   */
  private readonly explainerSeen = signal<boolean | null>(null);
  private countdownTimer: ReturnType<typeof setInterval> | null = null;

  ngOnInit() {
    const params = this.route.snapshot.queryParamMap;
    const contactId = params.get('contactId');
    const scope = (params.get('scope') as QuizScope | null) ?? 'due';

    this.settingsService.get().subscribe({
      next: settings => this.applySettings(settings, contactId, params.get('start') === '1', scope),
      // A settings read that fails must not block the quiz — fall back to the same
      // defaults the server would have returned.
      error: () => this.applySettings(null, contactId, params.get('start') === '1', scope),
    });

    this.countdownTimer = setInterval(() => this.tickCountdown(), 1000);
  }

  ngOnDestroy() {
    if (this.countdownTimer) clearInterval(this.countdownTimer);
  }

  private applySettings(settings: UserSettings | null, contactId: string | null, autoStart: boolean, scope: QuizScope) {
    if (settings) {
      // Never over the top of a choice the user has already made on this screen.
      if (!this.preferencesTouched()) {
        this.mode.set(settings.quizMode);
        this.answerFormat.set(settings.quizAnswerFormat);
      }
      this.explainerSeen.set(settings.ratingExplainerSeen);
      // The user may already be looking at a reveal by now. If they have never seen the
      // explainer, this is the moment it becomes due — the first reveal is still on screen.
      if (!settings.ratingExplainerSeen && this.phase() === 'reveal') this.explainerVisible.set(true);
    }

    if (contactId) {
      // The post-add prompt (E-4.8): straight into one question about the person
      // just saved, with no start screen in the way.
      this.singleContactMode.set(true);
      this.startWith({ contactId, limit: 1 });
      return;
    }
    if (autoStart) {
      this.start(scope);
      return;
    }
    this.loadStartScreen();
  }

  private loadStartScreen() {
    this.dashboardService.getMetrics().subscribe({
      next: metrics => {
        this.dueCount.set(metrics.cardsDue);
        this.nextReviewAt.set(metrics.nextReviewAt);
        this.tickCountdown();
      },
      error: () => {},
    });
  }

  chooseMode(mode: QuizMode) {
    this.mode.set(mode);
    this.preferencesTouched.set(true);
  }

  /** Spoken answering rides on a `typed` request — the server only ever sees typed/choice. */
  chooseAnswerFormat(format: UiAnswerFormat) {
    this.answerFormat.set(format === 'spoken' ? 'typed' : format);
    this.spokenAnswering.set(format === 'spoken');
    this.preferencesTouched.set(true);
  }

  /**
   * Only an explicit choice is sent. Left unset, the server fills in the user's stored
   * preference — which is both the correct default and immune to the settings request
   * not having resolved by the time they hit start.
   */
  start(scope: QuizScope) {
    if (!this.preferencesTouched()) {
      this.startWith({ scope });
      return;
    }
    this.startWith({ scope, mode: this.mode(), answerFormat: this.answerFormat() });
  }

  private startWith(params: Parameters<QuizService['startSession']>[0]) {
    this.quizService.startSession(params).subscribe({
      next: session => {
        this.session.set(session);
        this.index.set(0);
        this.entries.set([]);
        this.resetAnswer();
        this.phase.set(session.questions.length === 0 ? 'empty' : 'question');
      },
      error: () => this.phase.set('empty'),
    });
  }

  // ── Answering ───────────────────────────────────────────────────────────────

  answerWithTypedName() {
    const question = this.currentQuestion();
    if (!question) return;
    this.reveal(normalise(this.typedAnswer()) === normalise(question.reveal.name));
  }

  answerWithOption(contactId: string) {
    const question = this.currentQuestion();
    if (!question) return;
    this.selectedOptionId.set(contactId);
    this.reveal(contactId === question.contactId);
  }

  /** A spoken guess is graded as a close match, not an exact one — see `namesMatch` (S-4.1.3). */
  async toggleListening() {
    if (this.listening()) return;
    if (!this.speech.isSupported) {
      this.speechUnsupported.set(true);
      return;
    }
    this.listening.set(true);
    this.spokenTranscript.set(null);
    const transcript = await this.speech.listenOnce();
    this.listening.set(false);
    if (!transcript) return;
    this.spokenTranscript.set(transcript);

    const question = this.currentQuestion();
    if (!question) return;
    this.reveal(namesMatch(transcript, question.reveal.name));
  }

  private reveal(correct: boolean) {
    this.lastCorrect.set(correct);
    // First reveal a user ever sees explains the ratings before asking for one (S-4.4.2).
    if (this.explainerSeen() === false) this.explainerVisible.set(true);
    this.phase.set('reveal');
  }

  rate(rating: RecallRating) {
    const question = this.currentQuestion();
    if (!question || this.submitting()) return;
    this.submitting.set(true);

    this.quizService
      .submitAnswer({ contactId: question.contactId, direction: question.direction, rating, correct: this.lastCorrect() })
      .subscribe({
        next: outcome => this.advance(question, rating, outcome.reviewCard.nextReviewAt),
        // The answer is the user's; losing the round trip should not cost them their
        // place in the session. The schedule column simply shows nothing for that row.
        error: () => this.advance(question, rating, null),
      });
  }

  private advance(question: QuizQuestion, rating: RecallRating, nextReviewAt: string | null) {
    this.entries.update(entries => [
      ...entries,
      { name: question.reveal.name, direction: question.direction, rating, correct: this.lastCorrect(), nextReviewAt },
    ]);
    this.submitting.set(false);
    this.resetAnswer();

    if (this.index() + 1 >= this.questionCount()) {
      this.phase.set('summary');
      return;
    }
    this.index.update(i => i + 1);
    this.phase.set('question');
  }

  private resetAnswer() {
    this.typedAnswer.set('');
    this.selectedOptionId.set(null);
    this.explainerVisible.set(false);
    this.listening.set(false);
    this.spokenTranscript.set(null);
    this.speechUnsupported.set(false);
  }

  // ── Rating explainer ────────────────────────────────────────────────────────

  /** Dismissing it persists, so it never reappears on its own again (S-4.4.2). */
  dismissExplainer() {
    this.explainerVisible.set(false);
    this.explainerSeen.set(true);
    this.settingsService.update({ ratingExplainerSeen: true }).subscribe({ next: () => {}, error: () => {} });
  }

  /** The "?" reopens it on demand without un-dismissing it. */
  toggleExplainer() {
    this.explainerVisible.update(visible => !visible);
  }

  // ── Navigation ──────────────────────────────────────────────────────────────

  /** Skipping the post-add prompt leaves the contact's schedule exactly as it was (S-4.8.2). */
  skip() {
    this.router.navigate(['/dashboard']);
  }

  leave() {
    this.router.navigate(['/dashboard']);
  }

  // ── Formatting ──────────────────────────────────────────────────────────────

  directionLabel(direction: QuizDirection): string {
    return direction === 'face-to-name' ? 'Face → Name' : 'Name → Face';
  }

  pad(n: number): string {
    return String(n).padStart(2, '0');
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  }

  formatDateTime(iso: string): string {
    return new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  }

  private tickCountdown() {
    const next = this.nextReviewAt();
    if (!next) {
      this.countdown.set('—');
      return;
    }
    this.countdown.set(formatRemaining(new Date(next).getTime() - Date.now()));
  }
}

function formatRemaining(ms: number): string {
  if (ms <= 0) return 'moments';
  const totalMinutes = Math.floor(ms / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}
