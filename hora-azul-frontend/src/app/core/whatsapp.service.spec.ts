import { environment } from '../../environments/environment';
import { OrderResponse } from '../models';
import { WhatsAppService } from './whatsapp.service';

const order: OrderResponse = {
  orderCode: 'ORD-2026-0007',
  status: 'PENDING_PAYMENT',
  customerName: 'Cliente de Prueba',
  totalAmount: 120.5,
  items: [
    { catalogNumber: 1, cardName: 'Globos de Cumpleaños', unitPrice: 15, quantity: 2, subtotal: 30 },
    { catalogNumber: 9, cardName: 'Rosa & Lirio', unitPrice: 30, quantity: 3, subtotal: 90.5 },
  ],
  createdAt: '2026-11-03T10:00:00',
};

describe('WhatsAppService', () => {
  const service = new WhatsAppService();

  function decodedMessage(url: string): string {
    return new URL(url).searchParams.get('text')!;
  }

  it('apunta a wa.me con el número de la tienda', () => {
    const url = new URL(service.buildWhatsAppUrl(order, 'Miraflores'));
    expect(url.origin).toBe('https://wa.me');
    expect(url.pathname).toBe('/' + environment.whatsappNumber.replace(/\D/g, ''));
  });

  it('incluye código, tarjetas con cantidad, total en soles y punto de entrega', () => {
    const message = decodedMessage(service.buildWhatsAppUrl(order, 'Av. Larco 123, Miraflores'));

    expect(message).toContain('Código de orden: ORD-2026-0007');
    expect(message).toContain('- Globos de Cumpleaños x 2');
    expect(message).toContain('- Rosa & Lirio x 3');
    expect(message).toContain('Total: S/. 120.50');
    expect(message).toContain('Punto de entrega: Av. Larco 123, Miraflores');
  });

  it('codifica los caracteres especiales del mensaje en la URL', () => {
    const url = service.buildWhatsAppUrl(order, 'Calle #5 & 6');
    const encodedText = url.split('?text=')[1];
    expect(encodedText).not.toMatch(/[\s#&]/);
    expect(decodedMessage(url)).toContain('Calle #5 & 6');
  });

  it('openWhatsApp abre el enlace en una pestaña nueva', () => {
    const open = jest.spyOn(window, 'open').mockImplementation(() => null);
    service.openWhatsApp('https://wa.me/51987654321?text=hola');
    expect(open).toHaveBeenCalledWith('https://wa.me/51987654321?text=hola', '_blank', 'noopener');
    open.mockRestore();
  });
});
