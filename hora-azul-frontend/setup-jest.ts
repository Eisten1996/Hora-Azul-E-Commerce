import { setupZonelessTestEnv } from 'jest-preset-angular/setup-env/zoneless';

// La app corre sin zone.js (provideZonelessChangeDetection); los tests también
setupZonelessTestEnv();
