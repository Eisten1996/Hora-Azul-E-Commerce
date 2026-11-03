import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { CartDrawerService } from '../core/cart-drawer.service';
import { CartProduct, CartService } from '../core/cart.service';
import { CartDrawerComponent } from './cart-drawer.component';

const GLOBOS: CartProduct = { id: 'a', catalogNumber: 1, name: 'Globos', price: 15 };
const TORTA: CartProduct = { id: 'b', catalogNumber: 2, name: 'Torta', price: 17 };

describe('CartDrawerComponent y CartItemComponent', () => {
  let fixture: ComponentFixture<CartDrawerComponent>;
  let cart: CartService;
  let drawer: CartDrawerService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ imports: [CartDrawerComponent], providers: [provideRouter([])] });
    cart = TestBed.inject(CartService);
    drawer = TestBed.inject(CartDrawerService);
  });

  function open(): HTMLElement {
    fixture = TestBed.createComponent(CartDrawerComponent);
    drawer.show();
    fixture.detectChanges();
    return fixture.nativeElement;
  }

  function click(element: HTMLElement, label: string): void {
    element.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`)!.click();
    fixture.detectChanges();
  }

  it('no muestra nada mientras está cerrado', () => {
    fixture = TestBed.createComponent(CartDrawerComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="dialog"]')).toBeNull();
  });

  it('lista los ítems con precio unitario, subtotal y total', () => {
    cart.addItem(GLOBOS);
    cart.addItem(GLOBOS);
    cart.addItem(TORTA);

    const element = open();

    expect(element.querySelectorAll('app-cart-item').length).toBe(2);
    expect(element.textContent).toContain('S/. 15.00 c/u');
    expect(element.textContent).toContain('S/. 30.00');
    expect(element.textContent).toContain('S/. 47.00');
  });

  it('los botones + y − cambian la cantidad y − en 1 elimina el ítem', () => {
    cart.addItem(GLOBOS);
    const element = open();

    click(element, 'Agregar una unidad de Globos');
    expect(cart.items()[0].quantity).toBe(2);

    click(element, 'Quitar una unidad de Globos');
    click(element, 'Quitar una unidad de Globos');
    expect(cart.isEmpty()).toBe(true);
    expect(element.textContent).toContain('Tu carrito está vacío.');
  });

  it('dos clics seguidos en + suman dos unidades aunque la vista no se haya actualizado', () => {
    cart.addItem(GLOBOS);
    const element = open();
    const plus = element.querySelector<HTMLButtonElement>('button[aria-label="Agregar una unidad de Globos"]')!;

    plus.click();
    plus.click();

    expect(cart.items()[0].quantity).toBe(3);
  });

  it('el botón + se deshabilita en 99 unidades', () => {
    cart.addItem(GLOBOS);
    cart.updateQuantity(GLOBOS.id, 99);
    const element = open();

    const plus = element.querySelector<HTMLButtonElement>('button[aria-label="Agregar una unidad de Globos"]')!;
    expect(plus.disabled).toBe(true);
    expect(element.textContent).toContain('Máximo 99 unidades');
  });

  it('"Eliminar" quita el ítem del carrito', () => {
    cart.addItem(GLOBOS);
    cart.addItem(TORTA);
    const element = open();

    click(element, 'Eliminar Globos del carrito');

    expect(cart.items().map((i) => i.cardName)).toEqual(['Torta']);
  });

  it('"Confirmar pedido" con carrito vacío avisa y no navega', () => {
    const navigate = jest.spyOn(TestBed.inject(Router), 'navigate');
    const element = open();

    [...element.querySelectorAll('button')].find((b) => b.textContent?.includes('Confirmar pedido'))!.click();
    fixture.detectChanges();

    expect(element.querySelector('[role="alert"]')?.textContent).toContain('Agrega al menos una tarjeta');
    expect(navigate).not.toHaveBeenCalled();
  });

  it('"Confirmar pedido" con ítems cierra el panel y va al checkout', () => {
    const navigate = jest.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    cart.addItem(GLOBOS);
    const element = open();

    [...element.querySelectorAll('button')].find((b) => b.textContent?.includes('Confirmar pedido'))!.click();

    expect(navigate).toHaveBeenCalledWith(['/checkout']);
    expect(drawer.open()).toBe(false);
  });

  it('Escape cierra el panel', () => {
    open();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(drawer.open()).toBe(false);
  });
});
