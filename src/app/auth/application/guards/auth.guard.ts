import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  await authService.ensureAuthStateResolved();

  if (authService.getIsAuthenticated()()) {
    return true;
  }

  return router.createUrlTree(['/auth/login']);
};

