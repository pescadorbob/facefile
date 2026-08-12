import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SessionUser {
  id: string;
  name: string;
  /** Absent on profiles created from the picker — those are name-only. */
  email?: string;
  active: boolean;
}

@Injectable({ providedIn: 'root' })
export class SessionService {
  private http = inject(HttpClient);

  select(userId: string, rememberMe: boolean): Observable<SessionUser> {
    return this.http.post<SessionUser>('/api/session', { userId, rememberMe });
  }

  /** Creates a name-only profile and signs straight in as it (one call, one cookie). */
  createProfile(name: string, rememberMe: boolean): Observable<SessionUser> {
    return this.http.post<SessionUser>('/api/session/profiles', { name, rememberMe });
  }

  checkSession(): Observable<SessionUser> {
    return this.http.get<SessionUser>('/api/session/me');
  }

  switchProfile(): Observable<void> {
    return this.http.delete<void>('/api/session');
  }
}
