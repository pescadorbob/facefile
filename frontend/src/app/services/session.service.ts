import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SessionUser {
  id: number;
  name: string;
  email: string;
  active: boolean;
}

@Injectable({ providedIn: 'root' })
export class SessionService {
  private http = inject(HttpClient);

  select(userId: number, rememberMe: boolean): Observable<SessionUser> {
    return this.http.post<SessionUser>('/api/session', { userId, rememberMe });
  }

  checkSession(): Observable<SessionUser> {
    return this.http.get<SessionUser>('/api/session/me');
  }

  switchProfile(): Observable<void> {
    return this.http.delete<void>('/api/session');
  }
}
