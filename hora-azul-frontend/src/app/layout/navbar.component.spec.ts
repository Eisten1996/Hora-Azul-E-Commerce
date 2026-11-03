import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CartDrawerService } from '../core/cart-drawer.service';
import { CartService } from '../core/cart.service';
import { NavbarComponent } from './navbar.component';

describe('NavbarComponent', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [NavbarComponent],
      providers: [provideRouter([])],
    });
  });

  function render() {
    const fixture = TestBed.createComponent(NavbarComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('oculta el badge cuando el carrito está vacío', () => {
    const fixture = render();
    expect(fixture.nativeElement.querySelector('[data-testid="cart-badge"]')).toBeNull();
  });

  it('muestra el total de ítems del carrito en el badge', () => {
    const cart = TestBed.inject(CartService);
    cart.addItem({ id: 'a', catalogNumber: 1, name: 'Globos', price: 15 });
    cart.addItem({ id: 'a', catalogNumber: 1, name: 'Globos', price: 15 });
    cart.addItem({ id: 'b', catalogNumber: 2, name: 'Torta', price: 17 });

    const fixture = render();

    const badge: HTMLElement = fixture.nativeElement.querySelector('[data-testid="cart-badge"]');
    expect(badge.textContent?.trim()).toBe('3');
    expect(fixture.nativeElement.querySelector('button').getAttribute('aria-label')).toBe(
      'Abrir carrito (3 tarjetas)',
    );
  });

  it('el botón del carrito abre y cierra el drawer', () => {
    const fixture = render();
    const drawer = TestBed.inject(CartDrawerService);
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');

    button.click();
    fixture.detectChanges();
    expect(drawer.open()).toBe(true);
    expect(button.getAttribute('aria-expanded')).toBe('true');

    button.click();
    expect(drawer.open()).toBe(false);
  });
});
