import { Injectable, computed, signal } from '@angular/core';
import { CardSummary, CartItem } from '../models';

export const CART_STORAGE_KEY = 'hora_azul_cart';
export const MAX_QUANTITY_PER_ITEM = 99;

/** Datos mínimos de una tarjeta para agregarla al carrito (sirve tanto el resumen como el detalle). */
export type CartProduct = Pick<CardSummary, 'id' | 'catalogNumber' | 'name' | 'price'>;

/** Subtotal de un ítem en soles. Se calcula en céntimos para evitar errores de coma flotante. */
export function lineSubtotal(item: CartItem): number {
  return (toCents(item.unitPrice) * item.quantity) / 100;
}

/**
 * Estado del carrito con signals y persistencia en {@code localStorage}.
 *
 * <p>Si {@code localStorage} no está disponible o su cuota se excede, el carrito
 * sigue funcionando en memoria y {@link persistent} pasa a {@code false} para que
 * la UI avise al cliente de que no se guardará al cerrar el navegador.</p>
 */
@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly _items = signal<CartItem[]>([]);
  private readonly _persistent = signal(true);

  readonly items = this._items.asReadonly();

  /** {@code false} cuando el carrito solo vive en memoria (localStorage no disponible). */
  readonly persistent = this._persistent.asReadonly();

  readonly totalItems = computed(() =>
    this._items().reduce((sum, item) => sum + item.quantity, 0),
  );

  readonly totalAmount = computed(
    () =>
      this._items().reduce((cents, item) => cents + toCents(item.unitPrice) * item.quantity, 0) /
      100,
  );

  readonly isEmpty = computed(() => this._items().length === 0);

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Agrega una unidad de la tarjeta, o la crea con cantidad 1 si no estaba en el carrito.
   *
   * @returns {@code false} si el ítem ya tiene el máximo de 99 unidades y no se agregó
   */
  addItem(card: CartProduct): boolean {
    const existing = this._items().find((item) => item.tarjetaId === card.id);

    if (existing) {
      if (existing.quantity >= MAX_QUANTITY_PER_ITEM) {
        return false;
      }
      this._items.update((items) =>
        items.map((item) =>
          item.tarjetaId === card.id ? { ...item, quantity: item.quantity + 1 } : item,
        ),
      );
    } else {
      this._items.update((items) => [
        ...items,
        {
          tarjetaId: card.id,
          catalogNumber: card.catalogNumber,
          cardName: card.name,
          unitPrice: card.price,
          quantity: 1,
        },
      ]);
    }
    this.persist();
    return true;
  }

  removeItem(tarjetaId: string): void {
    this._items.update((items) => items.filter((item) => item.tarjetaId !== tarjetaId));
    this.persist();
  }

  /** Una cantidad ≤ 0 elimina el ítem; una mayor que 99 se limita a 99. */
  updateQuantity(tarjetaId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(tarjetaId);
      return;
    }
    const capped = Math.min(Math.floor(quantity), MAX_QUANTITY_PER_ITEM);
    this._items.update((items) =>
      items.map((item) => (item.tarjetaId === tarjetaId ? { ...item, quantity: capped } : item)),
    );
    this.persist();
  }

  clearCart(): void {
    this._items.set([]);
    this.persist();
  }

  /** Recarga el carrito desde {@code localStorage}, descartando entradas corruptas. */
  loadFromStorage(): void {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      this._items.set(Array.isArray(parsed) ? parsed.filter(isCartItem) : []);
    } catch {
      this._items.set([]);
    }
  }

  /** Guarda el carrito; si queda vacío elimina la entrada de {@code localStorage}. */
  private persist(): void {
    try {
      const items = this._items();
      if (items.length === 0) {
        localStorage.removeItem(CART_STORAGE_KEY);
      } else {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      }
      this._persistent.set(true);
    } catch {
      // localStorage no disponible o cuota excedida: el carrito sigue en memoria
      this._persistent.set(false);
    }
  }
}

function toCents(amount: number): number {
  return Math.round(amount * 100);
}

function isCartItem(value: unknown): value is CartItem {
  const item = value as Partial<CartItem> | null;
  return (
    typeof item === 'object' &&
    item !== null &&
    typeof item.tarjetaId === 'string' &&
    typeof item.catalogNumber === 'number' &&
    typeof item.cardName === 'string' &&
    typeof item.unitPrice === 'number' &&
    Number.isInteger(item.quantity) &&
    item.quantity! >= 1 &&
    item.quantity! <= MAX_QUANTITY_PER_ITEM
  );
}
