import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Notification {
  id: string;
  channel: string;
  message: string;
  /** Where tapping the notification takes the user — a due-review session. */
  link: string;
  dueCount: number;
  sentAt: string;
  readAt: string | null;
}

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private http = inject(HttpClient);

  list(): Observable<Notification[]> {
    return this.http.get<Notification[]>('/api/notifications');
  }

  markRead(id: string): Observable<void> {
    return this.http.post<void>(`/api/notifications/${id}/read`, {});
  }
}
