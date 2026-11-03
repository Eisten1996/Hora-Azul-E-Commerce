import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Confirmación del pedido. Pendiente de implementar (tarea 9.2). */
@Component({
  selector: 'app-order-success',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<p class="p-8 text-center text-gray-500">Pedido confirmado</p>`,
})
export default class OrderSuccessComponent {}
