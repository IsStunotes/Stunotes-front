import { Routes } from '@angular/router';
import { authGuard } from '../app/core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/',
    pathMatch: 'full'
  },
  {
    path: 'tasks',
    canActivate: [authGuard],
    loadChildren: () => import('./features/tasks/tasks.routes').then(m => m.tasksRoutes)
  }
];