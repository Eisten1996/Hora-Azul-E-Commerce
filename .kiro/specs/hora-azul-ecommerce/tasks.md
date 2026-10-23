# Implementation Plan: Hora Azul E-Commerce

## Overview

Implementación completa del MVP de Hora Azul E-Commerce, una plataforma de venta en línea para tarjetas pop-up 3D artesanales con corte láser. El stack comprende Angular 18+ en Cloudflare Pages (frontend), Quarkus 3.x en Render/Koyeb (backend) y PostgreSQL en Neon (base de datos). El checkout cierra la venta a través de un enlace WhatsApp preformateado, sin pasarela de pago integrada.

## Tasks

- [ ] 1. Inicialización y configuración de proyectos
  - [ ] 1.1 Crear proyecto Angular 18+ con componentes standalone
    - Ejecutar `ng new hora-azul-frontend --standalone --routing --style=scss`
    - Instalar y configurar Tailwind CSS con `ng add @angular-tailwind/schematics` o instalación manual
    - Configurar `tailwind.config.js` con la paleta de colores de Hora Azul
    - Verificar que la aplicación levanta con `ng serve`
    - _Requirements: 9.1_

  - [ ] 1.2 Instalar dependencias del frontend
    - Instalar `@angular/forms` para Reactive Forms (incluido en Angular core)
    - Instalar Jest con `jest-preset-angular` como reemplazo de Karma para testing
    - Instalar `fast-check` para property-based testing
    - Configurar `jest.config.js` y `setup-jest.ts`
    - _Requirements: 5.3, 7.1_

  - [ ] 1.3 Crear proyecto Quarkus 3.x con las extensiones necesarias
    - Generar proyecto en `code.quarkus.io` con extensiones: `quarkus-resteasy-reactive-jackson`, `quarkus-hibernate-orm-panache`, `quarkus-jdbc-postgresql`, `quarkus-smallrye-health`, `quarkus-smallrye-openapi`, `quarkus-security`, `quarkus-hibernate-validator`
    - Verificar que el proyecto compila con `mvn compile`
    - _Requirements: 8.1_

  - [ ] 1.4 Configurar base de datos PostgreSQL en Neon
    - Crear proyecto en Neon (`console.neon.tech`) y obtener el connection string
    - Anotar las credenciales para los perfiles `dev` y `prod`
    - _Requirements: 7.1_

  - [ ] 1.5 Configurar `application.properties` de Quarkus con perfiles dev/prod
    - Configurar datasource JDBC apuntando a Neon para el perfil `%prod`
    - Configurar datasource H2 (o Testcontainers) para el perfil `%dev`/`%test`
    - Establecer `quarkus.hibernate-orm.database.generation=update` en prod
    - Establecer límites JVM: `-Xmx512m -Xms128m`
    - Configurar pool de conexiones: `min-size=2`, `max-size=5`, `acquisition-timeout=10s`
    - _Requirements: 8.2_

  - [ ] 1.6 Configurar CORS en Quarkus
    - Habilitar `quarkus.http.cors=true`
    - Establecer `quarkus.http.cors.origins=https://hora-azul.pages.dev` para prod
    - Permitir todos los orígenes en perfil dev para facilitar el desarrollo local
    - _Requirements: 1.2_

- [ ] 2. Backend — Capa de datos y entidades
  - [ ] 2.1 Crear enums Java: `CardCategory`, `ImageType`, `OrderStatus`
    - Definir `CardCategory`: `CUMPLEANOS, FLORES, AMOR, SIN_MENSAJE, MEJORES_DESEOS, AGRADECIMIENTO`
    - Definir `ImageType`: `COVER, OPEN, ENVELOPE`
    - Definir `OrderStatus`: `PENDING_PAYMENT`
    - Crear los tipos ENUM en PostgreSQL con migraciones SQL (o Flyway)
    - _Requirements: 6.1, 2.1_

  - [ ] 2.2 Crear entidad Hibernate Panache: `Tarjeta`
    - Implementar la entidad con todos los campos del DDL de diseño (`id`, `catalogNumber`, `name`, `category`, `price`, `dimensions`, `description3d`, `envelopeIncluded`, `active`, `createdAt`, `updatedAt`)
    - Anotar con `@Entity`, `@Table(name = "tarjeta")`, `@Id @GeneratedValue(strategy = UUID)`
    - Mapear la relación `@OneToMany` con `CardImage`
    - Añadir restricciones `@Check` para `catalog_number BETWEEN 1 AND 33`
    - _Requirements: 6.1, 6.5_

  - [ ] 2.3 Crear entidad Hibernate Panache: `CardImage`
    - Implementar con campos: `id`, `tarjeta`, `url`, `sortOrder`, `imageType`
    - Anotar la FK `@ManyToOne` hacia `Tarjeta`
    - _Requirements: 3.2_

  - [ ] 2.4 Crear entidad Hibernate Panache: `Orden`
    - Implementar con campos: `id`, `orderCode`, `status`, `customerName`, `customerPhone`, `deliveryAddress`, `estimatedDeliveryDate`, `createdAt`
    - Anotar `orderCode` con `@Column(unique = true)`
    - Mapear la relación `@OneToMany` con `OrdenItem`
    - _Requirements: 5.7, 7.1_

  - [ ] 2.5 Crear entidad Hibernate Panache: `OrdenItem`
    - Implementar con campos: `id`, `orden`, `tarjeta`, `catalogNumber`, `cardName`, `unitPrice`, `quantity`
    - Anotar FK `@ManyToOne` hacia `Orden` y `@ManyToOne` (nullable) hacia `Tarjeta`
    - Añadir restricción `@Check` para `quantity BETWEEN 1 AND 99`
    - _Requirements: 7.1_

  - [ ] 2.6 Crear repositorios Panache con métodos de consulta personalizados
    - Crear `TarjetaRepository` con método `findActive(category, minPrice, maxPrice, page, size)`
    - Implementar la consulta con JPQL dinámico o `PanacheQuery` con filtros opcionales
    - Crear `OrdenRepository` con método `findAllOrderedByCreatedAtDesc()`
    - Crear `OrdenRepository.findByOrderCode(String orderCode)`
    - _Requirements: 6.4, 7.2, 7.3_

  - [ ] 2.7 Crear script de datos semilla para las 33 tarjetas del catálogo
    - Crear `src/main/resources/import.sql` (ejecutado automáticamente por Hibernate en perfil dev) con los 33 registros de tarjetas y sus imágenes representativas
    - Incluir al menos una imagen de tipo `COVER` por tarjeta
    - Cubrir todas las 6 categorías con una distribución representativa de precios
    - _Requirements: 1.3, 6.1_

- [ ] 3. Backend — Servicios y endpoints REST
  - [ ] 3.1 Implementar `TarjetaService` con lógica de negocio
    - Método `create(TarjetaCreateRequest)`: validar que `price` ∈ `{15, 17, 20, 30}` → lanzar `InvalidPriceException` si no; verificar unicidad de `catalogNumber` → lanzar `CatalogNumberConflictException` si existe
    - Método `update(UUID id, TarjetaUpdateRequest)`: mismas validaciones de precio; `catalogNumber` es inmutable
    - Método `deactivate(UUID id)`: marcar `active = false`
    - Método `findAll(CardFilters)`: delegar a `TarjetaRepository`
    - Método `findById(UUID id)`: devolver detalle completo incluyendo imágenes
    - _Requirements: 6.1, 6.2, 6.3, 6.6, 6.7, 6.8, 6.9_

  - [ ] 3.2 Implementar `TarjetaResource` — endpoints públicos
    - `GET /api/cards`: mapear query params (`category`, `minPrice`, `maxPrice`, `page`, `size`) al filtro, invocar `TarjetaService.findAll()`, retornar `CardListResponse` paginado
    - `GET /api/cards/{id}`: invocar `TarjetaService.findById()`, retornar `CardDetailResponse`
    - Definir los DTOs `CardSummaryDTO`, `CardDetailDTO`, `CardListResponse` como Java records
    - _Requirements: 1.2, 1.3, 3.2, 6.4, 6.5_

  - [ ] 3.3 Implementar `TarjetaResource` — endpoints de administración con auth básica
    - `POST /api/cards`: `@RolesAllowed("admin")`, invocar `TarjetaService.create()`, retornar 201
    - `PUT /api/cards/{id}`: `@RolesAllowed("admin")`, invocar `TarjetaService.update()`, retornar 200
    - `PATCH /api/cards/{id}/deactivate`: `@RolesAllowed("admin")`, invocar `TarjetaService.deactivate()`, retornar 200
    - Configurar `quarkus.security.users.embedded` con usuario `admin` en `application.properties` para el MVP
    - _Requirements: 6.1, 6.2, 6.3, 6.10_

  - [ ] 3.4 Implementar `OrderCodeGenerator` — generación de código `ORD-YYYY-XXXX`
    - Consultar `MAX(order_code)` filtrando por prefijo `ORD-{YYYY}-` dentro de una transacción `SERIALIZABLE`
    - Incrementar el contador y formatear: `String.format("ORD-%d-%04d", year, nextSeq)`
    - Manejar el caso de primer orden del año (no existe ningún registro previo → secuencia = 1)
    - _Requirements: 5.7_

  - [ ] 3.5 Implementar `OrderService` — creación de orden y cálculo de totales
    - Método `create(OrderRequest)`: resolver cada ítem a su `Tarjeta` por UUID, capturar `catalogNumber`, `name` y `price` en el momento de la orden
    - Calcular `unitPrice × quantity` para cada ítem y el total general
    - Invocar `OrderCodeGenerator` dentro de la misma transacción para obtener el código único
    - Persistir `Orden` + `OrdenItem` en la base de datos
    - Retornar `OrderResponse` con el código generado
    - _Requirements: 5.6, 5.7, 7.1_

  - [ ] 3.6 Implementar `OrderResource` — endpoints REST de órdenes
    - `POST /api/orders`: público, validar body con `@Valid`, invocar `OrderService.create()`, retornar 201
    - `GET /api/orders`: `@RolesAllowed("admin")`, retornar lista de resúmenes ordenada por `createdAt DESC`
    - `GET /api/orders/{orderCode}`: `@RolesAllowed("admin")`, retornar detalle completo o 404
    - Definir DTOs `OrderRequest`, `OrderResponse`, `OrderSummaryDTO`, `OrderItemDTO` como records
    - _Requirements: 5.6, 5.9, 7.1, 7.2, 7.3, 7.4_

  - [ ] 3.7 Implementar `GlobalExceptionMapper` para respuestas de error JSON homogéneas
    - Mapear `ConstraintViolationException` → 422 con lista de errores de campo
    - Mapear `InvalidPriceException` → 422 con mensaje de precios válidos
    - Mapear `CatalogNumberConflictException` → 409
    - Mapear `NotFoundException` (Panache) → 404
    - Mapear `UnauthorizedException` → 401
    - Formato de respuesta: `{ "status", "error", "message", "timestamp" }`
    - _Requirements: 6.6, 6.7, 6.8, 6.9, 6.10_

  - [ ] 3.8 Configurar SmallRye Health
    - Verificar que la extensión `quarkus-smallrye-health` está activa y el endpoint `GET /q/health` responde con el estado de la conexión a la base de datos
    - Deshabilitar la UI de health (`quarkus.smallrye-health.ui.enable=false`) en producción
    - _Requirements: 8.1_

- [ ] 4. Checkpoint backend — Verificar que todos los tests del backend pasan
  - Ejecutar `mvn test` y confirmar que todos los tests pasan. Resolver cualquier fallo antes de continuar.

- [ ] 5. Backend — Tests
  - [ ] 5.1 Tests unitarios: `TarjetaService`
    - Test: crear tarjeta con precio válido → éxito
    - Test: crear tarjeta con precio inválido (p. ej. 25.00) → `InvalidPriceException`
    - Test: crear tarjeta con `catalogNumber` duplicado → `CatalogNumberConflictException`
    - Test: actualizar tarjeta existente sin cambiar `catalogNumber` → éxito
    - _Requirements: 6.6, 6.7_

  - [ ]* 5.2 Tests de propiedad con jqwik: P3 — Rechazo de precios inválidos
    - **Propiedad 3: Para cualquier precio que no pertenezca a {15.00, 17.00, 20.00, 30.00}, el sistema debe rechazar la solicitud con HTTP 422**
    - **Valida: Requirements 6.7**
    - Generar con `@ForAll` precios arbitrarios excluyendo los 4 válidos y verificar que `TarjetaService` lanza `InvalidPriceException`
    - `// Feature: hora-azul-ecommerce, Propiedad 3: Rechazo de precios inválidos`

  - [ ]* 5.3 Tests de propiedad con jqwik: P7 — Unicidad de número de catálogo
    - **Propiedad 7: Para cualquier tarjeta existente con catalogNumber N, intentar crear otra con el mismo N debe ser rechazado con HTTP 409**
    - **Valida: Requirements 6.6**
    - Generar pares de requests con el mismo `catalogNumber` y verificar que el segundo lanza `CatalogNumberConflictException`
    - `// Feature: hora-azul-ecommerce, Propiedad 7: Unicidad de número de catálogo`

  - [ ] 5.4 Tests unitarios: `OrderService` y `OrderCodeGenerator`
    - Test: generar primer código del año → `ORD-2025-0001`
    - Test: generar código cuando ya existen N órdenes del año → `ORD-2025-000(N+1)`
    - Test: cálculo de totales — múltiples ítems con cantidades y precios distintos
    - Test: orden con ítems cuya tarjeta ya no existe → manejo de error adecuado
    - _Requirements: 5.7_

  - [ ]* 5.5 Tests de propiedad con jqwik: P2 — Unicidad de código de orden por año
    - **Propiedad 2: Para cualquier par de órdenes creadas en el mismo año, sus códigos ORD-YYYY-XXXX deben ser distintos**
    - **Valida: Requirements 5.7**
    - Simular N creaciones de orden concurrentes con año mock y verificar ausencia de duplicados
    - `// Feature: hora-azul-ecommerce, Propiedad 2: Unicidad de código de orden por año`

  - [ ] 5.6 Tests de integración: `TarjetaResource` con `@QuarkusTest` + Testcontainers
    - Test: `GET /api/cards` sin filtros → 200 con lista de tarjetas activas
    - Test: `GET /api/cards?category=FLORES&maxPrice=20` → solo tarjetas que cumplen ambos criterios
    - Test: `GET /api/cards/{id}` con UUID válido → 200 con detalle completo
    - Test: `GET /api/cards/{id}` con UUID inexistente → 404
    - Test: `POST /api/cards` sin credenciales → 401
    - Test: `POST /api/cards` con precio inválido → 422
    - Test: `POST /api/cards` con `catalogNumber` duplicado → 409
    - _Requirements: 6.1, 6.4, 6.5, 6.6, 6.7, 6.10_

  - [ ] 5.7 Tests de integración: `OrderResource` con `@QuarkusTest`
    - Test: `POST /api/orders` con datos válidos → 201 con `orderCode` y totales correctos
    - Test: `POST /api/orders` con carrito vacío (`items: []`) → 400
    - Test: `POST /api/orders` con teléfono de formato incorrecto → 422
    - Test: `GET /api/orders/{orderCode}` con código inexistente → 404
    - _Requirements: 5.6, 5.7, 5.9, 7.4_

- [ ] 6. Frontend — Modelos, servicios y configuración
  - [ ] 6.1 Definir interfaces TypeScript y modelos del dominio
    - Crear `card.models.ts`: `CardSummary`, `CardDetail`, `CardImage`, `CardListResponse`, `CardFilters`, `CardCategory`
    - Crear `cart.models.ts`: `CartItem`
    - Crear `order.models.ts`: `OrderRequest`, `OrderRequestItem`, `OrderResponse`, `OrderItem`
    - Exportar todo desde un barrel `models/index.ts`
    - _Requirements: 1.3, 3.2, 4.2, 5.6_

  - [ ] 6.2 Configurar rutas Angular con lazy loading
    - Crear `app.routes.ts` con las 4 rutas definidas en el diseño: `/`, `/tarjeta/:id`, `/checkout`, `/pedido/:orderCode`
    - Usar `loadComponent` en todas las rutas para lazy loading
    - Añadir ruta wildcard `**` que redirige a `/`
    - _Requirements: 3.1, 3.7_

  - [ ] 6.3 Implementar `CardService` con caché en memoria de 5 minutos
    - Inyectar `HttpClient` y configurar la URL base desde `environment.apiUrl`
    - Implementar `signal<{ data: CardSummary[]; cachedAt: number } | null>()` para caché
    - Método `getCards(filters?: CardFilters): Observable<CardSummary[]>` — devuelve caché si `now - cachedAt < 5min`, sino llama `GET /api/cards`
    - Método `getCardById(id: string): Observable<CardDetail>` — siempre llama al backend
    - Método `invalidateCache()` para forzar recarga tras cambios de filtro que requieran datos frescos
    - _Requirements: 1.2, 1.5, 8.3_

  - [ ] 6.4 Implementar `CartService` con `signal()`, `computed()` y persistencia `localStorage`
    - Implementar `_items = signal<CartItem[]>([])` como estado mutable privado
    - Implementar computed signals: `items` (readonly), `totalItems`, `totalAmount`, `isEmpty`
    - Método `addItem(tarjeta: CardDetail)`: agregar o incrementar cantidad (máx 99); rechazar si ya en 99
    - Método `removeItem(tarjetaId: string)`: filtrar ítem
    - Método `updateQuantity(tarjetaId: string, quantity: number)`: si `quantity <= 0` eliminar; si > 99 limitar a 99
    - Método `clearCart()`: vaciar array y eliminar entrada de `localStorage`
    - Métodos `persist()` y `loadFromStorage()` con manejo de excepciones de `localStorage`
    - Invocar `loadFromStorage()` en el constructor
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.7, 4.8, 4.9, 4.11_

  - [ ]* 6.5 Tests de propiedad con fast-check: P1 — Integridad aritmética del carrito
    - **Propiedad 1: Para cualquier estado del carrito, el subtotal de cada ítem = precio × cantidad, y el total = suma de subtotales**
    - **Valida: Requirements 4.2, 4.3, 4.4**
    - Generar arrays arbitrarios de `CartItem` con `fc.array(fc.record(...))` y verificar la aritmética
    - `// Feature: hora-azul-ecommerce, Propiedad 1: Integridad aritmética del carrito`

  - [ ]* 6.6 Tests de propiedad con fast-check: P4 — Round-trip de persistencia del carrito
    - **Propiedad 4: Serializar el carrito a localStorage y deserializarlo debe producir un objeto estructuralmente idéntico**
    - **Valida: Requirements 4.7**
    - Usar `fc.array(fc.record(...))` para generar estados arbitrarios del carrito, llamar `persist()` + `loadFromStorage()` y comparar con `expect(result).toEqual(original)`
    - `// Feature: hora-azul-ecommerce, Propiedad 4: Round-trip de persistencia del carrito`

  - [ ]* 6.7 Tests de propiedad con fast-check: P6 — Eliminación por cantidad cero
    - **Propiedad 6: Para cualquier ítem con cantidad 1, aplicar decremento debe eliminar el ítem (cantidad nunca queda en 0 ni negativo)**
    - **Valida: Requirements 4.5**
    - Generar `CartItem` arbitrario con `quantity = 1`, llamar `updateQuantity(..., 0)` y verificar que el ítem ya no está en `_items()`
    - `// Feature: hora-azul-ecommerce, Propiedad 6: Eliminación por cantidad cero`

  - [ ] 6.8 Implementar `OrderService` frontend
    - Método `createOrder(request: OrderRequest): Observable<OrderResponse>` — `POST /api/orders`
    - Manejo de errores: capturar HTTP errors y relanzar con mensaje descriptivo en español
    - _Requirements: 5.6, 5.9_

  - [ ] 6.9 Implementar `WhatsAppService`
    - Método `buildWhatsAppUrl(order: OrderResponse, deliveryAddress: string): string`
    - El mensaje preformateado debe incluir: código de orden, lista de tarjetas con nombre y cantidad, monto total con formato `S/. XX.00`, y punto de entrega
    - Método `openWhatsApp(url: string): void` — redirige con `window.open(url, '_blank')`
    - Número de WhatsApp configurable desde `environment.whatsappNumber`
    - _Requirements: 5.8_

  - [ ] 6.10 Configurar `environments/` de Angular
    - `environment.ts` (dev): `apiUrl = 'http://localhost:8080'`, `whatsappNumber = '51XXXXXXXXX'`
    - `environment.prod.ts` (prod): `apiUrl = 'https://api.hora-azul.onrender.com'`, número de producción
    - Registrar el reemplazo de archivos en `angular.json`
    - _Requirements: 1.2_

  - [ ] 6.11 Implementar interceptor HTTP para manejo de errores globales
    - Interceptar errores de red (`status === 0`) y de servidor (5xx)
    - Loguear el error en consola para debugging
    - Relanzar el error para que cada servicio/componente pueda manejarlo localmente
    - _Requirements: 1.4, 5.9_

- [ ] 7. Frontend — Componentes UI (shell y catálogo)
  - [ ] 7.1 Implementar `AppComponent` con shell y `NavbarComponent`
    - `AppComponent`: inicializar `CartService.loadFromStorage()`, emitir keep-alive `GET /q/health` en `ngOnInit` de forma silenciosa (ignorar errores), incluir `<router-outlet>` y `<app-cart-drawer>`
    - `NavbarComponent`: logo de Hora Azul, badge con `cartService.totalItems()` como signal (ocultar si es 0), botón para abrir/cerrar `CartDrawer`
    - _Requirements: 4.6, 4.10, 8.2_

  - [ ] 7.2 Implementar `CardItemComponent`
    - Inputs: `card: CardSummary` (signal input)
    - Mostrar: imagen de portada con `alt` descriptivo, nombre, categoría, precio con formato `S/. XX.00`
    - Emitir evento `(cardClick)` al hacer clic para que el contenedor navegue al detalle
    - _Requirements: 1.3, 9.3, 9.5_

  - [ ] 7.3 Implementar `CardGridComponent` con skeleton loading
    - Input: `cards: CardSummary[]`, `loading: boolean`
    - Grid responsivo: 2 columnas en `< 768px`, 4 columnas en `≥ 1024px` con clases Tailwind
    - Mostrar skeleton cards (con `@if (loading)`) mientras se cargan los datos
    - Renderizar `CardItemComponent` por cada tarjeta
    - _Requirements: 1.1, 1.5_

  - [ ] 7.4 Implementar `FilterPanelComponent`
    - Checkboxes de selección múltiple para las 6 categorías (Requirements 2.1)
    - Radio buttons para los 4 rangos de precio, excluyentes (Requirements 2.2)
    - Input de búsqueda de texto que emite evento por cada carácter ingresado (Requirements 2.4)
    - Botón "Limpiar filtros" que resetea todos los controles (Requirements 2.6)
    - Emitir evento `(filtersChange)` con el objeto `CardFilters` actualizado
    - _Requirements: 2.1, 2.2, 2.4, 2.6_

  - [ ] 7.5 Implementar `CatalogPageComponent` — orquestación de catálogo
    - Suscribirse a `CardService.getCards()` y manejar estado de carga y error
    - Aplicar filtros en el frontend (intersección de categoría + precio + texto) mediante una función de filtro pura
    - Mostrar mensaje "No se encontraron tarjetas con ese criterio de búsqueda." cuando no hay resultados con filtros activos (Requirements 2.5)
    - Mostrar mensaje de error con botón "Reintentar" ante fallo del backend (Requirements 1.4)
    - Navegar a `ProductDetailPageComponent` al hacer clic en una tarjeta
    - Preservar el estado de filtros en el router state o query params para el flujo de regreso desde el detalle
    - _Requirements: 1.2, 1.4, 1.6, 2.3, 2.7_

  - [ ]* 7.6 Tests de propiedad con fast-check: P5 — Corrección del filtrado del catálogo
    - **Propiedad 5: Para cualquier combinación de filtros y lista de tarjetas, el resultado no debe contener tarjetas que incumplan algún criterio activo**
    - **Valida: Requirements 2.3, 2.4, 2.7**
    - Extraer la función de filtro pura de `CatalogPageComponent` y testearla con `fc.array(fc.record(...))` y filtros arbitrarios
    - `// Feature: hora-azul-ecommerce, Propiedad 5: Corrección del filtrado del catálogo`

- [ ] 8. Frontend — Componentes UI (detalle y carrito)
  - [ ] 8.1 Implementar `ImageGalleryComponent`
    - Input: `images: CardImage[]`
    - Mostrar imagen activa como principal (≥ 80% del ancho del contenedor)
    - Mostrar miniaturas clicables que cambian la imagen activa
    - Inicializar con la imagen de tipo `COVER` como activa por defecto
    - _Requirements: 3.2, 3.3, 3.4_

  - [ ] 8.2 Implementar `ProductDetailPageComponent`
    - Leer el parámetro `id` de la ruta y llamar `CardService.getCardById(id)`
    - Mostrar todos los campos requeridos: galería, nombre, `catalogNumber`, categoría, precio, dimensiones, `description3d`, indicador de sobre incluido
    - Botón "Agregar al carrito" habilitado si `active = true`; deshabilitado con mensaje de no disponible si `active = false`
    - Botón de regreso que restaura los filtros previos si vino de navegación interna, o navega al catálogo limpio si fue acceso directo por URL (usando `router.getCurrentNavigation()?.extras.state`)
    - Manejar 404: navegar a página de error con mensaje y enlace al catálogo
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9_

  - [ ] 8.3 Implementar `CartItemComponent`
    - Inputs: `item: CartItem`
    - Mostrar nombre, precio unitario, subtotal (`unitPrice × quantity`) con formato `S/. XX.00`
    - Botón de incremento (+): deshabilitar si `quantity >= 99`
    - Botón de decremento (−): invocar `CartService.updateQuantity()` (elimina el ítem si llega a 0)
    - Botón eliminar: invocar `CartService.removeItem()`
    - _Requirements: 4.4, 4.5, 4.11, 9.5_

  - [ ] 8.4 Implementar `CartDrawerComponent`
    - Panel lateral deslizable: abre/cierra sin navegar (controlado por señal en `AppComponent`)
    - Listar `CartService.items()` con `CartItemComponent` por cada ítem
    - Mostrar subtotales y total con `CartService.totalAmount()` formateado como `S/. XX.00`
    - Botón "Confirmar pedido": navegar a `/checkout` si el carrito no está vacío; mostrar mensaje de alerta si está vacío
    - _Requirements: 4.2, 4.3, 4.6, 5.1, 5.2, 9.5_

- [ ] 9. Frontend — Checkout y éxito
  - [ ] 9.1 Implementar `CheckoutPageComponent` con Reactive Forms
    - Crear `FormGroup` con campos: `customerName` (requerido, máx 100), `customerPhone` (requerido, exactamente 9 dígitos numéricos con regex `/^\d{9}$/`), `deliveryAddress` (requerido, máx 200), `estimatedDeliveryDate` (requerido, validator custom: fecha ≥ hoy)
    - Mostrar mensajes de validación inline por campo al tocar o intentar enviar
    - Mostrar mensaje específico de teléfono: "Ingresa un número de teléfono peruano válido de 9 dígitos."
    - Al enviar formulario válido: construir `OrderRequest` con items del carrito e invocar `OrderService.createOrder()`
    - En éxito: invocar `WhatsAppService.openWhatsApp()`, vaciar carrito e navegar a `/pedido/:orderCode`
    - En error: mostrar mensaje descriptivo y preservar los datos del formulario
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.8, 5.9, 5.10_

  - [ ] 9.2 Implementar `OrderSuccessComponent`
    - Leer el parámetro `orderCode` de la ruta
    - Mostrar el código de orden `ORD-YYYY-XXXX` de forma prominente
    - Mostrar instrucciones claras sobre el proceso de coordinación de pago por WhatsApp
    - Botón de regreso al catálogo
    - _Requirements: 5.7_

  - [ ] 9.3 Implementar componente/vista de error 404 para tarjeta no encontrada
    - Mostrar mensaje indicando que la tarjeta no fue encontrada
    - Enlace para volver al catálogo
    - _Requirements: 3.7_

- [ ] 10. Checkpoint frontend — Verificar que todos los tests del frontend pasan
  - Ejecutar `npx jest --runInBand` y confirmar que todos los tests pasan. Resolver cualquier fallo antes de continuar.

- [ ] 11. Frontend — Tests unitarios y de componentes
  - [ ] 11.1 Tests unitarios: `CartService`
    - Test: `addItem` — agrega ítem nuevo con cantidad 1
    - Test: `addItem` — incrementa cantidad de ítem existente
    - Test: `addItem` — rechaza cuando `quantity === 99`
    - Test: `removeItem` — elimina ítem por `tarjetaId`
    - Test: `updateQuantity` — actualiza cantidad correctamente
    - Test: `updateQuantity(id, 0)` — elimina el ítem
    - Test: `persist()` y `loadFromStorage()` — round-trip con `localStorage` mock
    - Test: manejo de `localStorage` no disponible (simular excepción en `setItem`)
    - _Requirements: 4.1, 4.5, 4.7, 4.8_

  - [ ] 11.2 Tests unitarios: `WhatsAppService`
    - Test: el URL generado comienza con `https://wa.me/`
    - Test: el mensaje codificado incluye el `orderCode`
    - Test: el mensaje incluye el monto total con formato `S/. XX.00`
    - Test: el mensaje incluye el punto de entrega
    - _Requirements: 5.8_

  - [ ] 11.3 Tests unitarios: `CheckoutPageComponent`
    - Test: formulario inválido con teléfono de 8 dígitos → muestra mensaje de validación
    - Test: formulario inválido con fecha pasada → muestra error de validación
    - Test: formulario inválido con campo vacío → no invoca `OrderService`
    - Test: formulario válido → invoca `OrderService.createOrder()` con los datos correctos
    - _Requirements: 5.3, 5.4, 5.5_

  - [ ] 11.4 Tests de componente: `FilterPanelComponent`
    - Test: seleccionar una categoría emite `filtersChange` con `category` correcto
    - Test: seleccionar un rango de precio emite `filtersChange` con `maxPrice` correcto
    - Test: ingresar texto emite `filtersChange` con `search` correcto
    - Test: "Limpiar filtros" emite `filtersChange` con todos los valores reseteados
    - _Requirements: 2.1, 2.2, 2.4, 2.6_

  - [ ] 11.5 Tests de componente: `CardGridComponent`
    - Test: con `loading = true` muestra skeleton cards en lugar de tarjetas
    - Test: con `loading = false` y array de cards renderiza el mismo número de `CardItemComponent`
    - Test: con array vacío y `loading = false` no renderiza ítems
    - _Requirements: 1.1, 1.5_

- [ ] 12. Integración y despliegue
  - [ ] 12.1 Conectar frontend con backend y verificar comunicación
    - Confirmar que `environment.apiUrl` apunta al backend local en dev y al desplegado en prod
    - Verificar que `HttpClient` resuelve peticiones correctamente con el interceptor de errores activo
    - Probar manualmente los flujos: cargar catálogo, ver detalle, agregar al carrito
    - _Requirements: 1.2_

  - [ ] 12.2 Implementar keep-alive silencioso en `AppComponent`
    - Llamar `GET /q/health` en `ngOnInit` de forma asíncrona sin bloquear la carga
    - Ignorar cualquier error de la llamada keep-alive (no mostrar al usuario)
    - _Requirements: 8.2_

  - [ ] 12.3 Configurar despliegue en Render o Koyeb
    - Crear `Dockerfile` o configurar build nativo de Quarkus para la plataforma seleccionada
    - Establecer variables de entorno de producción: `QUARKUS_DATASOURCE_JDBC_URL`, `QUARKUS_HTTP_PORT=8080`, `JAVA_OPTS=-Xmx512m -Xms128m`
    - Verificar que el servicio arranca y `GET /q/health` responde 200
    - _Requirements: 8.1, 8.2_

  - [ ] 12.4 Configurar Cloudflare Pages
    - Establecer build command: `ng build --configuration production`
    - Establecer output directory: `dist/hora-azul-frontend/browser`
    - Crear archivo `public/_headers` con reglas de `Cache-Control` para assets estáticos
    - Crear archivo `public/_redirects` con la regla SPA: `/* /index.html 200`
    - _Requirements: 9.1_

  - [ ] 12.5 Verificar conexión Neon PostgreSQL en producción y ejecutar migraciones
    - Confirmar que Quarkus en producción conecta a Neon sin errores en el health check
    - Verificar que el esquema fue creado/actualizado correctamente por Hibernate (`database.generation=update`)
    - Confirmar que los datos semilla de las 33 tarjetas están presentes (o ejecutar `import.sql` manualmente si es necesario)
    - _Requirements: 6.1_

  - [ ] 12.6 Verificar puntuación Lighthouse ≥ 80 en Performance (móvil)
    - Ejecutar Lighthouse en la URL de Cloudflare Pages con configuración de dispositivo móvil
    - Revisar y corregir los principales factores de puntuación si el score es inferior a 80 (lazy loading, tamaño de imágenes, bundle size)
    - _Requirements: 9.4_

- [ ] 13. Checkpoint final — Prueba de humo end-to-end
  - Ejecutar el flujo completo manualmente: cargar catálogo → aplicar filtros → ver detalle de tarjeta → agregar al carrito → abrir drawer → ir a checkout → completar formulario → verificar código de orden y apertura del enlace WhatsApp. Confirmar que todos los requerimientos funcionales se cumplen.

## Notes

- Las sub-tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido; se recomiendan antes de pasar a producción real.
- Cada tarea hace referencia a los requerimientos específicos del archivo `requirements.md` para trazabilidad.
- Los checkpoints aseguran validación incremental y evitan acumular deuda técnica entre fases.
- Los tests de propiedad (fast-check y jqwik) complementan los tests unitarios; no los reemplazan.
- El backend usa autenticación básica embebida para el MVP de administración; escalar a OAuth2/OIDC en versiones futuras.
- Todas las clases Java siguen el patrón Active Record de Panache (`PanacheEntityBase` o `PanacheEntity`) excepto donde se justifique el patrón Repository.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3", "1.4"] },
    { "id": 1, "tasks": ["1.5", "1.6", "2.1", "6.1", "6.10"] },
    { "id": 2, "tasks": ["2.2", "2.3", "2.4", "2.5", "6.2"] },
    { "id": 3, "tasks": ["2.6", "2.7"] },
    { "id": 4, "tasks": ["3.1", "3.4", "6.3", "6.4"] },
    { "id": 5, "tasks": ["3.2", "3.5", "3.7", "3.8", "6.5", "6.6", "6.7", "6.8", "6.9", "6.11"] },
    { "id": 6, "tasks": ["3.3", "3.6", "7.1", "7.2", "7.3", "7.4"] },
    { "id": 7, "tasks": ["5.1", "5.4", "7.5", "8.1"] },
    { "id": 8, "tasks": ["5.2", "5.3", "5.5", "7.6", "8.2", "8.3"] },
    { "id": 9, "tasks": ["5.6", "5.7", "8.4", "9.1"] },
    { "id": 10, "tasks": ["9.2", "9.3", "11.1", "11.2"] },
    { "id": 11, "tasks": ["11.3", "11.4", "11.5"] },
    { "id": 12, "tasks": ["12.1", "12.2", "12.3", "12.4"] },
    { "id": 13, "tasks": ["12.5", "12.6"] }
  ]
}
```
