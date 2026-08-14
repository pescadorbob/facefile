import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AnswerFormat, QuizMode } from './quiz.service';

export interface UserSettings {
  quizMode: QuizMode;
  quizAnswerFormat: AnswerFormat;
  /** False until the user dismisses the rating explainer, which they only ever do once. */
  ratingExplainerSeen: boolean;
  remindersEnabled: boolean;
  reminderHour: number;
  reminderMinute: number;
  reminderTimezone: string;
  /** Empty means no channel is enabled — reminders are silently skipped. */
  reminderChannels: string[];
  lastReminderSentOn: string | null;
}

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private http = inject(HttpClient);

  get(): Observable<UserSettings> {
    return this.http.get<UserSettings>('/api/settings');
  }

  /**
   * Partial: the server merges. Turning reminders off sends only `remindersEnabled`,
   * which is what leaves the configured time intact for when they are turned back on.
   */
  update(changes: Partial<UserSettings>): Observable<UserSettings> {
    return this.http.put<UserSettings>('/api/settings', changes);
  }
}
