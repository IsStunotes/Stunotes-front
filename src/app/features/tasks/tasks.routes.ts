import { Routes } from '@angular/router';

export const tasksRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/task-list/task-list.component').then(m => m.TaskListComponent)
  }, 
  {
    path: 'new',
    loadComponent: () => import('./pages/task-form/task-form.component').then(m => m.TaskFormComponent)
  },

  {
    path: ':id/edit',
    loadComponent: () => import('./pages/task-form/task-form.component').then(m => m.TaskFormComponent)
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];
