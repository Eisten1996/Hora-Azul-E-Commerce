import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CartDrawerService } from '../core/cart-drawer.service';
import { CartService, lineSubtotal } from '../core/cart.service';
import { SolesPipe } from '../core/money';

/**
 * Panel lateral del carrito.
 *
 * <p>Versión de solo lectura: los controles de cantidad, eliminar y el paso al
 * checkout se añaden en las tareas 8.3 y 8.4.</p>
 */
@Component({
  selector: 'app-cart-drawer',
  imports: [SolesPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'drawer.close()' },
  template: `
    @if (drawer.open()) {
      <div class="fixed inset-0 z-40 bg-slate-900/40" aria-hidden="true" (click)="drawer.close()"></div>
      <aside
        id="cart-drawer"
        class="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
      >
        <div class="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 id="cart-drawer-title" class="text-lg font-semibold text-slate-900">Tu carrito</h2>
          <button
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
              <li class="flex justify-between gap-4 py-4">
                <div>
                  <p class="font-medium text-slate-900">{{ item.cardName }}</p>
                  <p class="text-sm text-slate-600">{{ item.unitPrice | soles }} × {{ item.quantity }}</p>
                </div>
                <p class="font-medium text-slate-900">{{ subtotal(item) | soles }}</p>
              </li>
            }
          </ul>
          <div class="border-t border-slate-200 px-5 py-4">
            <p class="flex justify-between text-base font-semibold text-slate-900">
              <span>Total</span>
              <span>{{ cart.totalAmount() | soles }}</span>
            </p>
          </div>
        }

        @if (!cart.persistent()) {
          <p class="border-t border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-900" role="status">
            Tu carrito no se guardará al cerrar el navegador.
          </p>
        }
      </aside>
    }
  `,
})
export class CartDrawerComponent {
  protected readonly cart = inject(CartService);
  protected readonly drawer = inject(CartDrawerService);
  protected readonly subtotal = lineSubtotal;
}
