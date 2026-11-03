import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { WhatsAppService } from '../core/whatsapp.service';

/** Estado que el checkout pasa a la página de éxito. */
export interface OrderSuccessState {
  whatsappUrl?: string;
}

/** Confirmación del pedido con el código y los pasos para coordinar el pago por WhatsApp. */
@Component({
  selector: 'app-order-success',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="mx-auto max-w-2xl rounded-2xl bg-white px-6 py-10 text-center shadow-sm ring-1 ring-slate-200 sm:px-12" aria-labelledby="success-title">
      <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-hora-azul-100 text-hora-azul-800" aria-hidden="true">
        <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke-width="2.2" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
      </div>
      <h1 id="success-title" class="mt-4 font-display text-3xl uppercase text-hora-azul-900">¡Pedido registrado!</h1>
      <p class="mt-2 text-slate-700">Tu código de pedido es</p>
      <p class="mt-2 inline-block rounded-xl bg-hora-azul-500 px-6 py-3 font-display text-3xl tracking-wider text-hora-azul-900 sm:text-4xl" data-testid="order-code">
        {{ orderCode }}
      </p>

      <ol class="mx-auto mt-8 max-w-md space-y-3 text-left text-slate-700">
        <li class="flex gap-3"><span class="font-bold text-hora-azul-700">1.</span> Envíanos el resumen de tu pedido por WhatsApp (si no se abrió solo, usa el botón de abajo).</li>
        <li class="flex gap-3"><span class="font-bold text-hora-azul-700">2.</span> Te responderemos con las opciones de pago.</li>
        <li class="flex gap-3"><span class="font-bold text-hora-azul-700">3.</span> Confirmado el pago, coordinamos la entrega en la fecha y el punto que indicaste.</li>
      </ol>

      <div class="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <a
          [href]="whatsappUrl"
          target="_blank"
          rel="noopener"
          class="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1f7a43] px-6 py-3 font-semibold text-white hover:bg-[#186336] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1f7a43] sm:w-auto"
        >
          Enviar pedido por WhatsApp
        </a>
        <a
          routerLink="/"
          class="inline-flex w-full items-center justify-center rounded-xl px-6 py-3 font-semibold text-hora-azul-800 ring-1 ring-hora-azul-700 hover:bg-hora-azul-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hora-azul-600 sm:w-auto"
        >
          Volver al catálogo
        </a>
      </div>
    </section>
  `,
})
export default class OrderSuccessComponent {
  protected readonly orderCode = inject(ActivatedRoute).snapshot.paramMap.get('orderCode') ?? '';

  /** Enlace con el resumen completo si venimos del checkout; si se recargó, uno con solo el código. */
  protected readonly whatsappUrl =
    (inject(Location).getState() as OrderSuccessState | null)?.whatsappUrl ??
    inject(WhatsAppService).buildFollowUpUrl(this.orderCode);
}
