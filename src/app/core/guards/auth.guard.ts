import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  if (state.url.startsWith('/auth') && token) {
    router.navigate(['/dashboard']);
    return false;
  }

  if (!state.url.startsWith('/auth') && !token) {
    router.navigate(['/auth/login']);
    return false;
  }

  return true;
}; 