import { Routes } from '@angular/router';

export const notesRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/note-list/note-list.component').then(m => m.NoteListComponent)
  },
  {
    path: 'new',
    loadComponent: () => import('./pages/note-form/note-form.component').then(m => m.NoteFormComponent)
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./pages/note-form/note-form.component').then(m => m.NoteFormComponent)
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];