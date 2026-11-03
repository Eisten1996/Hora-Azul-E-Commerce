import { CART_STORAGE_KEY, CartProduct, CartService } from './cart.service';

const GLOBOS: CartProduct = {
  id: 'a1000001-0000-0000-0000-000000000001',
  catalogNumber: 1,
  name: 'Globos de Cumpleaños',
  price: 15,
};
const TORTA: CartProduct = {
  id: 'a1000002-0000-0000-0000-000000000002',
  catalogNumber: 2,
  name: 'Torta con Velas',
  price: 17,
};

describe('CartService', () => {
  let cart: CartService;

  beforeEach(() => {
    localStorage.clear();
    cart = new CartService();
  });

  afterEach(() => jest.restoreAllMocks());

  it('empieza vacío', () => {
    expect(cart.isEmpty()).toBe(true);
    expect(cart.totalItems()).toBe(0);
    expect(cart.totalAmount()).toBe(0);
  });

  it('agrega una tarjeta nueva con cantidad 1 y la incrementa si ya existe', () => {
    cart.addItem(GLOBOS);
    cart.addItem(GLOBOS);
    cart.addItem(TORTA);

    expect(cart.items()).toEqual([
      { tarjetaId: GLOBOS.id, catalogNumber: 1, cardName: GLOBOS.name, unitPrice: 15, quantity: 2 },
      { tarjetaId: TORTA.id, catalogNumber: 2, cardName: TORTA.name, unitPrice: 17, quantity: 1 },
    ]);
    expect(cart.totalItems()).toBe(3);
    expect(cart.totalAmount()).toBe(47);
  });

  it('rechaza agregar cuando el ítem ya tiene 99 unidades', () => {
    cart.addItem(GLOBOS);
    cart.updateQuantity(GLOBOS.id, 99);

    expect(cart.addItem(GLOBOS)).toBe(false);
    expect(cart.items()[0].quantity).toBe(99);
  });

  it('updateQuantity limita a 99 y elimina con cantidad 0', () => {
    cart.addItem(GLOBOS);
    cart.updateQuantity(GLOBOS.id, 150);
    expect(cart.items()[0].quantity).toBe(99);

    cart.updateQuantity(GLOBOS.id, 0);
    expect(cart.isEmpty()).toBe(true);
  });

  it('persiste en localStorage y otra instancia recupera el carrito', () => {
    cart.addItem(GLOBOS);
    cart.addItem(TORTA);

    expect(new CartService().items()).toEqual(cart.items());
  });

  it('elimina la entrada de localStorage al vaciar el carrito', () => {
    cart.addItem(GLOBOS);
    cart.removeItem(GLOBOS.id);
    expect(localStorage.getItem(CART_STORAGE_KEY)).toBeNull();

    cart.addItem(TORTA);
    cart.clearCart();
    expect(localStorage.getItem(CART_STORAGE_KEY)).toBeNull();
    expect(cart.isEmpty()).toBe(true);
  });

  it('sigue funcionando en memoria si localStorage falla y lo indica', () => {
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Quota exceeded', 'QuotaExceededError');
    });

    expect(cart.addItem(GLOBOS)).toBe(true);
    expect(cart.totalItems()).toBe(1);
    expect(cart.persistent()).toBe(false);
  });

  it('ignora datos corruptos en localStorage', () => {
    localStorage.setItem(CART_STORAGE_KEY, '{no es json');
    expect(new CartService().items()).toEqual([]);

    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify([{ tarjetaId: 'x', quantity: 0 }, { foo: 'bar' }]),
    );
    expect(new CartService().items()).toEqual([]);
  });
});
