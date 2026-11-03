import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { OrderResponse } from '../models';
import { formatSoles } from './money';

/** Construye y abre el enlace {@code wa.me} para coordinar el pago de una orden. */
@Injectable({ providedIn: 'root' })
export class WhatsAppService {
  private readonly phoneNumber = environment.whatsappNumber.replace(/\D/g, '');

  buildWhatsAppUrl(order: OrderResponse, deliveryAddress: string): string {
    const message = [
      '¡Hola, Hora Azul! Quiero confirmar mi pedido.',
      '',
      `Código de orden: ${order.orderCode}`,
      '',
      'Tarjetas:',
      ...order.items.map((item) => `- ${item.cardName} x ${item.quantity}`),
      '',
      `Total: ${formatSoles(order.totalAmount)}`,
      `Punto de entrega: ${deliveryAddress}`,
    ].join('\n');

    return this.toUrl(message);
  }

  /** Enlace mínimo con solo el código, para cuando ya no se tiene el detalle de la orden. */
  buildFollowUpUrl(orderCode: string): string {
    return this.toUrl(`¡Hola, Hora Azul! Quiero coordinar el pago de mi pedido ${orderCode}.`);
  }

  openWhatsApp(url: string): void {
    window.open(url, '_blank', 'noopener');
  }

  private toUrl(message: string): string {
    return `https://wa.me/${this.phoneNumber}?text=${encodeURIComponent(message)}`;
  }
}
