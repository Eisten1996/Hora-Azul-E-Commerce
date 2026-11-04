import { Routes } from '@angular/router';
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
        loadComponent: () => import('./layout/admin-placeholder.component'),
        data: { heading: 'Órdenes' },
        title: 'Hora Azul — Órdenes',
      },
      {
        path: 'tarjetas',
        loadComponent: () => import('./cards/admin-cards-page.component'),
        title: 'Hora Azul — Tarjetas',
      },
    ],
  },
];

export default routes;
