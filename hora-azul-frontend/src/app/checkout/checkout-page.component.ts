import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService, lineSubtotal } from '../core/cart.service';
import { SolesPipe } from '../core/money';
import { OrderError, OrderService } from '../core/order.service';
import { WhatsAppService } from '../core/whatsapp.service';
import { OrderRequest } from '../models';
import type { OrderSuccessState } from '../success/order-success.component';
import { PHONE_ERROR_MESSAGE, PHONE_PATTERN, notPastDate, requiredText, todayIsoDate } from './checkout-validators';

type FieldName = 'customerName' | 'customerPhone' | 'deliveryAddress' | 'estimatedDeliveryDate';

const FIELD_ERRORS: Record<FieldName, Record<string, string>> = {
  customerName: { required: 'Ingresa tu nombre completo.', maxlength: 'El nombre no puede superar 100 caracteres.' },
  customerPhone: { required: 'Ingresa tu número de teléfono.', pattern: PHONE_ERROR_MESSAGE },
  deliveryAddress: {
    required: 'Ingresa la dirección o el punto de entrega.',
    maxlength: 'La dirección no puede superar 200 caracteres.',
  },
  estimatedDeliveryDate: { required: 'Elige una fecha de entrega.', pastDate: 'La fecha debe ser hoy o posterior.' },
};

/** Formulario de checkout: registra la orden y abre WhatsApp para coordinar el pago. */
@Component({
  selector: 'app-checkout-page',
  imports: [ReactiveFormsModule, RouterLink, SolesPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1 class="font-display text-3xl uppercase text-hora-azul-900 sm:text-4xl">Confirma tu pedido</h1>

    @if (cart.isEmpty()) {
      <div class="mt-8 rounded-2xl bg-white px-6 py-12 text-center ring-1 ring-slate-200">
        <p class="text-slate-700">Tu carrito está vacío. Agrega al menos una tarjeta para hacer un pedido.</p>
        <a
          routerLink="/"
          class="mt-6 inline-block rounded-lg bg-hora-azul-700 px-5 py-2.5 font-medium text-white hover:bg-hora-azul-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hora-azul-600"
        >
          Ver el catálogo
        </a>
      </div>
    } @else {
      <div class="mt-8 grid gap-8 lg:grid-cols-[1fr_22rem] lg:gap-12">
        <form
          class="space-y-5 rounded-2xl bg-white p-6 ring-1 ring-slate-200 sm:p-8"
          [formGroup]="form"
          (ngSubmit)="submit()"
          novalidate
          aria-labelledby="checkout-form-title"
        >
          <h2 id="checkout-form-title" class="text-lg font-semibold text-hora-azul-900">Datos de entrega</h2>

          <div>
            <label for="customerName" class="block text-sm font-semibold text-slate-900">Nombre completo</label>
            <input id="customerName" type="text" formControlName="customerName" autocomplete="name" maxlength="100"
              class="mt-1.5 w-full rounded-lg border px-3 py-2.5 text-slate-900 focus:outline-2 focus:outline-hora-azul-600/30"
              [class]="inputBorder('customerName')"
              [attr.aria-invalid]="showError('customerName')"
              [attr.aria-describedby]="showError('customerName') ? 'customerName-error' : null" />
            @if (showError('customerName')) {
              <p id="customerName-error" class="mt-1 text-sm text-red-800">{{ errorFor('customerName') }}</p>
            }
          </div>

          <div>
            <label for="customerPhone" class="block text-sm font-semibold text-slate-900">Teléfono (9 dígitos)</label>
            <input id="customerPhone" type="tel" formControlName="customerPhone" inputmode="numeric" autocomplete="tel-national" maxlength="9" placeholder="987654321"
              class="mt-1.5 w-full rounded-lg border px-3 py-2.5 text-slate-900 placeholder:text-slate-500 focus:outline-2 focus:outline-hora-azul-600/30"
              [class]="inputBorder('customerPhone')"
              [attr.aria-invalid]="showError('customerPhone')"
              [attr.aria-describedby]="showError('customerPhone') ? 'customerPhone-error' : null" />
            @if (showError('customerPhone')) {
              <p id="customerPhone-error" class="mt-1 text-sm text-red-800">{{ errorFor('customerPhone') }}</p>
            }
          </div>

          <div>
            <label for="deliveryAddress" class="block text-sm font-semibold text-slate-900">Dirección o punto de entrega (Lima / Callao)</label>
            <textarea id="deliveryAddress" formControlName="deliveryAddress" rows="2" autocomplete="street-address" maxlength="200"
              class="mt-1.5 w-full rounded-lg border px-3 py-2.5 text-slate-900 focus:outline-2 focus:outline-hora-azul-600/30"
              [class]="inputBorder('deliveryAddress')"
              [attr.aria-invalid]="showError('deliveryAddress')"
              [attr.aria-describedby]="showError('deliveryAddress') ? 'deliveryAddress-error' : null"></textarea>
            @if (showError('deliveryAddress')) {
              <p id="deliveryAddress-error" class="mt-1 text-sm text-red-800">{{ errorFor('deliveryAddress') }}</p>
            }
          </div>

          <div>
            <label for="estimatedDeliveryDate" class="block text-sm font-semibold text-slate-900">Fecha estimada de entrega</label>
            <input id="estimatedDeliveryDate" type="date" formControlName="estimatedDeliveryDate" [min]="today"
              class="mt-1.5 w-full rounded-lg border px-3 py-2.5 text-slate-900 focus:outline-2 focus:outline-hora-azul-600/30 sm:w-auto"
              [class]="inputBorder('estimatedDeliveryDate')"
              [attr.aria-invalid]="showError('estimatedDeliveryDate')"
              [attr.aria-describedby]="showError('estimatedDeliveryDate') ? 'estimatedDeliveryDate-error' : null" />
            @if (showError('estimatedDeliveryDate')) {
              <p id="estimatedDeliveryDate-error" class="mt-1 text-sm text-red-800">{{ errorFor('estimatedDeliveryDate') }}</p>
            }
          </div>

          @if (submitError()) {
            <p class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">{{ submitError() }}</p>
          }

          <button
            type="submit"
            class="w-full rounded-xl bg-hora-azul-700 px-6 py-3.5 text-lg font-semibold text-white hover:bg-hora-azul-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hora-azul-600 disabled:cursor-wait disabled:opacity-70"
            [disabled]="sending()"
          >
            {{ sending() ? 'Enviando pedido…' : 'Confirmar y enviar por WhatsApp' }}
          </button>
          <p class="text-center text-sm text-slate-600">El pago se coordina por WhatsApp; no se cobra nada en esta página.</p>
        </form>

        <aside class="h-fit rounded-2xl bg-hora-azul-50 p-6 lg:sticky lg:top-28" aria-labelledby="summary-title">
          <h2 id="summary-title" class="text-lg font-semibold text-hora-azul-900">Resumen del pedido</h2>
          <ul class="mt-4 divide-y divide-hora-azul-100">
            @for (item of cart.items(); track item.tarjetaId) {
              <li class="flex justify-between gap-4 py-3 text-sm">
                <span class="text-slate-800">{{ item.cardName }} <span class="text-slate-600">× {{ item.quantity }}</span></span>
                <span class="font-medium text-hora-azul-900">{{ subtotal(item) | soles }}</span>
              </li>
            }
          </ul>
          <p class="mt-4 flex justify-between border-t border-hora-azul-200 pt-4 text-lg font-bold text-hora-azul-900">
            <span>Total</span>
            <span>{{ cart.totalAmount() | soles }}</span>
          </p>
        </aside>
      </div>
    }
  `,
})
export default class CheckoutPageComponent {
  protected readonly cart = inject(CartService);
  private readonly orderService = inject(OrderService);
  private readonly whatsapp = inject(WhatsAppService);
  private readonly router = inject(Router);
  private readonly host: ElementRef<HTMLElement> = inject(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly today = todayIsoDate();
  protected readonly subtotal = lineSubtotal;
  protected readonly sending = signal(false);
  protected readonly submitted = signal(false);
  protected readonly submitError = signal('');

  protected readonly form = inject(NonNullableFormBuilder).group({
    customerName: ['', [requiredText, Validators.maxLength(100)]],
    customerPhone: ['', [Validators.required, Validators.pattern(PHONE_PATTERN)]],
    deliveryAddress: ['', [requiredText, Validators.maxLength(200)]],
    estimatedDeliveryDate: ['', [Validators.required, notPastDate()]],
  });

  protected showError(field: FieldName): boolean {
    const control = this.form.controls[field];
    return control.invalid && (control.touched || this.submitted());
  }

  protected errorFor(field: FieldName): string {
    const errors = this.form.controls[field].errors ?? {};
    const key = Object.keys(FIELD_ERRORS[field]).find((name) => errors[name]);
    return key ? FIELD_ERRORS[field][key] : '';
  }

  protected inputBorder(field: FieldName): string {
    return this.showError(field) ? 'border-red-700' : 'border-slate-300';
  }

  protected submit(): void {
    this.submitted.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      // Llevar el foco al primer campo con error (los ids coinciden con los nombres de control)
      const firstInvalid = (Object.keys(this.form.controls) as FieldName[]).find(
        (field) => this.form.controls[field].invalid,
      );
      this.host.nativeElement.querySelector<HTMLElement>(`#${firstInvalid}`)?.focus();
      return;
    }
    if (this.sending() || this.cart.isEmpty()) {
      return;
    }

    const values = this.form.getRawValue();
    const request: OrderRequest = {
      customerName: values.customerName.trim(),
      customerPhone: values.customerPhone,
      deliveryAddress: values.deliveryAddress.trim(),
      estimatedDeliveryDate: values.estimatedDeliveryDate,
      items: this.cart.items().map((item) => ({ tarjetaId: item.tarjetaId, quantity: item.quantity })),
    };

    this.sending.set(true);
    this.submitError.set('');
    this.orderService
      .createOrder(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (order) => {
          const whatsappUrl = this.whatsapp.buildWhatsAppUrl(order, request.deliveryAddress);
          // Puede bloquearlo el navegador si el backend tardó; la página de éxito ofrece el botón
          this.whatsapp.openWhatsApp(whatsappUrl);
          this.cart.clearCart();
          const state: OrderSuccessState = { whatsappUrl };
          this.router.navigate(['/pedido', order.orderCode], { state });
        },
        error: (error: unknown) => {
          this.sending.set(false);
          this.submitError.set(
            error instanceof OrderError
              ? error.message
              : 'Ocurrió un error al registrar tu pedido. Inténtalo de nuevo.',
          );
        },
      });
  }
}
