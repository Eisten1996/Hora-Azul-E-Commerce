# Implementation Plan: Panel Administrativo

## Overview

Implementación del Panel en `/admin` sobre la aplicación Angular y el backend Quarkus existentes. Cada sección corresponde a un requerimiento, a una rama `feature/REQ-N-*` y a un PR hacia `develop`. Las secciones se ejecutan en orden, porque la 2 y la 3 necesitan el acceso de la 1.

## Tasks

- [ ] 1. Acceso y estructura del Panel (rama `feature/REQ-10-admin-acceso`)
  - [ ] 1.1 Backend: endpoint de sesión
    - Crear `AdminResource` con `GET /api/admin/session` y `@RolesAllowed("admin")`
    - Tests: 200 con credenciales válidas, 401 sin credenciales y con contraseña errónea, cabeceras CORS presentes en el 401
    - _Requirements: 10.12_

  - [ ] 1.2 Autenticación en el frontend
    - Crear `AdminAuthService`, `ADMIN_REQUEST`, `adminAuthInterceptor` y `adminAuthGuard`
    - Registrar el interceptor en `app.config.ts`
    - Tests de Properties 11 y 12; guard con y sin Sesión; `returnUrl` externo descartado; 401 cierra la Sesión
    - _Requirements: 10.5, 10.6, 10.7, 10.8, 10.9_

  - [ ] 1.3 Pantalla de acceso
    - Crear `AdminLoginComponent` con estados de carga, credenciales incorrectas y servidor no disponible
    - Tests de los tres estados y de la contraseña vaciada tras el error
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

  - [ ] 1.4 Estructura del Panel
    - Crear `admin.routes.ts` con `loadChildren` y `AdminLayoutComponent`
    - Ocultar barra, pie y carrito en `/admin` desde `App`; retirar el shell en `index.html`
    - Añadir `Disallow: /admin` a `robots.txt`
    - Test: la barra de la tienda no aparece en `/admin` y sigue apareciendo en `/`
    - _Requirements: 10.10, 10.11_

  - [ ] 1.5 Verificación en navegador
    - Comprobar con el backend local que un acceso fallido no abre el diálogo nativo de Basic Auth
    - Comprobar recarga con Sesión, cierre de sesión y ruta protegida sin Sesión
    - _Requirements: 10.2, 10.5, 10.6, 10.7_

- [ ] 2. Gestión del catálogo (rama `feature/REQ-11-admin-catalogo`)
  - [ ] 2.1 Backend: listado y activación
    - Crear `GET /api/admin/cards` y `PATCH /api/cards/{id}/activate`
    - Tests: incluye inactivas, el listado público no las incluye, 401 sin credenciales, Property 10
    - _Requirements: 11.3, 11.12_

  - [ ] 2.2 Backend: reglas de alta y edición
    - Crear la migración `V3__numero_catalogo_sin_tope.sql` y quitar `@Max(33)`
    - Añadir `@Size(max = 10)` a `images` en los DTO de alta y edición
    - Tests: número 34 aceptado, 0 rechazado, 11 imágenes rechazadas con 422
    - _Requirements: 11.5, 11.10_

  - [ ] 2.3 Tarjetas inactivas en la compra
    - `OrderService`: rechazar con 404 una Tarjeta inactiva, sin registrar la Orden
    - Ficha pública: aviso "No disponible" y botón deshabilitado
    - Tests de backend y de componente, y Property 9
    - _Requirements: 11.13, 11.14, 11.15_

  - [ ] 2.4 Listado de tarjetas
    - Crear `AdminCardService` y `AdminCardsPageComponent` con filtro por estado y búsqueda
    - Crear `ConfirmDialogComponent`; desactivar y activar con confirmación
    - Tests de filtros, búsqueda, confirmación y estados de carga, vacío y error
    - _Requirements: 11.1, 11.2, 11.11, 11.12, 13.4_

  - [ ] 2.5 Formulario de tarjeta
    - Crear `AdminCardFormComponent` para alta y edición, con número propuesto y número de solo lectura al editar
    - Validaciones, foco en el primer error, error 409 junto al campo
    - `FormArray` de hasta 10 imágenes con tipo, orden y vista previa
    - Guard `canDeactivate` para cambios sin guardar; invalidar la caché de `CardService` al guardar
    - Tests de validación, payload de alta y edición, 409 y cambios sin guardar
    - _Requirements: 11.4, 11.6, 11.7, 11.8, 11.9, 11.16, 13.6_

- [ ] 3. Gestión de órdenes (rama `feature/REQ-12-admin-ordenes`)
  - [ ] 3.1 Backend: estados
    - Ampliar `OrderStatus` con `PAID`, `DELIVERED`, `CANCELLED` y `canTransitionTo`
    - Crear `PATCH /api/orders/{orderCode}/status`
    - Tests: Property 8, 409 sin cambios, 404, 401, y Orden nueva en `PENDING_PAYMENT`
    - _Requirements: 12.4, 12.5, 12.10, 12.11_

  - [ ] 3.2 Backend: consultas
    - Crear `OrderDetailDTO` y usarlo en el detalle; `POST` sigue devolviendo `OrderResponse`
    - Paginar `GET /api/orders` con filtro `status`, 400 si no existe, y `@BatchSize` en `Orden.items`
    - Tests de paginación, orden, filtro, y de que `POST` no expone campos nuevos
    - _Requirements: 12.1, 12.2, 12.3, 12.10_

  - [ ] 3.3 Listado de órdenes
    - Crear `AdminOrderService` y `AdminOrdersPageComponent`, con filtro y página en la URL
    - Tabla en escritorio y tarjetas en móvil
    - Tests de filtro, paginación, estado vacío y error
    - _Requirements: 12.1, 12.2, 13.1, 13.4_

  - [ ] 3.4 Detalle de orden
    - Crear `AdminOrderDetailComponent` con datos completos y enlace de WhatsApp al cliente
    - Acciones según el estado, con confirmación al cancelar o entregar y recarga ante 409
    - Tests de acciones por estado (incluidos los finales), confirmación, 409 y URL de WhatsApp
    - _Requirements: 12.3, 12.6, 12.7, 12.8, 12.9_

- [ ] 4. Calidad y salida a producción (rama `feature/REQ-13-admin-calidad`)
  - [ ] 4.1 Revisión de responsive y accesibilidad
    - Recorrer el Panel a 375 px y 1440 px, y con teclado
    - Pasar Lighthouse de accesibilidad a login, listados y formulario, y corregir lo encontrado
    - _Requirements: 13.1, 13.2, 13.3, 13.4_

  - [ ] 4.2 Comprobación del bundle
    - Comparar el bundle inicial con el de v1.0.1 (83.82 kB transferidos); no debe crecer más de 5 kB
    - _Requirements: 13.5_

  - [ ] 4.3 Documentación
    - Añadir a `DEPLOY.md` cómo entrar al Panel, dónde ver `ADMIN_PASSWORD` y cómo añadir fotos
    - _Requirements: 10.1, 11.9_

  - [ ] 4.4 Release y prueba de humo en producción
    - Publicar la release con la migración V3 y comprobar que Flyway la aplica en Neon
    - Con la aprobación del Administrador: entrar, editar una tarjeta y restaurarla, cancelar `ORD-2026-0001` y cerrar sesión
    - Medir Lighthouse móvil en la portada (≥ 80)
    - _Requirements: 13.5, 10.1, 11.7, 12.4_

## Notes

- Ramas, commits y PR siguen `.kiro/steering/git-flow.md`.
- El Panel no sustituye la API: los endpoints siguen disponibles para otros usos.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["1.3", "1.4"] },
    { "id": 2, "tasks": ["1.5"] },
    { "id": 3, "tasks": ["2.1", "2.2", "2.3", "3.1", "3.2"] },
    { "id": 4, "tasks": ["2.4", "3.3"] },
    { "id": 5, "tasks": ["2.5", "3.4"] },
    { "id": 6, "tasks": ["4.1", "4.2", "4.3"] },
    { "id": 7, "tasks": ["4.4"] }
  ]
}
```
