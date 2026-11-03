import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { CardListResponse, CardSummary } from '../models';
import { CardService } from './card.service';

const CARDS_URL = `${environment.apiUrl}/api/cards`;

const card: CardSummary = {
  id: 'a1000001-0000-0000-0000-000000000001',
  catalogNumber: 1,
  name: 'Globos de Cumpleaños',
  categories: ['CUMPLEANOS'],
  price: 15,
  dimensions: '15 x 20 cm',
  description3d: 'Tres globos de colores emergen al abrir la tarjeta.',
  envelopeIncluded: true,
  coverImageUrl: 'https://placehold.co/600x400',
};

function listResponse(content: CardSummary[]): CardListResponse {
  return { content, totalElements: content.length, totalPages: 1, page: 0, size: 100 };
}

describe('CardService', () => {
  let service: CardService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CardService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    jest.useRealTimers();
  });

  it('pide el catálogo completo con size=100', () => {
    let result: CardSummary[] | undefined;
    service.getCards().subscribe((cards) => (result = cards));

    const req = http.expectOne((r) => r.url === CARDS_URL);
    expect(req.request.params.get('size')).toBe('100');
    req.flush(listResponse([card]));

    expect(result).toEqual([card]);
  });

  it('devuelve la caché durante 5 minutos sin volver a llamar al backend', () => {
    jest.useFakeTimers({ now: 0 });
    service.getCards().subscribe();
    http.expectOne((r) => r.url === CARDS_URL).flush(listResponse([card]));

    jest.setSystemTime(CardService.CACHE_TTL_MS - 1);
    let cached: CardSummary[] | undefined;
    service.getCards().subscribe((cards) => (cached = cards));

    http.expectNone((r) => r.url === CARDS_URL);
    expect(cached).toEqual([card]);
  });

  it('vuelve a llamar al backend cuando la caché expira', () => {
    jest.useFakeTimers({ now: 0 });
    service.getCards().subscribe();
    http.expectOne((r) => r.url === CARDS_URL).flush(listResponse([card]));

    jest.setSystemTime(CardService.CACHE_TTL_MS);
    service.getCards().subscribe();

    http.expectOne((r) => r.url === CARDS_URL).flush(listResponse([]));
  });

  it('invalidateCache fuerza una nueva petición', () => {
    service.getCards().subscribe();
    http.expectOne((r) => r.url === CARDS_URL).flush(listResponse([card]));

    service.invalidateCache();
    service.getCards().subscribe();

    http.expectOne((r) => r.url === CARDS_URL).flush(listResponse([card]));
  });

  it('con filtros consulta al backend y no usa la caché', () => {
    service.getCards().subscribe();
    http.expectOne((r) => r.url === CARDS_URL).flush(listResponse([card]));

    service.getCards({ category: 'FLORES', maxPrice: 20 }).subscribe();

    const req = http.expectOne((r) => r.url === CARDS_URL);
    expect(req.request.params.get('category')).toBe('FLORES');
    expect(req.request.params.get('maxPrice')).toBe('20');
    expect(req.request.params.has('minPrice')).toBe(false);
    req.flush(listResponse([]));
  });

  it('getCardById siempre consulta al backend', () => {
    service.getCardById(card.id).subscribe();
    http.expectOne(`${CARDS_URL}/${card.id}`).flush({});

    service.getCardById(card.id).subscribe();
    http.expectOne(`${CARDS_URL}/${card.id}`).flush({});
  });
});
