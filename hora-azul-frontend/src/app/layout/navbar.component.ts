import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartDrawerService } from '../core/cart-drawer.service';
import { CartService } from '../core/cart.service';

/** Barra superior: logo, acceso al catálogo y botón del carrito con badge. */
@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <nav class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:h-20 sm:px-6">
        <a
          routerLink="/"
          class="flex items-center gap-3 rounded-md text-hora-azul-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-hora-azul-600"
          aria-label="Hora Azul, ir al catálogo"
        >
          <img
            src="brand/hora-azul-logo-112.webp"
            alt=""
            width="123"
            height="112"
            class="h-12 w-auto rounded-md"
          />
          <span class="font-display text-xl uppercase tracking-[0.2em] sm:text-2xl">Hora Azul</span>
        </a>

        <button
          type="button"
          class="relative inline-flex h-11 w-11 items-center justify-center rounded-full text-hora-azul-900 hover:bg-hora-azul-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hora-azul-600"
          [attr.aria-label]="cartLabel()"
          [attr.aria-expanded]="drawer.open()"
          aria-controls="cart-drawer"
          (click)="drawer.toggle()"
        >
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z" />
          </svg>
          @if (cart.totalItems() > 0) {
            <span
              class="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-hora-azul-500 px-1 text-xs font-bold text-hora-azul-900"
              data-testid="cart-badge"
              aria-hidden="true"
            >
              {{ cart.totalItems() }}
            </span>
          }
        </button>
      </nav>
    </header>
  `,
})
export class NavbarComponent {
  protected readonly cart = inject(CartService);
  protected readonly drawer = inject(CartDrawerService);

  protected readonly cartLabel = computed(() => {
    const total = this.cart.totalItems();
    return total === 0
      ? 'Abrir carrito (vacío)'
      : `Abrir carrito (${total} ${total === 1 ? 'tarjeta' : 'tarjetas'})`;
  });
}
