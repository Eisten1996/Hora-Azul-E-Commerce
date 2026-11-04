import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AdminAuthService } from '../core/admin-auth.service';

/** Estructura común de las páginas del panel: navegación propia y contenido. */
@Component({
  selector: 'app-admin-layout',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a
      href="#contenido-admin"
      class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-hora-azul-800 focus:shadow"
    >
      Saltar al contenido
    </a>
    <header class="bg-hora-azul-900 text-white">
      <nav class="mx-auto flex max-w-7xl flex-wrap items-center gap-x-2 gap-y-1 px-4 py-2 sm:px-6" aria-label="Panel administrativo">
        <span class="mr-4 font-display text-lg uppercase tracking-[0.15em]">Panel</span>
        @for (link of links; track link.url) {
          <a
            [routerLink]="link.url"
            routerLinkActive="bg-hora-azul-700"
            ariaCurrentWhenActive="page"
            class="rounded-md px-3 py-2 text-sm font-medium hover:bg-hora-azul-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            {{ link.label }}
          </a>
        }
        <span class="ml-auto flex items-center gap-1">
          <a
            routerLink="/"
            class="rounded-md px-3 py-2 text-sm hover:bg-hora-azul-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Ver tienda
          </a>
          <button
            type="button"
            class="rounded-md px-3 py-2 text-sm hover:bg-hora-azul-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            (click)="logout()"
          >
            Cerrar sesión
          </button>
        </span>
      </nav>
    </header>
    <main id="contenido-admin" class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
      <router-outlet />
    </main>
  `,
})
export default class AdminLayoutComponent {
  private readonly auth = inject(AdminAuthService);
  private readonly router = inject(Router);

  protected readonly links = [
    { url: '/admin/ordenes', label: 'Órdenes' },
    { url: '/admin/tarjetas', label: 'Tarjetas' },
  ];

  protected logout(): void {
    // Primero se navega: si hay cambios sin guardar, el formulario puede cancelar la salida
    void this.router.navigateByUrl('/admin/login').then((left) => {
      if (left) {
        this.auth.logout();
      }
    });
  }
}
