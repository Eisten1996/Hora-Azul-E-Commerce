import { HttpContextToken, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AdminAuthService } from './admin-auth.service';

/** Marca una petición del panel: es la única que puede llevar las credenciales. */
export const ADMIN_REQUEST = new HttpContextToken<boolean>(() => false);

/** Las credenciales solo se envían en peticiones marcadas y dirigidas a la API. */
export function shouldAttachCredentials(url: string, isAdminRequest: boolean): boolean {
  return isAdminRequest && url.startsWith(`${environment.apiUrl}/api/`);
}

/** Añade las credenciales a las peticiones del panel y cierra la sesión si el backend las rechaza. */
export const adminAuthInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AdminAuthService);
  const authorization = auth.authorization();
  if (!authorization || !shouldAttachCredentials(req.url, req.context.get(ADMIN_REQUEST))) {
    return next(req);
  }

  const router = inject(Router);
  return next(req.clone({ setHeaders: { Authorization: authorization } })).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        auth.logout();
        void router.navigate(['/admin/login'], {
          queryParams: { sesion: 'expirada', returnUrl: router.url },
        });
      }
      return throwError(() => error);
    }),
  );
};
