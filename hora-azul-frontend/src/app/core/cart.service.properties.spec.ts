import * as fc from 'fast-check';
import { CartProduct, CartService, lineSubtotal } from './cart.service';

/** Producto con precio expresado en céntimos enteros (como cualquier precio en soles). */
interface GeneratedLine {
  product: CartProduct;
  priceCents: number;
  quantity: number;
}

const lineArb = (quantity: fc.Arbitrary<number>): fc.Arbitrary<GeneratedLine> =>
  fc
    .record({
      id: fc.uuid(),
      catalogNumber: fc.integer({ min: 1, max: 33 }),
      name: fc.string({ minLength: 1, maxLength: 150 }),
      priceCents: fc.integer({ min: 1, max: 100_000 }),
      quantity,
    })
    .map(({ priceCents, quantity, ...rest }) => ({
      product: { ...rest, price: priceCents / 100 },
      priceCents,
      quantity,
    }));

const cartArb = fc.uniqueArray(lineArb(fc.integer({ min: 1, max: 99 })), {
  maxLength: 20,
  selector: (line) => line.product.id,
});

/** Construye el carrito usando solo la API pública del servicio. */
function buildCart(lines: GeneratedLine[]): CartService {
  const cart = new CartService();
  for (const { product, quantity } of lines) {
    cart.addItem(product);
    cart.updateQuantity(product.id, quantity);
  }
  return cart;
}

describe('CartService — propiedades', () => {
  beforeEach(() => localStorage.clear());

  // Feature: hora-azul-ecommerce, Propiedad 1: Integridad aritmética del carrito
  // Validates: Requirements 4.2, 4.3, 4.4
  it('P1: subtotal = precio × cantidad y total = suma de subtotales', () => {
    fc.assert(
      fc.property(cartArb, (lines) => {
        localStorage.clear();
        const cart = buildCart(lines);

        let expectedCents = 0;
        lines.forEach(({ priceCents, quantity }, index) => {
          expect(lineSubtotal(cart.items()[index])).toBe((priceCents * quantity) / 100);
          expectedCents += priceCents * quantity;
        });

        expect(cart.totalAmount()).toBe(expectedCents / 100);
        expect(cart.totalItems()).toBe(lines.reduce((sum, line) => sum + line.quantity, 0));
      }),
    );
  });

  // Feature: hora-azul-ecommerce, Propiedad 4: Round-trip de persistencia del carrito
  // Validates: Requirements 4.7
  it('P4: guardar y recargar desde localStorage produce el mismo carrito', () => {
    fc.assert(
      fc.property(cartArb, (lines) => {
        localStorage.clear();
        const original = buildCart(lines);

        const reloaded = new CartService();

        expect(reloaded.items()).toEqual(original.items());
      }),
    );
  });

  // Feature: hora-azul-ecommerce, Propiedad 6: Eliminación por cantidad cero
  // Validates: Requirements 4.5
  it('P6: decrementar un ítem con cantidad 1 lo elimina sin dejar cantidades ≤ 0', () => {
    fc.assert(
      fc.property(cartArb, lineArb(fc.constant(1)), (others, target) => {
        fc.pre(others.every((line) => line.product.id !== target.product.id));
        localStorage.clear();
        const cart = buildCart([...others, target]);

        cart.updateQuantity(target.product.id, 0);

        expect(cart.items().some((item) => item.tarjetaId === target.product.id)).toBe(false);
        expect(cart.items()).toHaveLength(others.length);
        expect(cart.items().every((item) => item.quantity >= 1)).toBe(true);
      }),
    );
  });
});
