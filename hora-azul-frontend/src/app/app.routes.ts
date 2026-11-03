import { Routes } from '@angular/router';
import CatalogPageComponent from './catalog/catalog-page.component';

/**
 * El catálogo es la página de entrada y va en el bundle inicial: cargarlo en diferido
 * retrasaba el primer pintado (LCP) una petición más. El resto de rutas usa lazy loading.
 */
export const routes: Routes = [
  {
    path: '',
    component: CatalogPageComponent,
    title: 'Hora Azul — Tarjetas pop-up 3D',
  },
  {
    path: 'tarjeta/:id',
    loadComponent: () => import('./detail/product-detail-page.component'),
  },
  {
    path: 'checkout',
    loadComponent: () => import('./checkout/checkout-page.component'),
    title: 'Hora Azul — Checkout',
  },
  {
    path: 'pedido/:orderCode',
    loadComponent: () => import('./success/order-success.component'),
    title: 'Hora Azul — Pedido confirmado',
  },
  { path: '**', redirectTo: '' },
];
