import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';
import { CardService } from '../core/card.service';
import { CardSummary } from '../models';
import CatalogPageComponent from './catalog-page.component';
import { SAMPLE_CARDS } from './testing/cards.fixture';

describe('CatalogPageComponent', () => {
  let getCards: jest.Mock;

  beforeEach(() => {
    getCards = jest.fn();
    TestBed.configureTestingModule({
      imports: [CatalogPageComponent],
      providers: [provideRouter([]), { provide: CardService, useValue: { getCards } }],
    });
  });

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

  it('al pulsar una tarjeta navega a su detalle', () => {
    getCards.mockReturnValue(of(SAMPLE_CARDS));
    const navigate = jest.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    render().nativeElement.querySelector('app-card-item button').click();

    expect(navigate).toHaveBeenCalledWith(['/tarjeta', SAMPLE_CARDS[0].id]);
  });
});
