import { Routes } from '@angular/router';
import { authGuard } from '../app/core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'landing',
    pathMatch: 'full'
  },
  {
    path: 'landing',
    loadChildren: () => import('./features/landing/landing.routes').then(m => m.landingRoutes)
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/pages/auth.routes').then(m => m.authRoutes) 
  },
  {
    path: 'tasks',
    canActivate: [authGuard],
    loadChildren: () => import('./features/tasks/tasks.routes').then(m => m.tasksRoutes)
  }
];