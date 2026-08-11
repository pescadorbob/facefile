import { Routes } from '@angular/router';
import { profileGuard } from './guards/profile.guard';

export const routes: Routes = [
  {
    path: 'select-profile',
    loadComponent: () =>
      import('./pages/select-profile/select-profile.component').then((m) => m.SelectProfileComponent),
  },
  {
    path: 'tutorial',
    canActivate: [profileGuard],
    loadComponent: () =>
      import('./pages/tutorial/tutorial.component').then((m) => m.TutorialComponent),
  },
  {
    path: 'persons/new',
    canActivate: [profileGuard],
    loadComponent: () =>
      import('./pages/add-person/add-person.component').then((m) => m.AddPersonComponent),
  },
  {
    path: 'quiz',
    canActivate: [profileGuard],
    loadComponent: () =>
      import('./pages/quiz/quiz.component').then((m) => m.QuizComponent),
  },
  {
    path: 'admin/users',
    canActivate: [profileGuard],
    loadComponent: () =>
      import('./pages/admin/users/admin-users.component').then((m) => m.AdminUsersComponent),
  },
  { path: '', redirectTo: 'tutorial', pathMatch: 'full' },
];
