import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { OrderResponse } from '../models';

/** Formatea un importe en soles con dos decimales: {@code 120.5 → "S/. 120.50"}. */
export function formatSoles(amount: number): string {
  return `S/. ${amount.toFixed(2)}`;
}

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
