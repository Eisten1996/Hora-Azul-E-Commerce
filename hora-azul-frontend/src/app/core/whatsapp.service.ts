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

    return `https://wa.me/${this.phoneNumber}?text=${encodeURIComponent(message)}`;
  }

  openWhatsApp(url: string): void {
    window.open(url, '_blank', 'noopener');
  }
}
