import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { OrderRequest, OrderResponse } from '../models';
import { OrderError, OrderService } from './order.service';

const ORDERS_URL = `${environment.apiUrl}/api/orders`;

const request: OrderRequest = {
  customerName: 'Cliente de Prueba',
  customerPhone: '987654321',
  deliveryAddress: 'Av. Siempre Viva 742, Lima',
  estimatedDeliveryDate: '2026-12-01',
  items: [{ tarjetaId: 'a1000001-0000-0000-0000-000000000001', quantity: 2 }],
};

describe('OrderService', () => {
  let service: OrderService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(OrderService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('envía POST /api/orders y devuelve la orden creada', () => {
    const response = { orderCode: 'ORD-2026-0001' } as OrderResponse;
    let result: OrderResponse | undefined;

    service.createOrder(request).subscribe((order) => (result = order));

    const req = http.expectOne(ORDERS_URL);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush(response, { status: 201, statusText: 'Created' });

    expect(result).toEqual(response);
  });

  function errorFor(status: number, body: unknown = null): OrderError {
    let error: OrderError | undefined;
    service.createOrder(request).subscribe({ error: (err) => (error = err) });
    const req = http.expectOne(ORDERS_URL);
    if (status === 0) {
      req.error(new ProgressEvent('error'));
    } else {
      req.flush(body, { status, statusText: 'Error' });
    }
    return error!;
  }

  it('traduce un error de red a un mensaje de conexión', () => {
    const error = errorFor(0);
    expect(error).toBeInstanceOf(OrderError);
    expect(error.message).toContain('No pudimos conectar con el servidor');
  });

  it('incluye el mensaje del backend en errores de validación', () => {
    const error = errorFor(422, { status: 422, error: 'VALIDATION_ERROR', message: 'customerPhone: inválido' });
    expect(error.status).toBe(422);
    expect(error.message).toBe('Revisa los datos del pedido: customerPhone: inválido');
  });

  it('avisa cuando una tarjeta ya no existe (404)', () => {
    expect(errorFor(404).message).toContain('ya no está disponible');
  });

  it('usa un mensaje genérico para errores del servidor', () => {
    expect(errorFor(500).message).toContain('Ocurrió un error al registrar tu pedido');
  });
});
