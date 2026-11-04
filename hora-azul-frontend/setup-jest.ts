import { setupZonelessTestEnv } from 'jest-preset-angular/setup-env/zoneless';
import { TextEncoder } from 'node:util';

// La app corre sin zone.js (provideZonelessChangeDetection); los tests también
setupZonelessTestEnv();

// jsdom no incluye TextEncoder
Object.assign(globalThis, { TextEncoder });

// jsdom tampoco implementa los métodos de <dialog>
HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
  this.open = true;
};
HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
  this.open = false;
  this.dispatchEvent(new Event('close'));
};
