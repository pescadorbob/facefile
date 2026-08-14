import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

/** Which way round the retrieval runs. Mirrors amplify/functions/_shared/quizTypes.ts. */
export type QuizDirection = 'face-to-name' | 'name-to-face';
export type QuizMode = 'mixed' | QuizDirection;
export type QuizScope = 'due' | 'all';
export type AnswerFormat = 'typed' | 'choice';
export type RecallRating = 'forgot' | 'hard' | 'good' | 'easy';

export interface QuizOption {
  contactId: string;
  name: string;
  photoPath: string | null;
}

export interface QuizQuestion {
  contactId: string;
  direction: QuizDirection;
  answerFormat: AnswerFormat;
  prompt: { name: string | null; photoPath: string | null };
  options: QuizOption[];
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
  dueCount: number;
  contactCount: number;
  nextReviewAt: string | null;
  questions: QuizQuestion[];
}

export interface ReviewCard {
  contactId: string;
  easeFactor: number;
  interval: number;
  repetitions: number;
  lapses: number;
  nextReviewAt: string;
}

export interface AnswerOutcome {
  quizResult: {
    id: string;
    contactId: string;
    direction: QuizDirection;
    rating: RecallRating;
    quality: number;
    correct: boolean;
    lapse: boolean;
    answeredAt: string;
  };
  reviewCard: ReviewCard;
}

export interface StartSessionParams {
  mode?: QuizMode;
  scope?: QuizScope;
  answerFormat?: AnswerFormat;
  limit?: number;
  /** Set for the immediate post-add quiz — one question about that contact. */
  contactId?: string | null;
}

export interface SubmitAnswerPayload {
  contactId: string;
  direction: QuizDirection;
  rating: RecallRating;
  correct: boolean;
}

@Injectable({ providedIn: 'root' })
export class QuizService {
  private http = inject(HttpClient);

  /**
   * Anything left unset is filled in server-side from the user's stored preferences,
   * so the caller only sends what this particular session is overriding.
   */
  startSession(params: StartSessionParams = {}): Observable<QuizSession> {
    let httpParams = new HttpParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') httpParams = httpParams.set(key, String(value));
    }
    return this.http.get<QuizSession>('/api/quiz/session', { params: httpParams });
  }

  submitAnswer(payload: SubmitAnswerPayload): Observable<AnswerOutcome> {
    return this.http.post<AnswerOutcome>('/api/quiz/answer', payload);
  }
}
