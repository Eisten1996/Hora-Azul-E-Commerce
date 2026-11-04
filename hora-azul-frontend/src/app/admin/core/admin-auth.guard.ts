import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AdminAuthService } from './admin-auth.service';

const DEFAULT_ADMIN_URL = '/admin/ordenes';

/** Sin sesión, redirige al acceso recordando la página que se intentaba abrir. */
export const adminAuthGuard: CanActivateFn = (_route, state) =>
  inject(AdminAuthService).isLoggedIn() ||
  inject(Router).createUrlTree(['/admin/login'], { queryParams: { returnUrl: state.url } });

/** Solo se vuelve a páginas del panel, para que un enlace no pueda llevar a otro sitio tras el acceso. */
export function safeReturnUrl(returnUrl: string | null): string {
  return returnUrl?.startsWith('/admin/') && !returnUrl.startsWith('/admin/login') ? returnUrl : DEFAULT_ADMIN_URL;
}
