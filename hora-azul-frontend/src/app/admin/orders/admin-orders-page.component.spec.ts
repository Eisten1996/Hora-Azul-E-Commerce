import { TestBed } from '@angular/core/testing';
import { Router, convertToParamMap, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Observable, Subject, of, throwError } from 'rxjs';
import { OrderStatus } from '../../models';
import { AdminOrderPage, AdminOrderService, AdminOrderSummary } from '../core/admin-order.service';
import AdminOrdersPageComponent, { ordersQueryFromParams } from './admin-orders-page.component';

const ORDER: AdminOrderSummary = {
  orderCode: 'ORD-2026-0007',
  customerName: 'Ana Quispe',
  totalAmount: 47,
  status: 'PAID',
  createdAt: '2026-11-04T17:30:00',
};

function page(overrides: Partial<AdminOrderPage> = {}): AdminOrderPage {
  return { content: [ORDER], page: 0, size: 20, totalElements: 1, totalPages: 1, ...overrides };
}

describe('ordersQueryFromParams', () => {
  it('lee el estado y la página', () => {
    expect(ordersQueryFromParams(convertToParamMap({ estado: 'PAID', pagina: '3' }))).toEqual({ status: 'PAID', page: 3 });
  });

  it('sin parámetros muestra todas desde la primera página', () => {
    expect(ordersQueryFromParams(convertToParamMap({}))).toEqual({ status: null, page: 1 });
  });

  it.each(['INVENTADO', 'paid', ''])('ignora el estado %p', (estado) => {
    expect(ordersQueryFromParams(convertToParamMap({ estado })).status).toBeNull();
  });

  it.each(['0', '-1', '1.5', 'abc', ''])('ignora la página %p', (pagina) => {
    expect(ordersQueryFromParams(convertToParamMap({ pagina })).page).toBe(1);
  });
});

describe('AdminOrdersPageComponent', () => {
  let list: jest.Mock<Observable<AdminOrderPage>, [OrderStatus | null, number]>;

  beforeEach(() => {
    list = jest.fn(() => of(page()));
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'admin/ordenes', component: AdminOrdersPageComponent }]),
        { provide: AdminOrderService, useValue: { list } },
      ],
    });
  });

  async function render(url = '/admin/ordenes'): Promise<RouterTestingHarness> {
    const harness = await RouterTestingHarness.create(url);
    await harness.fixture.whenStable();
    return harness;
  }

  const text = (harness: RouterTestingHarness) => harness.routeNativeElement!.textContent ?? '';
  const query = <T extends Element>(harness: RouterTestingHarness, selector: string) =>
    harness.routeNativeElement!.querySelector<T>(selector);

  it('pide la primera página sin filtro y muestra los datos de cada orden', async () => {
    const harness = await render();

    expect(list).toHaveBeenCalledWith(null, 0);
    const row = query<HTMLElement>(harness, '[data-testid="row-ORD-2026-0007"]')!;
    expect(row.textContent).toContain('ORD-2026-0007');
    expect(row.textContent).toContain('Ana Quispe');
    expect(row.textContent).toContain('S/. 47.00');
    expect(row.textContent).toContain('Pagada');
    expect(row.textContent).toContain('2026');
    expect(query(harness, '[data-testid="item-ORD-2026-0007"]')).not.toBeNull();
    expect(text(harness)).toContain('1 orden');
  });

  it('enlaza al detalle conservando el filtro y la página', async () => {
    const harness = await render('/admin/ordenes?estado=PAID&pagina=2');

    const link = query<HTMLAnchorElement>(harness, '[data-testid="row-ORD-2026-0007"] a')!;
    expect(link.getAttribute('href')).toBe('/admin/ordenes/ORD-2026-0007?estado=PAID&pagina=2');
  });

  it('toma el filtro y la página de la URL', async () => {
    const harness = await render('/admin/ordenes?estado=CANCELLED&pagina=3');

    expect(list).toHaveBeenCalledWith('CANCELLED', 2);
    expect(query<HTMLSelectElement>(harness, '#filtro-estado')!.value).toBe('CANCELLED');
  });

  it('un estado manipulado en la URL no llega al servidor', async () => {
    await render('/admin/ordenes?estado=INVENTADO');

    expect(list).toHaveBeenCalledWith(null, 0);
  });

  it('al cambiar el filtro actualiza la URL y vuelve a la primera página', async () => {
    const harness = await render('/admin/ordenes?pagina=3');

    const select = query<HTMLSelectElement>(harness, '#filtro-estado')!;
    select.value = 'DELIVERED';
    select.dispatchEvent(new Event('change'));
    await harness.fixture.whenStable();

    expect(TestBed.inject(Router).url).toBe('/admin/ordenes?estado=DELIVERED');
    expect(list).toHaveBeenLastCalledWith('DELIVERED', 0);
  });

  it('al elegir "Todas" quita el filtro de la URL', async () => {
    const harness = await render('/admin/ordenes?estado=PAID');

    const select = query<HTMLSelectElement>(harness, '#filtro-estado')!;
    select.value = '';
    select.dispatchEvent(new Event('change'));
    await harness.fixture.whenStable();

    expect(TestBed.inject(Router).url).toBe('/admin/ordenes');
    expect(list).toHaveBeenLastCalledWith(null, 0);
  });

  describe('paginación', () => {
    it('no aparece con una sola página', async () => {
      const harness = await render();

      expect(query(harness, 'nav')).toBeNull();
    });

    it('en la primera página solo ofrece la siguiente y conserva el filtro', async () => {
      list.mockReturnValue(of(page({ totalElements: 45, totalPages: 3 })));
      const harness = await render('/admin/ordenes?estado=PAID');

      expect(text(harness)).toContain('Página 1 de 3');
      expect(query(harness, 'a[rel="prev"]')).toBeNull();
      expect(query(harness, 'a[rel="next"]')!.getAttribute('href')).toBe('/admin/ordenes?estado=PAID&pagina=2');
    });

    it('en una página intermedia ofrece ambas y la primera no lleva parámetro', async () => {
      list.mockReturnValue(of(page({ page: 1, totalElements: 45, totalPages: 3 })));
      const harness = await render('/admin/ordenes?pagina=2');

      expect(query(harness, 'a[rel="prev"]')!.getAttribute('href')).toBe('/admin/ordenes');
      expect(query(harness, 'a[rel="next"]')!.getAttribute('href')).toBe('/admin/ordenes?pagina=3');
    });

    it('en la última página solo ofrece la anterior', async () => {
      list.mockReturnValue(of(page({ page: 2, totalElements: 45, totalPages: 3 })));
      const harness = await render('/admin/ordenes?pagina=3');

      expect(query(harness, 'a[rel="prev"]')).not.toBeNull();
      expect(query(harness, 'a[rel="next"]')).toBeNull();
    });

    it('al navegar pide la página nueva', async () => {
      list.mockReturnValue(of(page({ totalElements: 45, totalPages: 3 })));
      const harness = await render();

      query<HTMLAnchorElement>(harness, 'a[rel="next"]')!.click();
      await harness.fixture.whenStable();

      expect(list).toHaveBeenLastCalledWith(null, 1);
    });
  });

  describe('estados', () => {
    it('muestra la carga mientras llega la respuesta y descarta la de un filtro anterior', async () => {
      const first = new Subject<AdminOrderPage>();
      const second = new Subject<AdminOrderPage>();
      list.mockReturnValueOnce(first).mockReturnValueOnce(second);
      const harness = await render();
      expect(text(harness)).toContain('Cargando órdenes');

      await harness.navigateByUrl('/admin/ordenes?estado=PAID');
      second.next(page({ content: [{ ...ORDER, customerName: 'Del filtro nuevo' }] }));
      first.next(page({ content: [{ ...ORDER, customerName: 'Del filtro anterior' }] }));
      await harness.fixture.whenStable();

      expect(text(harness)).toContain('Del filtro nuevo');
      expect(text(harness)).not.toContain('Del filtro anterior');
    });

    it('sin órdenes lo dice', async () => {
      list.mockReturnValue(of(page({ content: [], totalElements: 0, totalPages: 0 })));
      const harness = await render();

      expect(text(harness)).toContain('Todavía no hay órdenes.');
    });

    it('sin órdenes en un estado lo dice y deja cambiar el filtro', async () => {
      list.mockReturnValue(of(page({ content: [], totalElements: 0, totalPages: 0 })));
      const harness = await render('/admin/ordenes?estado=DELIVERED');

      expect(text(harness)).toContain('No hay órdenes en este estado.');
      expect(query(harness, '#filtro-estado')).not.toBeNull();
    });

    it('en una página fuera de rango enlaza a la primera', async () => {
      list.mockReturnValue(of(page({ content: [], page: 8, totalElements: 21, totalPages: 2 })));
      const harness = await render('/admin/ordenes?pagina=9');

      expect(text(harness)).toContain('Esta página ya no tiene órdenes.');
      expect(query(harness, 'nav')).toBeNull();
      expect(query(harness, 'a')!.getAttribute('href')).toBe('/admin/ordenes');
    });

    it('ante un error permite reintentar', async () => {
      list.mockReturnValueOnce(throwError(() => new Error('red')));
      const harness = await render();
      expect(query(harness, '[role="alert"]')!.textContent).toContain('No pudimos cargar las órdenes.');

      query<HTMLButtonElement>(harness, '[role="alert"] button')!.click();
      await harness.fixture.whenStable();

      expect(list).toHaveBeenCalledTimes(2);
      expect(query(harness, '[role="alert"]')).toBeNull();
      expect(text(harness)).toContain('Ana Quispe');
    });

    it('tras un error se puede seguir cambiando de filtro', async () => {
      list.mockReturnValueOnce(throwError(() => new Error('red')));
      const harness = await render();

      await harness.navigateByUrl('/admin/ordenes?estado=PAID');
      await harness.fixture.whenStable();

      expect(list).toHaveBeenLastCalledWith('PAID', 0);
      expect(text(harness)).toContain('Ana Quispe');
    });
  });
});
