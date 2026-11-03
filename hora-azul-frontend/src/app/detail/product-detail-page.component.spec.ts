import { HttpErrorResponse } from '@angular/common/http';
import { Location } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { CardService } from '../core/card.service';
import { CartDrawerService } from '../core/cart-drawer.service';
import { CartService } from '../core/cart.service';
import { CardDetail } from '../models';
import ProductDetailPageComponent from './product-detail-page.component';

const CARD: CardDetail = {
  id: 'b2000001-0000-0000-0000-000000000009',
  catalogNumber: 9,
  name: 'Rosa Eterna',
  categories: ['FLORES', 'AMOR'],
  price: 17,
  dimensions: '15 x 20 cm',
  description3d: 'Una rosa roja de tres niveles con efecto de profundidad.',
  envelopeIncluded: true,
  coverImageUrl: 'https://img/cover.jpg',
  active: true,
  images: [
    { url: 'https://img/open.jpg', imageType: 'OPEN', sortOrder: 1 },
    { url: 'https://img/cover.jpg', imageType: 'COVER', sortOrder: 0 },
    { url: 'https://img/envelope.jpg', imageType: 'ENVELOPE', sortOrder: 2 },
  ],
  createdAt: '2026-01-01T00:00:00',
  updatedAt: '2026-01-01T00:00:00',
};

describe('ProductDetailPageComponent', () => {
  let getCardById: jest.Mock;
  let navigationState: unknown;

  beforeEach(() => {
    localStorage.clear();
    getCardById = jest.fn();
    navigationState = null;
    TestBed.configureTestingModule({
      imports: [ProductDetailPageComponent],
      providers: [
        provideRouter([]),
        { provide: CardService, useValue: { getCardById } },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: CARD.id }) } } },
      ],
    });
    jest.spyOn(TestBed.inject(Location), 'getState').mockImplementation(() => navigationState);
  });

  function render() {
    const fixture = TestBed.createComponent(ProductDetailPageComponent);
    fixture.detectChanges();
    return fixture;
  }

  function button(element: HTMLElement, text: string): HTMLButtonElement {
    return [...element.querySelectorAll('button')].find((b) => b.textContent?.includes(text))!;
  }

  it('muestra todos los datos de la tarjeta', () => {
    getCardById.mockReturnValue(of(CARD));

    const text: string = render().nativeElement.textContent;

    expect(getCardById).toHaveBeenCalledWith(CARD.id);
    for (const expected of ['Rosa Eterna', 'Nº 9', 'Flores', 'S/. 17.00', '15 x 20 cm', 'efecto de profundidad', 'Incluye sobre']) {
      expect(text).toContain(expected);
    }
  });

  it('la galería empieza en la portada y las miniaturas cambian la imagen activa', () => {
    getCardById.mockReturnValue(of(CARD));
    const fixture = render();
    const element: HTMLElement = fixture.nativeElement;
    const main = () => element.querySelector<HTMLImageElement>('[data-testid="gallery-main"]')!;

    expect(main().src).toBe('https://img/cover.jpg');
    expect(main().alt).toBe('Tarjeta pop-up 3D "Rosa Eterna": vista principal');

    element.querySelector<HTMLButtonElement>('button[aria-label="Ver tarjeta cerrada"]')!.click();
    fixture.detectChanges();

    expect(main().src).toBe('https://img/envelope.jpg');
  });

  it('"Agregar al carrito" agrega la tarjeta y abre el carrito', () => {
    getCardById.mockReturnValue(of(CARD));
    const fixture = render();

    button(fixture.nativeElement, 'Agregar al carrito').click();
    fixture.detectChanges();

    expect(TestBed.inject(CartService).items()).toEqual([
      { tarjetaId: CARD.id, catalogNumber: 9, cardName: 'Rosa Eterna', unitPrice: 17, quantity: 1 },
    ]);
    expect(TestBed.inject(CartDrawerService).open()).toBe(true);
  });

  it('avisa cuando ya hay 99 unidades en el carrito', () => {
    getCardById.mockReturnValue(of(CARD));
    const cart = TestBed.inject(CartService);
    cart.addItem(CARD);
    cart.updateQuantity(CARD.id, 99);
    const fixture = render();

    button(fixture.nativeElement, 'Agregar al carrito').click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('máximo de 99 unidades');
  });

  it('una tarjeta inactiva muestra el botón deshabilitado y el aviso de no disponible', () => {
    getCardById.mockReturnValue(of({ ...CARD, active: false }));
    const element: HTMLElement = render().nativeElement;

    expect(button(element, 'Agregar al carrito').disabled).toBe(true);
    expect(element.textContent).toContain('no está disponible');
  });

  it('un 404 muestra la página de tarjeta no encontrada con enlace al catálogo', () => {
    getCardById.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 404 })));
    const element: HTMLElement = render().nativeElement;

    expect(element.textContent).toContain('No encontramos esta tarjeta');
    expect(element.querySelector('a[href="/"]')).not.toBeNull();
  });

  it('volver restaura los filtros del catálogo de origen', () => {
    getCardById.mockReturnValue(of(CARD));
    navigationState = { catalogQueryParams: { categoria: ['FLORES'], precio: null, q: 'rosa' } };
    const navigate = jest.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    button(render().nativeElement, 'Volver al catálogo').click();

    expect(navigate).toHaveBeenCalledWith(['/'], {
      queryParams: { categoria: ['FLORES'], precio: null, q: 'rosa' },
    });
  });

  it('con acceso directo por URL, volver lleva al catálogo sin filtros', () => {
    getCardById.mockReturnValue(of(CARD));
    const navigate = jest.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    button(render().nativeElement, 'Volver al catálogo').click();

    expect(navigate).toHaveBeenCalledWith(['/'], { queryParams: {} });
  });
});
