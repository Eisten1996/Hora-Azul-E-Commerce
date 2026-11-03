import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { CartService, MAX_QUANTITY_PER_ITEM, lineSubtotal } from '../core/cart.service';
import { SolesPipe } from '../core/money';
import { CartItem } from '../models';

/** Ítem del carrito con controles de cantidad y botón para eliminarlo. */
@Component({
  selector: 'app-cart-item',
  imports: [SolesPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex gap-3 py-4">
      <div class="min-w-0 flex-1">
        <p class="font-semibold uppercase leading-snug text-hora-azul-900">{{ item().cardName }}</p>
        <p class="mt-0.5 text-sm text-slate-600">{{ item().unitPrice | soles }} c/u</p>

        <div class="mt-3 flex items-center gap-2">
          <div class="inline-flex items-center rounded-lg ring-1 ring-slate-300" role="group" [attr.aria-label]="'Cantidad de ' + item().cardName">
            <button
              type="button"
              class="flex h-9 w-9 items-center justify-center rounded-l-lg text-lg font-semibold text-hora-azul-800 hover:bg-hora-azul-50 focus-visible:outline-2 focus-visible:outline-hora-azul-600"
              [attr.aria-label]="'Quitar una unidad de ' + item().cardName"
              (click)="cart.changeQuantity(item().tarjetaId, -1)"
            >
              −
            </button>
            <span class="w-9 text-center font-semibold tabular-nums text-slate-900" aria-live="polite">{{ item().quantity }}</span>
            <button
              type="button"
              class="flex h-9 w-9 items-center justify-center rounded-r-lg text-lg font-semibold text-hora-azul-800 hover:bg-hora-azul-50 focus-visible:outline-2 focus-visible:outline-hora-azul-600 disabled:cursor-not-allowed disabled:text-slate-400 disabled:hover:bg-transparent"
              [attr.aria-label]="'Agregar una unidad de ' + item().cardName"
              [disabled]="atMaximum()"
              (click)="cart.changeQuantity(item().tarjetaId, 1)"
            >
              +
            </button>
          </div>
          <button
            type="button"
            class="ml-1 rounded-lg px-2 py-1.5 text-sm font-medium text-red-800 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-red-700"
            [attr.aria-label]="'Eliminar ' + item().cardName + ' del carrito'"
            (click)="cart.removeItem(item().tarjetaId)"
          >
            Eliminar
          </button>
        </div>
        @if (atMaximum()) {
          <p class="mt-1.5 text-xs text-slate-600">Máximo {{ maxQuantity }} unidades por tarjeta.</p>
        }
      </div>
      <p class="font-bold text-hora-azul-900">{{ subtotal() | soles }}</p>
    </div>
  `,
})
export class CartItemComponent {
  readonly item = input.required<CartItem>();

  protected readonly cart = inject(CartService);
  protected readonly maxQuantity = MAX_QUANTITY_PER_ITEM;
  protected readonly subtotal = computed(() => lineSubtotal(this.item()));
  protected readonly atMaximum = computed(() => this.item().quantity >= MAX_QUANTITY_PER_ITEM);
}
