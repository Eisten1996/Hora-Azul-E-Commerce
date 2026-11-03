import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

/**
 * Registra en consola los errores de red (`status 0`) y de servidor (5xx) y
 * relanza el error para que cada servicio o componente lo maneje localmente.
 */
export const httpErrorInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && (error.status === 0 || error.status >= 500)) {
        const kind = error.status === 0 ? 'Error de red' : `Error del servidor (${error.status})`;
        console.error(`[HTTP] ${kind} en ${req.method} ${req.urlWithParams}`, error);
      }
      return throwError(() => error);
    }),
  );
