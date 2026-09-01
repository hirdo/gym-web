import { Routes } from '@angular/router';
import { canActivateAuth } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/landing/landing.component').then(
        (m) => m.LandingComponent
      )
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
    canActivate: [canActivateAuth]
  },
  {
    path: 'workouts',
    canActivate: [canActivateAuth],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/workouts/workout-list/workout-list.component').then(
            (m) => m.WorkoutListComponent
          )
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./features/workouts/workout-create/workout-create.component').then(
            (m) => m.WorkoutCreateComponent
          )
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./features/workouts/workout-detail/workout-detail.component').then(
            (m) => m.WorkoutDetailComponent
          )
      }
    ]
  },
  {
    path: 'schedule',
    loadComponent: () =>
      import('./features/schedule/schedule.component').then(
        (m) => m.ScheduleComponent
      ),
    canActivate: [canActivateAuth]
  },
  {
    path: 'membership',
    loadComponent: () =>
      import('./features/membership/membership.component').then(
        (m) => m.MembershipComponent
      ),
    canActivate: [canActivateAuth]
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./features/profile/profile.component').then(
        (m) => m.ProfileComponent
      ),
    canActivate: [canActivateAuth]
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./features/admin/admin.component').then(
        (m) => m.AdminComponent
      ),
    canActivate: [canActivateAuth],
    data: { roles: ['admin'] }
  },
  {
    path: '**',
    redirectTo: ''
  }
];
