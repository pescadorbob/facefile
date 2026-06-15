import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TutorialProgress {
  currentStep: number;
  completed: boolean;
}

@Injectable({ providedIn: 'root' })
export class TutorialService {
  private http = inject(HttpClient);

  getProgress(): Observable<TutorialProgress> {
    return this.http.get<TutorialProgress>('/api/tutorial/progress');
  }

  saveProgress(currentStep: number, completed: boolean): Observable<TutorialProgress> {
    return this.http.put<TutorialProgress>('/api/tutorial/progress', { currentStep, completed });
  }
}
