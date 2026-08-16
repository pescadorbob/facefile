import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CreateContactPayload {
  name: string;
  palaceId: string | null;
  locusId: string | null;
  nameImage: string;
  associationScene: string;
  photo: File | null;
}

export interface Contact {
  id: string;
  name: string;
  photoPath: string | null;
  nameImage: string | null;
  associationScene: string | null;
}

export interface UpdateContactPayload {
  name: string;
  /** A newly chosen file replaces the photo; omit both this and removePhoto to leave it alone. */
  photo?: File | null;
  /** Clears the saved photo back to the placeholder (S-2.6.4). Ignored if `photo` is also set. */
  removePhoto?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ContactsService {
  private http = inject(HttpClient);

  create(payload: CreateContactPayload): Observable<Contact> {
    const form = new FormData();
    form.append('name', payload.name);
    if (payload.palaceId != null) form.append('palaceId', String(payload.palaceId));
    if (payload.locusId != null) form.append('locusId', String(payload.locusId));
    if (payload.nameImage) form.append('nameImage', payload.nameImage);
    if (payload.associationScene) form.append('associationScene', payload.associationScene);
    if (payload.photo) form.append('photo', payload.photo);
    return this.http.post<Contact>('/api/contacts', form);
  }

  list(): Observable<Contact[]> {
    return this.http.get<Contact[]>('/api/contacts');
  }

  get(id: string): Observable<Contact> {
    return this.http.get<Contact>(`/api/contacts/${id}`);
  }

  update(id: string, payload: UpdateContactPayload): Observable<Contact> {
    const form = new FormData();
    form.append('name', payload.name);
    if (payload.photo) form.append('photo', payload.photo);
    else if (payload.removePhoto) form.append('removePhoto', 'true');
    return this.http.patch<Contact>(`/api/contacts/${id}`, form);
  }
}
