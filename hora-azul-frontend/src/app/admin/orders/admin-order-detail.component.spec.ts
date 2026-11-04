import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { Observable, Subject, of, throwError } from 'rxjs';
import { OrderStatus } from '../../models';
import { AdminOrderDetail, AdminOrderService } from '../core/admin-order.service';
import { formatDeliveryDate } from '../shared/order-status';
import AdminOrderDetailComponent, { customerWhatsAppUrl } from './admin-order-detail.component';

function order(status: OrderStatus = 'PENDING_PAYMENT'): AdminOrderDetail {
  return {
    orderCode: 'ORD-2026-0007',
    status,
    customerName: 'Ana Quispe',
    customerPhone: '987654321',
    deliveryAddress: 'Av. Larco 123, Miraflores',
    estimatedDeliveryDate: '2026-11-20',
    totalAmount: 47,
    createdAt: '2026-11-04T17:30:00',
    items: [
      { catalogNumber: 1, cardName: 'Pastel de cumpleaños', unitPrice: 15, quantity: 2, subtotal: 30 },
      { catalogNumber: 6, cardName: 'Rosa', unitPrice: 17, quantity: 1, subtotal: 17 },
    ],
  };
}

const httpError = (status: number) => new HttpErrorResponse({ status });

describe('customerWhatsAppUrl', () => {
  it('usa el teléfono con prefijo de Perú y lleva el código en el mensaje', () => {
    const url = new URL(customerWhatsAppUrl(order()));

    expect(url.origin + url.pathname).toBe('https://wa.me/51987654321');
    expect(url.searchParams.get('text')).toContain('ORD-2026-0007');
    expect(url.searchParams.get('text')).toContain('Ana Quispe');
  });

  it('codifica los caracteres especiales del nombre', () => {
    const url = customerWhatsAppUrl({ ...order(), customerName: 'Ana & Luis #1' });

    expect(url).not.toContain('&amp;');
    expect(new URL(url).searchParams.get('text')).toContain('Ana & Luis #1');
  });
});

describe('formatDeliveryDate', () => {
  it('muestra el mismo día que llegó, sin desplazarlo por la zona horaria', () => {
    expect(formatDeliveryDate('2026-11-20')).toContain('20');
    expect(formatDeliveryDate('2026-11-01')).toContain('noviembre');
    expect(formatDeliveryDate('2026-11-01')).not.toContain('octubre');
  });
});

describe('AdminOrderDetailComponent', () => {
  let get: jest.Mock<Observable<AdminOrderDetail>, [string]>;
  let changeStatus: jest.Mock<Observable<AdminOrderDetail>, [string, OrderStatus]>;

  beforeEach(() => {
    get = jest.fn(() => of(order()));
    changeStatus = jest.fn((_code, status) => of(order(status)));
    TestBed.configureTestingModule({
      imports: [AdminOrderDetailComponent],
      providers: [
        provideRouter([]),
        { provide: AdminOrderService, useValue: { get, changeStatus } },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ orderCode: 'ORD-2026-0007' }) } },
        },
      ],
    });
  });

  async function render(): Promise<ComponentFixture<AdminOrderDetailComponent>> {
    const fixture = TestBed.createComponent(AdminOrderDetailComponent);
    await fixture.whenStable();
    return fixture;
  }

  const element = (fixture: ComponentFixture<AdminOrderDetailComponent>): HTMLElement => fixture.nativeElement;
  const text = (fixture: ComponentFixture<AdminOrderDetailComponent>) => element(fixture).textContent ?? '';

  function visibleButtons(fixture: ComponentFixture<AdminOrderDetailComponent>): string[] {
    return Array.from(element(fixture).querySelectorAll<HTMLButtonElement>(':scope > div button')).map((button) =>
      button.textContent!.trim(),
    );
  }

  function button(fixture: ComponentFixture<AdminOrderDetailComponent>, label: string): HTMLButtonElement {
    const found = Array.from(element(fixture).querySelectorAll('button')).find((b) => b.textContent!.trim() === label);
    if (!found) {
      throw new Error(`No hay botón "${label}"`);
    }
    return found;
  }

  it('muestra todos los datos de la orden', async () => {
    const fixture = await render();

    expect(get).toHaveBeenCalledWith('ORD-2026-0007');
    const content = text(fixture);
    expect(content).toContain('ORD-2026-0007');
    expect(content).toContain('Pendiente de pago');
    expect(content).toContain('2026');
    expect(content).toContain('Ana Quispe');
    expect(content).toContain('987654321');
    expect(content).toContain('Av. Larco 123, Miraflores');
    expect(content).toContain('20 de noviembre de 2026');
    expect(content).toContain('Pastel de cumpleaños');
    expect(content).toContain('2 × S/. 15.00');
    expect(content).toContain('S/. 30.00');
    expect(element(fixture).querySelector('[data-testid="order-total"]')!.textContent).toBe('S/. 47.00');
  });

  it('enlaza a WhatsApp en una pestaña nueva', async () => {
    const fixture = await render();

    const link = element(fixture).querySelector<HTMLAnchorElement>('a[target="_blank"]')!;
    expect(link.href).toBe(customerWhatsAppUrl(order()));
    expect(link.rel).toContain('noopener');
  });

  describe('acciones según el estado', () => {
    it.each<[OrderStatus, string[]]>([
      ['PENDING_PAYMENT', ['Marcar como pagada', 'Cancelar orden']],
      ['PAID', ['Marcar como entregada', 'Cancelar orden']],
      ['DELIVERED', []],
      ['CANCELLED', []],
    ])('en %s ofrece %j', async (status, expected) => {
      get.mockReturnValue(of(order(status)));
      const fixture = await render();

      expect(visibleButtons(fixture)).toEqual(expected);
    });

    it.each<[OrderStatus, string]>([
      ['DELIVERED', 'entregada'],
      ['CANCELLED', 'cancelada'],
    ])('en el estado final %s explica que ya no admite cambios', async (status, word) => {
      get.mockReturnValue(of(order(status)));
      const fixture = await render();

      expect(text(fixture)).toContain(`Esta orden está ${word} y ya no admite cambios de estado.`);
    });
  });

  describe('cambio de estado', () => {
    it('marcar como pagada se aplica sin confirmación', async () => {
      const fixture = await render();

      button(fixture, 'Marcar como pagada').click();
      await fixture.whenStable();

      expect(changeStatus).toHaveBeenCalledWith('ORD-2026-0007', 'PAID');
      expect(text(fixture)).toContain('La orden quedó como "Pagada".');
      expect(visibleButtons(fixture)).toEqual(['Marcar como entregada', 'Cancelar orden']);
    });

    it('tras el cambio el foco pasa al título, porque el botón pulsado desaparece', async () => {
      const fixture = await render();

      button(fixture, 'Marcar como pagada').click();
      await fixture.whenStable();

      expect(document.activeElement).toBe(element(fixture).querySelector('h1'));
    });

    it('cancelar pide confirmación avisando que no se podrá deshacer', async () => {
      const fixture = await render();

      button(fixture, 'Cancelar orden').click();
      await fixture.whenStable();

      expect(changeStatus).not.toHaveBeenCalled();
      const dialog = element(fixture).querySelector('dialog')!;
      expect(dialog.open).toBe(true);
      expect(dialog.textContent).toContain('¿Cancelar esta orden?');
      expect(dialog.textContent).toContain('no se podrá deshacer');

      button(fixture, 'Sí, cancelar orden').click();
      await fixture.whenStable();

      expect(changeStatus).toHaveBeenCalledWith('ORD-2026-0007', 'CANCELLED');
      expect(element(fixture).querySelector('dialog')!.open).toBe(false);
      expect(visibleButtons(fixture)).toEqual([]);
    });

    it('marcar como entregada pide confirmación', async () => {
      get.mockReturnValue(of(order('PAID')));
      const fixture = await render();

      button(fixture, 'Marcar como entregada').click();
      await fixture.whenStable();

      expect(changeStatus).not.toHaveBeenCalled();
      expect(element(fixture).querySelector('dialog')!.textContent).toContain('no se podrá deshacer');

      button(fixture, 'Sí, marcar como entregada').click();
      await fixture.whenStable();

      expect(changeStatus).toHaveBeenCalledWith('ORD-2026-0007', 'DELIVERED');
    });

    it('volver desde la confirmación no cambia nada', async () => {
      const fixture = await render();

      button(fixture, 'Cancelar orden').click();
      await fixture.whenStable();
      button(fixture, 'Volver').click();
      await fixture.whenStable();

      expect(changeStatus).not.toHaveBeenCalled();
      expect(element(fixture).querySelector('dialog')!.open).toBe(false);
    });

    it('deshabilita las acciones mientras se envía', async () => {
      const response = new Subject<AdminOrderDetail>();
      changeStatus.mockReturnValue(response);
      const fixture = await render();

      button(fixture, 'Marcar como pagada').click();
      await fixture.whenStable();

      expect(button(fixture, 'Marcar como pagada').disabled).toBe(true);
      expect(button(fixture, 'Cancelar orden').disabled).toBe(true);
    });

    it('ante un 409 muestra el mensaje y recarga la orden con su estado actual', async () => {
      changeStatus.mockReturnValue(throwError(() => httpError(409)));
      get.mockReturnValueOnce(of(order('PENDING_PAYMENT'))).mockReturnValueOnce(of(order('CANCELLED')));
      const fixture = await render();

      button(fixture, 'Marcar como pagada').click();
      await fixture.whenStable();

      expect(get).toHaveBeenCalledTimes(2);
      expect(element(fixture).querySelector('[role="alert"]')!.textContent).toContain('cambió desde otro dispositivo');
      expect(text(fixture)).toContain('Cancelada');
      expect(visibleButtons(fixture)).toEqual([]);
    });

    it('ante otro error conserva la orden y deja reintentar', async () => {
      changeStatus.mockReturnValueOnce(throwError(() => httpError(500)));
      const fixture = await render();

      button(fixture, 'Marcar como pagada').click();
      await fixture.whenStable();

      expect(get).toHaveBeenCalledTimes(1);
      expect(element(fixture).querySelector('[role="alert"]')!.textContent).toContain('No se pudo cambiar el estado');
      expect(text(fixture)).toContain('Pendiente de pago');

      button(fixture, 'Marcar como pagada').click();
      await fixture.whenStable();

      expect(element(fixture).querySelector('[role="alert"]')).toBeNull();
      expect(text(fixture)).toContain('La orden quedó como "Pagada".');
    });
  });

  describe('estados de carga', () => {
    it('muestra la carga mientras llega la orden', async () => {
      get.mockReturnValue(new Subject<AdminOrderDetail>());
      const fixture = await render();

      expect(text(fixture)).toContain('Cargando la orden');
    });

    it('si la orden no existe enlaza al listado', async () => {
      get.mockReturnValue(throwError(() => httpError(404)));
      const fixture = await render();

      expect(text(fixture)).toContain('No encontramos la orden ORD-2026-0007.');
      expect(element(fixture).querySelector('[role="alert"]')).toBeNull();
    });

    it('ante un error permite reintentar', async () => {
      get.mockReturnValueOnce(throwError(() => httpError(500)));
      const fixture = await render();

      expect(element(fixture).querySelector('[role="alert"]')!.textContent).toContain('No pudimos cargar la orden.');

      button(fixture, 'Reintentar').click();
      await fixture.whenStable();

      expect(text(fixture)).toContain('Ana Quispe');
      expect(element(fixture).querySelector('[role="alert"]')).toBeNull();
    });
  });
});
