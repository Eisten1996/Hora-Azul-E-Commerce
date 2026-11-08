import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Params, Router, provideRouter } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';
import { CardService } from '../core/card.service';
import { CardSummary } from '../models';
import CatalogPageComponent from './catalog-page.component';
import { SAMPLE_CARDS } from './testing/cards.fixture';

describe('CatalogPageComponent', () => {
  let getCards: jest.Mock;
  /** Query params con los que se llega a la página. */
  let initialParams: Params;

  beforeEach(() => {
    getCards = jest.fn();
    initialParams = {};
    TestBed.configureTestingModule({
      imports: [CatalogPageComponent],
      providers: [
        provideRouter([]),
        { provide: CardService, useValue: { getCards } },
        { provide: ActivatedRoute, useFactory: () => ({ snapshot: { queryParams: initialParams } }) },
      ],
    });
  });

  function labelInput(element: HTMLElement, text: string): HTMLInputElement {
    const label = [...element.querySelectorAll('label')].find((l) => l.textContent?.trim() === text)!;
    return label.querySelector('input')!;
  }

  function render() {
    const fixture = TestBed.createComponent(CatalogPageComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('muestra skeletons mientras el backend responde', () => {
    getCards.mockReturnValue(new Subject<CardSummary[]>());

    const element: HTMLElement = render().nativeElement;

    expect(element.querySelectorAll('[data-testid="card-skeleton"]').length).toBeGreaterThan(0);
  });

  it('muestra la cuadrícula con las tarjetas recibidas', () => {
    getCards.mockReturnValue(of(SAMPLE_CARDS));

    const element: HTMLElement = render().nativeElement;

    expect(element.querySelectorAll('app-card-item').length).toBe(3);
  });

  it('muestra un mensaje cuando no hay tarjetas activas', () => {
    getCards.mockReturnValue(of([]));

    expect(render().nativeElement.textContent).toContain('No hay tarjetas disponibles');
  });

  it('ante un error muestra el mensaje y Reintentar vuelve a pedir el catálogo', () => {
    getCards.mockReturnValueOnce(throwError(() => new Error('500'))).mockReturnValueOnce(of(SAMPLE_CARDS));
    const fixture = render();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('[role="alert"]')?.textContent).toContain('No pudimos cargar el catálogo.');

    (element.querySelector('[role="alert"] button') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(getCards).toHaveBeenCalledTimes(2);
    expect(element.querySelectorAll('app-card-item').length).toBe(3);
  });

  it('aplica los filtros de los query params al llegar a la página', () => {
    getCards.mockReturnValue(of(SAMPLE_CARDS));
    initialParams = { categoria: ['FLORES', 'AMOR'], precio: 'HASTA_20' };

    const element: HTMLElement = render().nativeElement;

    const items = element.querySelectorAll('app-card-item');
    expect(items.length).toBe(1);
    expect(items[0].textContent).toContain('Rosa Eterna');
    expect(element.textContent).toContain('1 de 3 tarjetas');
  });

  it('sin coincidencias muestra el mensaje del requerimiento y mantiene los filtros visibles', () => {
    getCards.mockReturnValue(of(SAMPLE_CARDS));
    initialParams = { q: 'unicornio' };

    const element: HTMLElement = render().nativeElement;

    expect(element.textContent).toContain('No se encontraron tarjetas con ese criterio de búsqueda.');
    expect(element.querySelector('app-filter-panel')).not.toBeNull();
  });

  it('al cambiar un filtro lo guarda en los query params', () => {
    getCards.mockReturnValue(of(SAMPLE_CARDS));
    const navigate = jest.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const element: HTMLElement = render().nativeElement;

    labelInput(element, 'Amor').click();

    expect(navigate).toHaveBeenCalledWith([], expect.objectContaining({
      queryParams: { categoria: ['AMOR'], precio: null, q: null },
      replaceUrl: true,
    }));
  });

  it('dos cambios seguidos se combinan aunque la navegación no haya terminado', () => {
    getCards.mockReturnValue(of(SAMPLE_CARDS));
    // La navegación nunca se completa: los filtros no pueden depender de la URL
    const navigate = jest.spyOn(TestBed.inject(Router), 'navigate').mockReturnValue(new Promise(() => undefined));
    const fixture = render();
    const element: HTMLElement = fixture.nativeElement;

    labelInput(element, 'Flores').click();
    fixture.detectChanges();
    labelInput(element, 'Hasta S/. 20.00').click();
    fixture.detectChanges();

    expect(navigate).toHaveBeenLastCalledWith([], expect.objectContaining({
      queryParams: { categoria: ['FLORES'], precio: 'HASTA_20', q: null },
    }));
    expect(element.textContent).toContain('1 de 3 tarjetas');
  });

  it('al pulsar una tarjeta navega a su detalle pasando los filtros activos', () => {
    getCards.mockReturnValue(of(SAMPLE_CARDS));
    initialParams = { precio: 'HASTA_20' };
    const navigate = jest.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);

    render().nativeElement.querySelector('app-card-item a').click();

    expect(navigate).toHaveBeenCalledTimes(1);
    const [url, extras] = navigate.mock.calls[0];
    expect(String(url)).toBe(`/tarjeta/${SAMPLE_CARDS[0].id}`);
    expect(extras?.state).toEqual({ catalogQueryParams: { categoria: null, precio: 'HASTA_20', q: null } });
  });
});
