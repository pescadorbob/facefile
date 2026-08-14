import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Locus {
  id: string;
  name: string;
  position: number;
}

export interface Palace {
  id: string;
  name: string;
  loci: Locus[];
}

@Injectable({ providedIn: 'root' })
export class PalacesService {
  private http = inject(HttpClient);

  list(): Observable<Palace[]> {
    return this.http.get<Palace[]>('/api/palaces');
  }

  /** `loci` is ordered — it is the walking order through the place, not a set. */
  create(name: string, loci: string[]): Observable<Palace> {
    return this.http.post<Palace>('/api/palaces', { name, loci });
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`/api/palaces/${id}`);
  }
}
