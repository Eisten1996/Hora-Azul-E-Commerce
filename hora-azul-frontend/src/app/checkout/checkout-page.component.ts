import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Formulario de checkout. Pendiente de implementar (tarea 9.1). */
@Component({
  selector: 'app-checkout-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<p class="p-8 text-center text-gray-500">Checkout</p>`,
})
export default class CheckoutPageComponent {}
