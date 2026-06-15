import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'tutorial',
    loadComponent: () =>
      import('./pages/tutorial/tutorial.component').then((m) => m.TutorialComponent),
  },
  { path: '', redirectTo: 'tutorial', pathMatch: 'full' },
];
