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
}
