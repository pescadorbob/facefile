import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AdminUser {
  id: string;
  name: string;
  /** Absent on profiles created from the picker — those are name-only. */
  email?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserPayload {
  name: string;
  email: string;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
}

@Injectable({ providedIn: 'root' })
export class AdminUsersService {
  private http = inject(HttpClient);

  list(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>('/api/admin/users');
  }

  listActive(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>('/api/admin/users', { params: { status: 'active' } });
  }

  create(payload: CreateUserPayload): Observable<AdminUser> {
    return this.http.post<AdminUser>('/api/admin/users', payload);
  }

  update(id: string, payload: UpdateUserPayload): Observable<AdminUser> {
    return this.http.patch<AdminUser>(`/api/admin/users/${id}`, payload);
  }

  deactivate(id: string): Observable<AdminUser> {
    return this.http.post<AdminUser>(`/api/admin/users/${id}/deactivate`, {});
  }

  reactivate(id: string): Observable<AdminUser> {
    return this.http.post<AdminUser>(`/api/admin/users/${id}/reactivate`, {});
  }
}
