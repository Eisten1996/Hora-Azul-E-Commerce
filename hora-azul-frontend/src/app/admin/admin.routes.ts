import { Routes } from '@angular/router';
import { unsavedChangesGuard } from './cards/unsaved-changes.guard';
import { adminAuthGuard } from './core/admin-auth.guard';

const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login/admin-login.component'),
    title: 'Hora Azul — Acceso al panel',
  },
  {
    path: '',
    loadComponent: () => import('./layout/admin-layout.component'),
    canActivate: [adminAuthGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'ordenes' },
      {
        path: 'ordenes',
        loadComponent: () => import('./orders/admin-orders-page.component'),
        title: 'Hora Azul — Órdenes',
      },
      {
        path: 'ordenes/:orderCode',
        loadComponent: () => import('./orders/admin-order-detail.component'),
        title: 'Hora Azul — Detalle de orden',
      },
      {
        path: 'tarjetas',
        loadComponent: () => import('./cards/admin-cards-page.component'),
        title: 'Hora Azul — Tarjetas',
      },
      {
        path: 'tarjetas/nueva',
        loadComponent: () => import('./cards/admin-card-form.component'),
        canDeactivate: [unsavedChangesGuard],
        title: 'Hora Azul — Nueva tarjeta',
      },
      {
        path: 'tarjetas/:id',
        loadComponent: () => import('./cards/admin-card-form.component'),
        canDeactivate: [unsavedChangesGuard],
        title: 'Hora Azul — Editar tarjeta',
      },
    ],
  },
];

export default routes;
