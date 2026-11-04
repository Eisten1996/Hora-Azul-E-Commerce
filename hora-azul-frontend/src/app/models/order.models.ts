export type OrderStatus = 'PENDING_PAYMENT' | 'PAID' | 'DELIVERED' | 'CANCELLED';

export interface OrderRequestItem {
  tarjetaId: string;
  quantity: number;
}

/** Cuerpo de `POST /api/orders`. */
export interface OrderRequest {
  customerName: string;
  /** Teléfono peruano de exactamente 9 dígitos. */
  customerPhone: string;
  deliveryAddress: string;
  /** Fecha en formato ISO `YYYY-MM-DD`, hoy o posterior. */
  estimatedDeliveryDate: string;
  items: OrderRequestItem[];
}

export interface OrderItem {
  catalogNumber: number;
  cardName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

/** Respuesta de `POST /api/orders`. */
export interface OrderResponse {
  /** Código único con formato `ORD-YYYY-XXXX`. */
  orderCode: string;
  status: OrderStatus;
  customerName: string;
  totalAmount: number;
  items: OrderItem[];
  createdAt: string;
}
