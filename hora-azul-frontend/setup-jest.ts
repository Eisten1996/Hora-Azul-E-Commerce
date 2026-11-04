import { setupZonelessTestEnv } from 'jest-preset-angular/setup-env/zoneless';
import { TextEncoder } from 'node:util';

// La app corre sin zone.js (provideZonelessChangeDetection); los tests también
setupZonelessTestEnv();

// jsdom no incluye TextEncoder
Object.assign(globalThis, { TextEncoder });
