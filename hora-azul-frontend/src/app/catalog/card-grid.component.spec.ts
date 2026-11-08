import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CardSummary } from '../models';
import { CardGridComponent } from './card-grid.component';
import { SAMPLE_CARDS } from './testing/cards.fixture';

describe('CardGridComponent y CardItemComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter([])] }));

  function render(inputs: { cards?: CardSummary[]; loading?: boolean }) {
    const fixture = TestBed.createComponent(CardGridComponent);
    if (inputs.cards) fixture.componentRef.setInput('cards', inputs.cards);
    if (inputs.loading !== undefined) fixture.componentRef.setInput('loading', inputs.loading);
    fixture.detectChanges();
    return fixture;
  }

  it('muestra skeletons mientras carga', () => {
    const element: HTMLElement = render({ loading: true }).nativeElement;

    expect(element.querySelectorAll('[data-testid="card-skeleton"]').length).toBe(8);
    expect(element.querySelectorAll('app-card-item').length).toBe(0);
  });

  it('con la lista vacía y sin carga no renderiza ítems ni skeletons', () => {
    const element: HTMLElement = render({ cards: [], loading: false }).nativeElement;

    expect(element.querySelectorAll('app-card-item').length).toBe(0);
    expect(element.querySelectorAll('[data-testid="card-skeleton"]').length).toBe(0);
  });

  it('renderiza una tarjeta por cada elemento con nombre, categoría y precio', () => {
    const element: HTMLElement = render({ cards: SAMPLE_CARDS }).nativeElement;

    const items = element.querySelectorAll('app-card-item');
    expect(items.length).toBe(3);
    expect(items[0].textContent).toContain('Globos de Cumpleaños');
    expect(items[0].textContent).toContain('Cumpleaños');
    expect(items[0].textContent).toContain('S/. 15.00');
    expect(items[2].textContent).toContain('S/. 30.00');
  });

  it('la imagen de portada tiene un alt descriptivo', () => {
    const img: HTMLImageElement = render({ cards: SAMPLE_CARDS }).nativeElement.querySelector('img');

    expect(img.alt).toBe('Tarjeta pop-up 3D "Globos de Cumpleaños", Cumpleaños');
  });

  it('cada tarjeta es un enlace real a su ficha, con su nombre como texto', () => {
    const element: HTMLElement = render({ cards: SAMPLE_CARDS }).nativeElement;

    const links = [...element.querySelectorAll<HTMLAnchorElement>('app-card-item a')];
    expect(links.map((a) => a.getAttribute('href'))).toEqual(SAMPLE_CARDS.map((c) => `/tarjeta/${c.id}`));
    expect(links[1].textContent!.trim()).toBe(SAMPLE_CARDS[1].name);
    expect(element.querySelector('app-card-item button')).toBeNull();
  });
});
