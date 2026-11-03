import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
  inject,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { CartDrawerService } from '../core/cart-drawer.service';
import { CartService } from '../core/cart.service';
import { SolesPipe } from '../core/money';
import { CartItemComponent } from './cart-item.component';

/** Panel lateral del carrito: ítems con sus controles, total y paso al checkout. */
@Component({
  selector: 'app-cart-drawer',
  imports: [SolesPipe, CartItemComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'drawer.close()' },
  template: `
    @if (drawer.open()) {
      <div class="fixed inset-0 z-40 bg-slate-900/40" aria-hidden="true" (click)="drawer.close()"></div>
      <aside
        id="cart-drawer"
        class="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
      >
        <div class="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 id="cart-drawer-title" class="font-display text-xl uppercase tracking-wide text-hora-azul-900">Tu carrito</h2>
          <button
            #closeButton
            type="button"
            class="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-hora-azul-600"
            aria-label="Cerrar carrito"
            (click)="drawer.close()"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        @if (cart.isEmpty()) {
          <p class="flex-1 px-5 py-10 text-center text-slate-600">Tu carrito está vacío.</p>
        } @else {
          <ul class="flex-1 divide-y divide-slate-100 overflow-y-auto px-5">
            @for (item of cart.items(); track item.tarjetaId) {
              <li><app-cart-item [item]="item" /></li>
            }
          </ul>
        }

        @if (!cart.persistent()) {
          <p class="border-t border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-900" role="status">
            Tu carrito no se guardará al cerrar el navegador.
          </p>
        }

        <div class="border-t border-slate-200 px-5 py-4">
          <p class="flex justify-between text-lg font-semibold text-hora-azul-900">
            <span>Total</span>
            <span>{{ cart.totalAmount() | soles }}</span>
          </p>
          @if (emptyWarning()) {
            <p class="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900" role="alert">
              Agrega al menos una tarjeta antes de confirmar tu pedido.
            </p>
          }
          <button
            type="button"
            class="mt-4 w-full rounded-xl bg-hora-azul-700 px-6 py-3 text-base font-semibold text-white hover:bg-hora-azul-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hora-azul-600"
            (click)="confirmOrder()"
          >
            Confirmar pedido
          </button>
        </div>
      </aside>
    }
  `,
})
export class CartDrawerComponent {
  protected readonly cart = inject(CartService);
  protected readonly drawer = inject(CartDrawerService);
  private readonly router = inject(Router);

  protected readonly emptyWarning = signal(false);
  private readonly closeButton = viewChild<ElementRef<HTMLButtonElement>>('closeButton');

  constructor() {
    // Al abrir el panel, mover el foco dentro de él para la navegación por teclado
    afterRenderEffect(() => {
      if (this.drawer.open()) {
        untracked(() => this.emptyWarning.set(false));
        this.closeButton()?.nativeElement.focus();
      }
    });
  }

  protected confirmOrder(): void {
    if (this.cart.isEmpty()) {
      this.emptyWarning.set(true);
      return;
    }
    this.drawer.close();
    this.router.navigate(['/checkout']);
  }
}
