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
    path: 'auth',
    loadChildren: () => import('./features/auth/pages/auth.routes').then(m => m.authRoutes) 
  },
  {
    path: 'tasks',
    canActivate: [authGuard],
    loadChildren: () => import('./features/tasks/tasks.routes').then(m => m.tasksRoutes)
  },
  {
    path: 'chat',
    loadChildren: () =>
      import('./features/chat/chat.routes').then((m) => m.chatRoutes)
  },

  {
    path: 'calendar',
    loadChildren: () => import('./features/calendar/calendar.router').then(m => m.calendarRoutes)
  }
  
];