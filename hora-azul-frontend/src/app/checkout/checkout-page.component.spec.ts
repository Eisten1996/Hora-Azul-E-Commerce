import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';
import { CartProduct, CartService } from '../core/cart.service';
import { OrderError, OrderService } from '../core/order.service';
import { WhatsAppService } from '../core/whatsapp.service';
import { OrderResponse } from '../models';
import CheckoutPageComponent from './checkout-page.component';
import { notPastDate, todayIsoDate } from './checkout-validators';
import { FormControl } from '@angular/forms';

const GLOBOS: CartProduct = { id: 'a1000001-0000-0000-0000-000000000001', catalogNumber: 1, name: 'Globos', price: 15 };

const ORDER: OrderResponse = {
  orderCode: 'ORD-2026-0007',
  status: 'PENDING_PAYMENT',
  customerName: 'Ana Pérez',
  totalAmount: 30,
  items: [{ catalogNumber: 1, cardName: 'Globos', unitPrice: 15, quantity: 2, subtotal: 30 }],
  createdAt: '2026-11-03T10:00:00',
};

function tomorrow(): string {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return todayIsoDate(date);
}

describe('validadores del checkout', () => {
  it('todayIsoDate usa la fecha local', () => {
    expect(todayIsoDate(new Date(2026, 0, 5, 23, 30))).toBe('2026-01-05');
  });

  it('notPastDate acepta hoy y rechaza ayer', () => {
    const validator = notPastDate(() => '2026-11-03');
    expect(validator(new FormControl('2026-11-03'))).toBeNull();
    expect(validator(new FormControl('2026-11-02'))).toEqual({ pastDate: true });
  });
});

describe('CheckoutPageComponent', () => {
  let fixture: ComponentFixture<CheckoutPageComponent>;
  let element: HTMLElement;
  let createOrder: jest.Mock;
  let openWhatsApp: jest.Mock;
  let cart: CartService;

  beforeEach(() => {
    localStorage.clear();
    createOrder = jest.fn();
    openWhatsApp = jest.fn();
    TestBed.configureTestingModule({
      imports: [CheckoutPageComponent],
      providers: [
        provideRouter([]),
        { provide: OrderService, useValue: { createOrder } },
        {
          provide: WhatsAppService,
          useValue: { buildWhatsAppUrl: () => 'https://wa.me/51988331275?text=pedido', openWhatsApp },
        },
      ],
    });
    cart = TestBed.inject(CartService);
  });

  function render(): void {
    fixture = TestBed.createComponent(CheckoutPageComponent);
    fixture.detectChanges();
    element = fixture.nativeElement;
  }

  function fill(values: Partial<Record<string, string>>): void {
    for (const [id, value] of Object.entries(values)) {
      const input = element.querySelector<HTMLInputElement | HTMLTextAreaElement>(`#${id}`)!;
      input.value = value!;
      input.dispatchEvent(new Event('input'));
      input.dispatchEvent(new Event('blur'));
    }
    fixture.detectChanges();
  }

  function fillValid(): void {
    fill({
      customerName: '  Ana Pérez ',
      customerPhone: '987654321',
      deliveryAddress: 'Av. Larco 123, Miraflores',
      estimatedDeliveryDate: tomorrow(),
    });
  }

  function submit(): void {
    element.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    fixture.detectChanges();
  }

  it('con el carrito vacío no muestra el formulario y enlaza al catálogo', () => {
    render();
    expect(element.querySelector('form')).toBeNull();
    expect(element.textContent).toContain('Tu carrito está vacío');
  });

  describe('con productos en el carrito', () => {
    beforeEach(() => {
      cart.addItem(GLOBOS);
      cart.updateQuantity(GLOBOS.id, 2);
      render();
    });

    it('muestra el resumen del pedido con el total', () => {
      expect(element.textContent).toContain('Globos');
      expect(element.textContent).toContain('S/. 30.00');
    });

    it('un teléfono de 8 dígitos muestra el mensaje del requerimiento', () => {
      fill({ customerPhone: '98765432' });
      expect(element.querySelector('#customerPhone-error')?.textContent).toBe(
        'Ingresa un número de teléfono peruano válido de 9 dígitos.',
      );
    });

    it('una fecha pasada muestra un error de validación', () => {
      fill({ estimatedDeliveryDate: '2020-01-01' });
      expect(element.querySelector('#estimatedDeliveryDate-error')?.textContent).toContain('hoy o posterior');
    });

    it('al enviar sin tocar nada lleva el foco al primer campo con error', () => {
      submit();
      expect(document.activeElement?.id).toBe('customerName');
    });

    it('con campos vacíos muestra los errores por campo y no llama al backend', () => {
      fill({ customerName: '   ' });
      submit();

      expect(createOrder).not.toHaveBeenCalled();
      for (const id of ['customerName', 'customerPhone', 'deliveryAddress', 'estimatedDeliveryDate']) {
        expect(element.querySelector(`#${id}-error`)).not.toBeNull();
      }
      expect(document.activeElement?.id).toBe('customerName');
    });

    it('con datos válidos envía la orden, abre WhatsApp, vacía el carrito y va a la confirmación', () => {
      createOrder.mockReturnValue(of(ORDER));
      const navigate = jest.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

      fillValid();
      submit();

      expect(createOrder).toHaveBeenCalledWith({
        customerName: 'Ana Pérez',
        customerPhone: '987654321',
        deliveryAddress: 'Av. Larco 123, Miraflores',
        estimatedDeliveryDate: tomorrow(),
        items: [{ tarjetaId: GLOBOS.id, quantity: 2 }],
      });
      expect(openWhatsApp).toHaveBeenCalledWith('https://wa.me/51988331275?text=pedido');
      expect(cart.isEmpty()).toBe(true);
      expect(navigate).toHaveBeenCalledWith(['/pedido', 'ORD-2026-0007'], {
        state: { whatsappUrl: 'https://wa.me/51988331275?text=pedido' },
      });
    });

    it('mientras se envía desactiva el botón para evitar pedidos duplicados', () => {
      createOrder.mockReturnValue(new Subject());
      fillValid();
      submit();
      submit();

      expect(createOrder).toHaveBeenCalledTimes(1);
      expect(element.querySelector<HTMLButtonElement>('button[type="submit"]')!.disabled).toBe(true);
    });

    it('si el backend falla muestra el error y conserva los datos y el carrito', () => {
      createOrder.mockReturnValue(throwError(() => new OrderError('No pudimos conectar con el servidor.', 0)));

      fillValid();
      submit();

      expect(element.querySelector('[role="alert"]')?.textContent).toContain('No pudimos conectar con el servidor.');
      expect(element.querySelector<HTMLInputElement>('#customerPhone')!.value).toBe('987654321');
      expect(cart.isEmpty()).toBe(false);
      expect(element.querySelector<HTMLButtonElement>('button[type="submit"]')!.disabled).toBe(false);
    });
  });
});
