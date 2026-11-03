import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Pie de página con la banda de colores del catálogo. */
@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="mt-16">
      <div class="flex h-3" aria-hidden="true">
        <div class="flex-[2] bg-hora-azul-900"></div>
        <div class="flex-[3] bg-hora-azul-700"></div>
        <div class="flex-[2] bg-hora-azul-500"></div>
        <div class="flex-1 bg-hora-azul-100"></div>
      </div>
      <div class="bg-hora-azul-900 text-white">
        <div class="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p class="font-display text-lg uppercase tracking-[0.2em]">Hora Azul</p>
          <p class="text-sm font-light text-hora-azul-100">Tarjetas de felicitaciones 3D · Pedidos y pagos por WhatsApp</p>
        </div>
      </div>
    </footer>
  `,
})
export class FooterComponent {}
