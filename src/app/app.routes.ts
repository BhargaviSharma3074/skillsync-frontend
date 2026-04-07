import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  // ── Public (no shell) ──
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./features/auth/forget-password/forget-password.component').then(m => m.ForgotPasswordComponent)
  },

  // ── Authenticated (shell layout) ──
  {
    path: '',
    loadComponent: () => import('./layout/shell/shell.component').then(m => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'mentors',
        loadComponent: () => import('./features/mentors/mentor-list/mentor-list.component').then(m => m.MentorListComponent)
      },
      {
        path: 'mentors/:id',
        loadComponent: () => import('./features/mentors/mentor-profile/mentor-profile.component').then(m => m.MentorProfileComponent)
      },
      {
        path: 'sessions',
        loadComponent: () => import('./features/sessions/session-history/session-history.component').then(m => m.SessionHistoryComponent)
      },
      {
        path: 'sessions/book/:mentorId',
        loadComponent: () => import('./features/sessions/book-session/book-session.component').then(m => m.BookSessionComponent)
      },
      {
        path: 'groups',
        loadComponent: () => import('./features/groups/group-list/group-list.component').then(m => m.GroupListComponent)
      },
      {
        path: 'apply-mentor',
        loadComponent: () => import('./features/mentors/apply-mentor/apply-mentor.component').then(m => m.ApplyMentorComponent)
      },
      {
        path: 'reviews',
        loadComponent: () => import('./features/reviews/review-form/review-form.component').then(m => m.ReviewFormComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent)
      },
      {
        path: 'profile/edit',
        loadComponent: () => import('./features/profile/edit-profile/edit-profile.component').then(m => m.EditProfileComponent)
      },
      {
        path: 'admin',
        canActivate: [adminGuard],
        loadComponent: () => import('./features/admin/admin-console/admin-console.component').then(m => m.AdminConsoleComponent)
      },
      // Placeholder routes
      {
        path: 'notifications',
        loadComponent: () => import('./features/notifications/notifications.component').then(m => m.NotificationsComponent)
      },
      { path: 'settings', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'admin/users', loadComponent: () => import('./features/admin/admin-console/admin-console.component').then(m => m.AdminConsoleComponent) },
      { path: 'admin/approvals', loadComponent: () => import('./features/admin/admin-console/admin-console.component').then(m => m.AdminConsoleComponent) },
      { path: 'admin/skills', loadComponent: () => import('./features/admin/admin-console/admin-console.component').then(m => m.AdminConsoleComponent) },
    ]
  },

  // ── Fallback ──
  { path: '**', redirectTo: 'dashboard' }
];