import { Routes } from '@angular/router';

/** Todas las rutas usan lazy loading para reducir el bundle inicial. */
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./catalog/catalog-page.component'),
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
