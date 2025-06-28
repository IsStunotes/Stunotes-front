import { Routes } from '@angular/router';
import { authGuard } from '../app/core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    // cambiar antes de lanzar a landing 
    redirectTo: 'landing',
    pathMatch: 'full'
  },
  {
    path: 'landing',
    loadChildren: () => import('./features/landing/landing.routes').then(m => m.landingRoutes)
  },
  {
    path: 'home',
    canActivate: [authGuard],
    loadComponent: () => import('./shared/homepage/homepage.component').then(m => m.HomeComponent)
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/pages/auth.routes').then(m => m.authRoutes) 
  },
  {
    path: 'tasks',
    canActivate: [authGuard],
    loadChildren: () => import('./features/tasks/tasks.routes').then(m => m.tasksRoutes)
  },
  {
    path: 'repositorios',
    canActivate: [authGuard],  
    loadChildren: () => import('./features/repository/repository.routes').then(m => m.repositoryRoutes)
  },
  {
    path: 'document/:id/comments',
    loadComponent: () =>
      import('./features/documents/document-comments.component').then(m => m.DocumentCommentsComponent)
  },
  {
    path: 'document/create',
    loadComponent: () => import('./features/documents/document-create/document-create.component').then(m => m.DocumentCreateComponent)
  },
  {
    path: 'chat',
    loadChildren: () =>
      import('./features/chat/chat.routes').then((m) => m.chatRoutes)
  }/*,
  {
    path: 'notes',
    canActivate: [authGuard],
    loadChildren: () => import('./features/notes/notes.routes').then(m => m.notesRoutes)
  },
  {
  
    path: 'calendar',
    loadChildren: () => import('./features/calendar/calendar.router').then(m => m.calendarRoutes)
  }*/,{
    path: 'recover',
    loadComponent: () =>
      import('./features/auth/pages/recover/recover.component').then(m => m.RecoverComponent)
  },
  {
    path: 'reset/:token',
    loadComponent: () =>
      import('./features/auth/pages/recover/reset-password.component').then(m => m.ResetPasswordComponent)
  }  
];
