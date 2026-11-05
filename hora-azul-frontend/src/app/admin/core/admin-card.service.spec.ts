import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { CardService } from '../../core/card.service';
import { ADMIN_REQUEST } from './admin-auth.interceptor';
import { AdminCardService, CardPayload } from './admin-card.service';

const PAYLOAD: CardPayload = {
  name: 'Lirios',
  categories: ['FLORES'],
  price: 20,
  dimensions: null,
  description3d: null,
  envelopeIncluded: true,
  images: [],
};

describe('AdminCardService', () => {
  let http: HttpTestingController;
  let service: AdminCardService;
  let invalidateCache: jest.SpyInstance;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    http = TestBed.inject(HttpTestingController);
    service = TestBed.inject(AdminCardService);
    invalidateCache = jest.spyOn(TestBed.inject(CardService), 'invalidateCache');
  });

  afterEach(() => http.verify());

  it('lista desde el endpoint del panel marcando la petición como administrativa', () => {
    service.list().subscribe();

    const req = http.expectOne(`${environment.apiUrl}/api/admin/cards`);
    expect(req.request.context.get(ADMIN_REQUEST)).toBe(true);
    req.flush([]);
    expect(invalidateCache).not.toHaveBeenCalled();
  });

  it('crear invalida la caché del catálogo al confirmarse', () => {
    service.create({ ...PAYLOAD, catalogNumber: 34 }).subscribe();

    const req = http.expectOne({ method: 'POST', url: `${environment.apiUrl}/api/cards` });
    expect(req.request.context.get(ADMIN_REQUEST)).toBe(true);
    expect(req.request.body.catalogNumber).toBe(34);
    expect(invalidateCache).not.toHaveBeenCalled();
    req.flush({});
    expect(invalidateCache).toHaveBeenCalledTimes(1);
  });

  it('editar invalida la caché del catálogo al confirmarse', () => {
    service.update('a-1', PAYLOAD).subscribe();

    http.expectOne({ method: 'PUT', url: `${environment.apiUrl}/api/cards/a-1` }).flush({});
    expect(invalidateCache).toHaveBeenCalledTimes(1);
  });

  it.each([
    [true, 'activate'],
    [false, 'deactivate'],
  ])('setActive(%s) llama a /%s e invalida la caché', (active, action) => {
    service.setActive('a-1', active).subscribe();

    const req = http.expectOne({ method: 'PATCH', url: `${environment.apiUrl}/api/cards/a-1/${action}` });
    expect(req.request.context.get(ADMIN_REQUEST)).toBe(true);
    req.flush({});
    expect(invalidateCache).toHaveBeenCalledTimes(1);
  });

  it('un error no invalida la caché', () => {
    service.setActive('a-1', false).subscribe({ error: () => undefined });

    http.expectOne(`${environment.apiUrl}/api/cards/a-1/deactivate`).flush(null, { status: 500, statusText: 'Error' });
    expect(invalidateCache).not.toHaveBeenCalled();
  });

  it('el mensaje de éxito se muestra una sola vez', () => {
    service.setNotice('Tarjeta creada.');

    expect(service.takeNotice()).toBe('Tarjeta creada.');
    expect(service.takeNotice()).toBe('');
  });
});
