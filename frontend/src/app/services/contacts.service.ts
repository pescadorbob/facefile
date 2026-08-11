import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CreateContactPayload {
  name: string;
  palaceId: number | null;
  locusId: number | null;
  nameImage: string;
  associationScene: string;
  photo: File | null;
}

export interface Contact {
  id: number;
  name: string;
  photoPath: string | null;
  nameImage: string | null;
  associationScene: string | null;
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
}
