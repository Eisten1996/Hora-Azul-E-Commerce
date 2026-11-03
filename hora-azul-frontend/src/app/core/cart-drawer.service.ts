import { Injectable, signal } from '@angular/core';

/** Estado de apertura del panel lateral del carrito, compartido por el navbar y el drawer. */
@Injectable({ providedIn: 'root' })
export class CartDrawerService {
  private readonly _open = signal(false);

  readonly open = this._open.asReadonly();

  toggle(): void {
    this._open.update((open) => !open);
  }

  show(): void {
    this._open.set(true);
  }

  close(): void {
    this._open.set(false);
  }
}
