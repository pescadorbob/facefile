import { Routes } from '@angular/router';
import { profileGuard } from './guards/profile.guard';

export const routes: Routes = [
  {
    path: 'select-profile',
    loadComponent: () =>
      import('./pages/select-profile/select-profile.component').then((m) => m.SelectProfileComponent),
  },
  {
    path: 'dashboard',
    canActivate: [profileGuard],
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
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
    path: 'persons/:id/edit',
    canActivate: [profileGuard],
    loadComponent: () =>
      import('./pages/edit-person/edit-person.component').then((m) => m.EditPersonComponent),
  },
  {
    path: 'quiz',
    canActivate: [profileGuard],
    loadComponent: () =>
      import('./pages/quiz/quiz.component').then((m) => m.QuizComponent),
  },
  {
    path: 'reviews/upcoming',
    canActivate: [profileGuard],
    loadComponent: () =>
      import('./pages/reviews/upcoming-reviews.component').then((m) => m.UpcomingReviewsComponent),
  },
  {
    path: 'settings/notifications',
    canActivate: [profileGuard],
    loadComponent: () =>
      import('./pages/settings/notification-settings.component').then((m) => m.NotificationSettingsComponent),
  },
  {
    path: 'teach',
    canActivate: [profileGuard],
    loadComponent: () =>
      import('./pages/teach/teach.component').then((m) => m.TeachComponent),
  },
  {
    path: 'meetings',
    canActivate: [profileGuard],
    loadComponent: () =>
      import('./pages/meetings/meetings.component').then((m) => m.MeetingsComponent),
  },
  {
    path: 'palaces',
    canActivate: [profileGuard],
    loadComponent: () =>
      import('./pages/palaces/palaces.component').then((m) => m.PalacesComponent),
  },
  {
    path: 'admin/users',
    canActivate: [profileGuard],
    loadComponent: () =>
      import('./pages/admin/users/admin-users.component').then((m) => m.AdminUsersComponent),
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
];
