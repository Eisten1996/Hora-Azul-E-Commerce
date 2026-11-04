import { OrderStatus } from '../../models';

export const ORDER_STATUSES: OrderStatus[] = ['PENDING_PAYMENT', 'PAID', 'DELIVERED', 'CANCELLED'];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING_PAYMENT: 'Pendiente de pago',
  PAID: 'Pagada',
  DELIVERED: 'Entregada',
  CANCELLED: 'Cancelada',
};

/** Copia de la regla del backend, solo para decidir qué botones mostrar. La autoridad es el backend. */
export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING_PAYMENT: ['PAID', 'CANCELLED'],
  PAID: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: [],
};

const DATE_TIME = new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeStyle: 'short' });
const DATE = new Intl.DateTimeFormat('es-PE', { dateStyle: 'long' });

/** Fecha y hora de creación. El backend la envía sin zona horaria, en hora de Lima, y se muestra tal cual. */
export function formatOrderDateTime(value: string): string {
  return DATE_TIME.format(new Date(value));
}

/** Fecha `YYYY-MM-DD`. Con `new Date(value)` se leería como UTC y en Lima saldría el día anterior. */
export function formatDeliveryDate(value: string): string {
  const [year, month, day] = value.split('-').map(Number);
  return DATE.format(new Date(year, month - 1, day));
}
