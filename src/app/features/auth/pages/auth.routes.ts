import { Routes } from '@angular/router';

export const authRoutes: Routes = [
    {
      path: 'login',
      loadComponent: () => import('./auth/auth.component').then(m => m.AuthComponent)
    },
    {
      path: 'select-role',
      loadComponent: () => import('./role-selector/select-role.component').then(m => m.SelectRoleComponent)
    },
    {
      path: 'register/teacher',
      loadComponent: () => import('./register-teacher/register-teacher.component').then(m =>m.RegisterTeacherComponent)
    },
    {
      path: 'register/student',
      loadComponent: () => import('./register-student/register-student.component').then(m => m.RegisterStudentComponent)
    }

  ];
  
