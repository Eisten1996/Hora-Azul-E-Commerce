import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SolesPipe } from '../../core/money';
import { OrderStatus } from '../../models';
import { AdminOrderDetail, AdminOrderService } from '../core/admin-order.service';
import { ConfirmDialogComponent } from '../shared/confirm-dialog.component';
import { OrderStatusBadgeComponent } from '../shared/order-status-badge.component';
import { ORDER_STATUS_LABELS, ORDER_TRANSITIONS, formatDeliveryDate, formatOrderDateTime } from '../shared/order-status';

interface OrderAction {
  label: string;
  danger: boolean;
  /** Si existe, el cambio pide confirmación antes de enviarse. */
  confirm?: { heading: string; message: string; confirmLabel: string };
}

const ORDER_ACTIONS: Partial<Record<OrderStatus, OrderAction>> = {
  PAID: { label: 'Marcar como pagada', danger: false },
  DELIVERED: {
    label: 'Marcar como entregada',
    danger: false,
    confirm: {
      heading: '¿Marcar esta orden como entregada?',
      message: 'Esta acción no se podrá deshacer.',
      confirmLabel: 'Sí, marcar como entregada',
    },
  },
  CANCELLED: {
    label: 'Cancelar orden',
    danger: true,
    confirm: {
      heading: '¿Cancelar esta orden?',
      message: 'Esta acción no se podrá deshacer.',
      confirmLabel: 'Sí, cancelar orden',
    },
  },
};

/** Enlace para escribir al cliente por WhatsApp. El backend guarda el teléfono peruano sin prefijo. */
export function customerWhatsAppUrl(order: Pick<AdminOrderDetail, 'customerName' | 'customerPhone' | 'orderCode'>): string {
  const message = `Hola, ${order.customerName}. Te escribimos de Hora Azul por tu pedido ${order.orderCode}.`;
  return `https://wa.me/51${order.customerPhone}?text=${encodeURIComponent(message)}`;
}

type DetailStatus = 'loading' | 'ready' | 'not-found' | 'error';

/** Datos completos de una orden y cambios de estado permitidos. */
@Component({
  selector: 'app-admin-order-detail',
  imports: [ConfirmDialogComponent, OrderStatusBadgeComponent, RouterLink, SolesPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a
      routerLink="/admin/ordenes"
      queryParamsHandling="preserve"
      class="-my-2 inline-block py-2 text-sm font-medium text-hora-azul-800 underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hora-azul-600"
    >
      Volver a órdenes
    </a>

    @switch (status()) {
      @case ('loading') {
        <p class="mt-6 text-slate-700" role="status" aria-busy="true">Cargando la orden… Si el servidor estaba en reposo, puede tardar hasta un minuto.</p>
      }
      @case ('not-found') {
        <div class="mt-6 rounded-xl bg-white px-6 py-10 text-center ring-1 ring-slate-200">
          <h1 class="font-medium text-slate-900">No encontramos la orden {{ orderCode }}.</h1>
          <a routerLink="/admin/ordenes" class="mt-2 inline-block font-medium text-hora-azul-800 underline">Ver todas las órdenes</a>
        </div>
      }
      @case ('error') {
        <div class="mt-6 rounded-xl border border-red-200 bg-red-50 px-6 py-10 text-center" role="alert">
          <p class="font-medium text-red-900">No pudimos cargar la orden.</p>
          <button
            type="button"
            class="mt-4 rounded-lg bg-hora-azul-700 px-5 py-2.5 font-medium text-white hover:bg-hora-azul-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hora-azul-600"
            (click)="load()"
          >
            Reintentar
          </button>
        </div>
      }
    }

    @if (order(); as order) {
      <div class="mt-4 flex flex-wrap items-center gap-3">
        <h1 #heading tabindex="-1" class="font-display text-3xl uppercase text-hora-azul-900 outline-none">{{ order.orderCode }}</h1>
        <app-order-status-badge [status]="order.status" />
      </div>
      <p class="mt-1 text-sm text-slate-700">Creada el {{ dateTime(order.createdAt) }}</p>

      <p class="mt-4 rounded-lg border border-hora-azul-200 bg-hora-azul-50 px-4 py-3 text-sm text-hora-azul-900 empty:hidden" role="status">{{ notice() }}</p>
      @if (actionError()) {
        <p class="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">{{ actionError() }}</p>
      }

      <div class="mt-6 flex flex-wrap gap-3">
        @for (action of actions(); track action.target) {
          <button
            type="button"
            [disabled]="busy()"
            class="rounded-lg px-4 py-2.5 font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hora-azul-600 disabled:cursor-wait disabled:opacity-70"
            [class]="
              action.danger
                ? 'text-red-800 ring-1 ring-red-300 hover:bg-red-50'
                : 'bg-hora-azul-700 text-white hover:bg-hora-azul-800'
            "
            (click)="request(action.target)"
          >
            {{ action.label }}
          </button>
        } @empty {
          <p class="text-sm text-slate-700">Esta orden está {{ statusLabel(order.status).toLowerCase() }} y ya no admite cambios de estado.</p>
        }
      </div>

      <div class="mt-6 grid gap-6 lg:grid-cols-2 lg:items-start">
        <section class="rounded-xl bg-white p-5 ring-1 ring-slate-200" aria-labelledby="orden-cliente">
          <h2 id="orden-cliente" class="font-semibold text-hora-azul-900">Cliente y entrega</h2>
          <dl class="mt-3 space-y-3">
            <div>
              <dt class="text-sm text-slate-700">Nombre</dt>
              <dd class="break-words text-slate-900">{{ order.customerName }}</dd>
            </div>
            <div>
              <dt class="text-sm text-slate-700">Teléfono</dt>
              <dd class="text-slate-900">{{ order.customerPhone }}</dd>
            </div>
            <div>
              <dt class="text-sm text-slate-700">Punto de entrega</dt>
              <dd class="break-words text-slate-900">{{ order.deliveryAddress }}</dd>
            </div>
            <div>
              <dt class="text-sm text-slate-700">Fecha estimada de entrega</dt>
              <dd class="text-slate-900">{{ deliveryDate(order.estimatedDeliveryDate) }}</dd>
            </div>
          </dl>
          <a
            [href]="whatsappUrl(order)"
            target="_blank"
            rel="noopener noreferrer"
            class="mt-4 inline-block rounded-lg px-4 py-2.5 font-medium text-hora-azul-800 ring-1 ring-slate-300 hover:bg-hora-azul-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hora-azul-600"
          >
            Escribir por WhatsApp<span class="sr-only"> (se abre en una pestaña nueva)</span>
          </a>
        </section>

        <section class="rounded-xl bg-white p-5 ring-1 ring-slate-200" aria-labelledby="orden-items">
          <h2 id="orden-items" class="font-semibold text-hora-azul-900">Tarjetas</h2>
          <ul class="mt-3 divide-y divide-slate-200">
            @for (item of order.items; track $index) {
              <li class="flex items-start justify-between gap-4 py-3">
                <div class="min-w-0">
                  <p class="break-words text-slate-900">{{ item.cardName }}</p>
                  <p class="text-sm text-slate-700">Nº {{ item.catalogNumber }} · {{ item.quantity }} × {{ item.unitPrice | soles }}</p>
                </div>
                <p class="font-medium whitespace-nowrap text-slate-900">{{ item.subtotal | soles }}</p>
              </li>
            }
          </ul>
          <p class="mt-2 flex justify-between gap-4 border-t border-slate-300 pt-3 font-semibold text-slate-900">
            <span>Total</span>
            <span data-testid="order-total">{{ order.totalAmount | soles }}</span>
          </p>
        </section>
      </div>

      <app-confirm-dialog
        [open]="pending() !== null"
        [heading]="pendingAction()?.confirm?.heading ?? ''"
        [message]="pendingAction()?.confirm?.message ?? ''"
        [confirmLabel]="pendingAction()?.confirm?.confirmLabel ?? 'Confirmar'"
        cancelLabel="Volver"
        [danger]="pendingAction()?.danger ?? false"
        (confirmed)="confirmPending()"
        (cancelled)="pending.set(null)"
      />
    }
  `,
})
export default class AdminOrderDetailComponent {
  private readonly service = inject(AdminOrderService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');

  protected readonly orderCode = inject(ActivatedRoute).snapshot.paramMap.get('orderCode') ?? '';
  protected readonly status = signal<DetailStatus>('loading');
  protected readonly order = signal<AdminOrderDetail | null>(null);
  protected readonly notice = signal('');
  protected readonly actionError = signal('');
  protected readonly busy = signal(false);
  protected readonly pending = signal<OrderStatus | null>(null);

  protected readonly actions = computed(() => {
    const order = this.order();
    return order
      ? ORDER_TRANSITIONS[order.status].map((target) => ({ target, ...ORDER_ACTIONS[target]! }))
      : [];
  });
  protected readonly pendingAction = computed(() => {
    const target = this.pending();
    return target ? ORDER_ACTIONS[target]! : null;
  });

  protected readonly dateTime = formatOrderDateTime;
  protected readonly deliveryDate = formatDeliveryDate;
  protected readonly whatsappUrl = customerWhatsAppUrl;
  protected readonly statusLabel = (status: OrderStatus) => ORDER_STATUS_LABELS[status];

  constructor() {
    this.load();
  }

  protected load(): void {
    this.status.set('loading');
    this.fetch();
  }

  protected request(target: OrderStatus): void {
    if (ORDER_ACTIONS[target]?.confirm) {
      this.pending.set(target);
    } else {
      this.apply(target);
    }
  }

  protected confirmPending(): void {
    const target = this.pending();
    this.pending.set(null);
    if (target) {
      this.apply(target);
    }
  }

  private apply(target: OrderStatus): void {
    this.notice.set('');
    this.actionError.set('');
    this.busy.set(true);
    this.service
      .changeStatus(this.orderCode, target)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (order) => {
          this.busy.set(false);
          this.order.set(order);
          this.notice.set(`La orden quedó como "${ORDER_STATUS_LABELS[order.status]}".`);
          this.focusHeading();
        },
        error: (error: HttpErrorResponse) => {
          this.busy.set(false);
          if (error.status === 409) {
            this.actionError.set('Esta orden cambió desde otro dispositivo. Este es su estado actual.');
            this.fetch();
          } else {
            this.actionError.set('No se pudo cambiar el estado de la orden. Inténtalo de nuevo.');
          }
        },
      });
  }

  /** Carga la orden sin pasar por el estado de carga, para no borrar lo que hay en pantalla al recargar. */
  private fetch(): void {
    this.busy.set(true);
    this.service
      .get(this.orderCode)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (order) => {
          this.busy.set(false);
          this.order.set(order);
          this.status.set('ready');
          if (this.actionError()) {
            this.focusHeading();
          }
        },
        error: (error: HttpErrorResponse) => {
          this.busy.set(false);
          this.order.set(null);
          this.status.set(error.status === 404 ? 'not-found' : 'error');
        },
      });
  }

  /** El botón pulsado puede desaparecer con el nuevo estado: sin esto, el foco se perdería. */
  private focusHeading(): void {
    afterNextRender(() => this.heading()?.nativeElement.focus(), { injector: this.injector });
  }
}
