import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'tutorial',
    loadComponent: () =>
      import('./pages/tutorial/tutorial.component').then((m) => m.TutorialComponent),
  },
  {
    path: 'persons/new',
    loadComponent: () =>
      import('./pages/add-person/add-person.component').then((m) => m.AddPersonComponent),
  },
  {
    path: 'quiz',
    loadComponent: () =>
      import('./pages/quiz/quiz.component').then((m) => m.QuizComponent),
  },
  {
    path: 'admin/users',
    loadComponent: () =>
      import('./pages/admin/users/admin-users.component').then((m) => m.AdminUsersComponent),
  },
  { path: '', redirectTo: 'tutorial', pathMatch: 'full' },
];
