import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { ADMIN_REQUEST } from './admin-auth.interceptor';
import { AdminOrderService, ORDERS_PAGE_SIZE } from './admin-order.service';

describe('AdminOrderService', () => {
  const ordersUrl = `${environment.apiUrl}/api/orders`;
  let service: AdminOrderService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(AdminOrderService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('pide 20 órdenes por página y marca la petición como del panel', () => {
    service.list(null, 2).subscribe();

    const request = http.expectOne((r) => r.url === ordersUrl);
    expect(ORDERS_PAGE_SIZE).toBe(20);
    expect(request.request.params.get('page')).toBe('2');
    expect(request.request.params.get('size')).toBe('20');
    expect(request.request.params.has('status')).toBe(false);
    expect(request.request.context.get(ADMIN_REQUEST)).toBe(true);
    request.flush({ content: [], page: 2, size: 20, totalElements: 0, totalPages: 0 });
  });

  it('envía el estado solo cuando hay filtro', () => {
    service.list('PAID', 0).subscribe();

    const request = http.expectOne((r) => r.url === ordersUrl);
    expect(request.request.params.get('status')).toBe('PAID');
    request.flush({ content: [], page: 0, size: 20, totalElements: 0, totalPages: 0 });
  });

  it('pide el detalle con el código en la ruta', () => {
    service.get('ORD-2026-0001').subscribe();

    const request = http.expectOne(`${ordersUrl}/ORD-2026-0001`);
    expect(request.request.method).toBe('GET');
    expect(request.request.context.get(ADMIN_REQUEST)).toBe(true);
    request.flush({});
  });

  it('cambia el estado con PATCH', () => {
    service.changeStatus('ORD-2026-0001', 'CANCELLED').subscribe();

    const request = http.expectOne(`${ordersUrl}/ORD-2026-0001/status`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({ status: 'CANCELLED' });
    expect(request.request.context.get(ADMIN_REQUEST)).toBe(true);
    request.flush({});
  });
});
