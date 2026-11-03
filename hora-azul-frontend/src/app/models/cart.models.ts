/** Ítem del carrito persistido en `localStorage`. */
export interface CartItem {
  tarjetaId: string;
  catalogNumber: number;
  cardName: string;
  unitPrice: number;
  quantity: number;
}
