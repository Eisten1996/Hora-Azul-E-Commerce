import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';
import { httpErrorInterceptor } from './core/http-error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    // Sin zone.js: la app usa signals y OnPush, y así arranca más rápido en móviles
    provideZonelessChangeDetection(),
    // Cada página nueva empieza arriba; "atrás" del navegador recupera la posición anterior
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'enabled' })),
    provideHttpClient(withFetch(), withInterceptors([httpErrorInterceptor])),
  ],
};
