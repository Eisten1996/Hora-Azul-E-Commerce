import { Location } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { environment } from '../../environments/environment';
import OrderSuccessComponent from './order-success.component';

describe('OrderSuccessComponent', () => {
  let state: unknown;

  beforeEach(() => {
    state = null;
    TestBed.configureTestingModule({
      imports: [OrderSuccessComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ orderCode: 'ORD-2026-0007' }) } } },
      ],
    });
    jest.spyOn(TestBed.inject(Location), 'getState').mockImplementation(() => state);
  });

  function render(): HTMLElement {
    const fixture = TestBed.createComponent(OrderSuccessComponent);
    fixture.detectChanges();
    return fixture.nativeElement;
  }

  function whatsappLink(element: HTMLElement): HTMLAnchorElement {
    return [...element.querySelectorAll('a')].find((a) => a.textContent?.includes('WhatsApp'))!;
  }

  it('muestra el código de pedido, las instrucciones y el enlace al catálogo', () => {
    const element = render();

    expect(element.querySelector('[data-testid="order-code"]')?.textContent?.trim()).toBe('ORD-2026-0007');
    expect(element.textContent).toContain('opciones de pago');
    expect(element.querySelector('a[href="/"]')).not.toBeNull();
  });

  it('el botón de WhatsApp usa el resumen completo que pasó el checkout', () => {
    state = { whatsappUrl: 'https://wa.me/51988331275?text=resumen' };

    const link = whatsappLink(render());

    expect(link.href).toBe('https://wa.me/51988331275?text=resumen');
    expect(link.target).toBe('_blank');
  });

  it('si se recarga la página, el botón de WhatsApp lleva al menos el código del pedido', () => {
    const link = new URL(whatsappLink(render()).href);

    expect(link.pathname).toBe('/' + environment.whatsappNumber);
    expect(link.searchParams.get('text')).toContain('ORD-2026-0007');
  });
});
