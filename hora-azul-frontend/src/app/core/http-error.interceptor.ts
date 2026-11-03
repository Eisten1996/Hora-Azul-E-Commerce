import { HttpContextToken, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

/** Marca una petición cuyos errores no deben registrarse (ej. el keep-alive silencioso). */
export const SILENT_HTTP_ERRORS = new HttpContextToken<boolean>(() => false);

/**
 * Registra en consola los errores de red (`status 0`) y de servidor (5xx) y
 * relanza el error para que cada servicio o componente lo maneje localmente.
 */
export const httpErrorInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(
    catchError((error: unknown) => {
      const loggable =
        error instanceof HttpErrorResponse && (error.status === 0 || error.status >= 500);
      if (loggable && !req.context.get(SILENT_HTTP_ERRORS)) {
        const kind = error.status === 0 ? 'Error de red' : `Error del servidor (${error.status})`;
        console.error(`[HTTP] ${kind} en ${req.method} ${req.urlWithParams}`, error);
      }
      return throwError(() => error);
    }),
  );
