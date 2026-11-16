import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { AuthService, Role } from './auth.service';

/** Redirige vers /connexion?retour=... si l'utilisateur n'est pas connecté. */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.connecte()
    ? true
    : router.createUrlTree(['/connexion'], { queryParams: { retour: state.url } });
};

/** Fabrique : autorise uniquement les rôles donnés (à utiliser en canActivateChild). */
export const roleGuard =
  (...roles: Role[]): CanActivateChildFn =>
  (_route, state) => {
    const auth = inject(AuthService);
    const router = inject(Router);
    if (!auth.connecte()) {
      return router.createUrlTree(['/connexion'], { queryParams: { retour: state.url } });
    }
    return auth.aRole(...roles) ? true : router.createUrlTree(['/films']);
  };
