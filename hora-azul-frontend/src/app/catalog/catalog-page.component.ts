import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Página principal del catálogo. Pendiente de implementar (tarea 7.5). */
@Component({
  selector: 'app-catalog-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<p class="p-8 text-center text-gray-500">Catálogo</p>`,
})
export default class CatalogPageComponent {}
