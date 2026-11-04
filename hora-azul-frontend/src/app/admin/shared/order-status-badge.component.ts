import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { OrderStatus } from '../../models';
import { ORDER_STATUS_LABELS } from './order-status';

const BADGE_CLASSES: Record<OrderStatus, string> = {
  PENDING_PAYMENT: 'bg-amber-100 text-amber-900',
  PAID: 'bg-hora-azul-100 text-hora-azul-900',
  DELIVERED: 'bg-green-100 text-green-900',
  CANCELLED: 'bg-slate-200 text-slate-800',
};

/** Estado de una orden como etiqueta de color. */
@Component({
  selector: 'app-order-status-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="inline-block rounded-full px-2.5 py-1 text-sm font-medium whitespace-nowrap" [class]="badgeClass()">{{ label() }}</span>`,
})
export class OrderStatusBadgeComponent {
  readonly status = input.required<OrderStatus>();

  protected readonly label = computed(() => ORDER_STATUS_LABELS[this.status()]);
  protected readonly badgeClass = computed(() => BADGE_CLASSES[this.status()]);
}
