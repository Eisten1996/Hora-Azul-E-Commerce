import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Ficha de producto. Pendiente de implementar (tarea 8.2). */
@Component({
  selector: 'app-product-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<p class="p-8 text-center text-gray-500">Detalle de tarjeta</p>`,
})
export default class ProductDetailPageComponent {}
