import { HttpErrorResponse } from '@angular/common/http';
import { Location } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { CardService } from '../core/card.service';
import { CartDrawerService } from '../core/cart-drawer.service';
import { CartService } from '../core/cart.service';
import { CardDetail } from '../models';
import { environment } from '../../environments/environment';
import ProductDetailPageComponent, { cardDescription, productStructuredData } from './product-detail-page.component';

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

describe('cardDescription', () => {
  it('usa el texto de la tarjeta con el precio', () => {
    expect(cardDescription(CARD)).toBe('Rosa Eterna: Una rosa roja de tres niveles con efecto de profundidad. S/. 17.00 en Hora Azul.');
  });

  it('sin texto usa las categorías', () => {
    expect(cardDescription({ ...CARD, description3d: null })).toBe('Rosa Eterna: Tarjeta pop-up 3D de flores, amor. S/. 17.00 en Hora Azul.');
  });

  it('corta en una palabra un texto largo, sin pasar de 160 caracteres', () => {
    const description = cardDescription({ ...CARD, description3d: 'palabra '.repeat(40) });

    expect(description.length).toBeLessThanOrEqual(160);
    expect(description.endsWith('palabra…')).toBe(true);
  });
});

describe('productStructuredData', () => {
  it('describe el producto con precio en soles, imágenes en orden y disponibilidad', () => {
    expect(productStructuredData(CARD)).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'Rosa Eterna',
      description: 'Una rosa roja de tres niveles con efecto de profundidad.',
      sku: '9',
      url: `${environment.siteUrl}/tarjeta/${CARD.id}`,
      image: ['https://img/cover.jpg', 'https://img/open.jpg', 'https://img/envelope.jpg'],
      brand: { '@type': 'Brand', name: 'Hora Azul' },
      category: 'Flores, Amor',
      offers: {
        '@type': 'Offer',
        url: `${environment.siteUrl}/tarjeta/${CARD.id}`,
        priceCurrency: 'PEN',
        price: '17.00',
        availability: 'https://schema.org/InStock',
        itemCondition: 'https://schema.org/NewCondition',
      },
    });
  });

  it('las fotos del catálogo pasan a URL absoluta y sin imágenes no hay campo image', () => {
    const local = productStructuredData({ ...CARD, images: [{ url: '/cards/09-0.webp', imageType: 'COVER', sortOrder: 0 }] });
    expect((local as { image: string[] }).image).toEqual([`${environment.siteUrl}/cards/09-0.webp`]);
    expect(productStructuredData({ ...CARD, images: [] })).not.toHaveProperty('image');
  });
});

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

  describe('buscadores', () => {
    const meta = (selector: string) => document.head.querySelector<HTMLMetaElement>(`meta[${selector}]`)?.content;
    const jsonLd = () => document.head.querySelector('script[type="application/ld+json"]');

    it('una tarjeta activa tiene título, descripción, canónica y datos de producto', () => {
      getCardById.mockReturnValue(of(CARD));
      render();

      expect(document.title).toBe('Rosa Eterna — Hora Azul');
      expect(meta('name="description"')).toBe(cardDescription(CARD));
      expect(document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')!.href).toBe(`${environment.siteUrl}/tarjeta/${CARD.id}`);
      expect(meta('name="robots"')).toBeUndefined();
      expect(JSON.parse(jsonLd()!.textContent!)).toEqual(productStructuredData(CARD));
    });

    it('los datos de producto se quitan al salir de la ficha', () => {
      getCardById.mockReturnValue(of(CARD));
      render().destroy();

      expect(jsonLd()).toBeNull();
    });

    it('una tarjeta inactiva pide no indexarse y no tiene datos de producto', () => {
      getCardById.mockReturnValue(of({ ...CARD, active: false }));
      render();

      expect(meta('name="robots"')).toBe('noindex');
      expect(jsonLd()).toBeNull();
    });

    it('una tarjeta inexistente pide no indexarse', () => {
      getCardById.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 404 })));
      render();

      expect(document.title).toBe('Tarjeta no encontrada — Hora Azul');
      expect(meta('name="robots"')).toBe('noindex');
    });
  });

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
