import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DashboardMetrics {
  peopleAdded: number;
  cardsDue: number;
  totalQuizAnswers: number;
  accuracyPercentage: number | null;
  /** Earliest scheduled review, or null when the user has no cards at all. */
  nextReviewAt: string | null;
}

export interface UpcomingContact {
  id: string;
  name: string;
  photoPath: string | null;
}

export interface UpcomingDay {
  /** `YYYY-MM-DD` in the user's own timezone. */
  date: string;
  count: number;
  contacts: UpcomingContact[];
}

export interface UpcomingReviews {
  horizonDays: number;
  timeZone: string;
  today: string;
  /** Only days that actually have reviews — empty days are never returned. */
  days: UpcomingDay[];
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);

  getMetrics(): Observable<DashboardMetrics> {
    return this.http.get<DashboardMetrics>('/api/dashboard/metrics');
  }

  getUpcoming(days?: number): Observable<UpcomingReviews> {
    const params = days === undefined ? undefined : new HttpParams().set('days', String(days));
    return this.http.get<UpcomingReviews>('/api/dashboard/upcoming', { params });
  }
}
