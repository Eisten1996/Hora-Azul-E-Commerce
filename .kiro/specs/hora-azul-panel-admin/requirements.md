# Requirements Document

## Introduction

El panel administrativo de Hora Azul es una sección web privada de la tienda para gestionar el catálogo de tarjetas y dar seguimiento a las órdenes sin usar la API a mano. Hoy el Administrador solo dispone de los endpoints REST de los Requerimientos 6 y 7 del spec base (`hora-azul-ecommerce`), y toda orden se queda en estado `PENDING_PAYMENT`.

La numeración continúa la del spec base (Requerimientos 1 a 9) para que las ramas `feature/REQ-N-*` no se repitan.

**Cambios respecto al spec base:**
- Requerimiento 6: el número de catálogo deja de estar limitado a 33 (criterio 11.5), y una Tarjeta inactiva puede reactivarse (criterio 11.12).
- Requerimiento 7.1: la Orden deja de tener un único estado (criterio 12.4).
- Requerimiento 7.3: el detalle de la Orden incluye los datos de contacto y entrega (criterio 12.3).

**Fuera de alcance en esta fase:**
- Subir archivos de imagen: las fotos se indican por URL (ver "Decisión 1" en `design.md`).
- Varias cuentas de administrador, roles y recuperación de contraseña: sigue habiendo un único usuario `admin`.
- Editar los ítems o los datos del cliente de una Orden, y crear Órdenes desde el panel.
- Precios distintos de S/. 15.00, 17.00, 20.00 y 30.00.
- Estadísticas de ventas e historial de cambios de estado.

---

## Glossary

- **Panel**: Sección de la aplicación Angular bajo la ruta `/admin`, de uso exclusivo del Administrador.
- **Administrador**: Usuario interno de Hora Azul con las credenciales del usuario `admin` del Catálogo_API.
- **Sesión**: Periodo durante el cual el Panel conserva las credenciales validadas del Administrador en la pestaña actual del navegador.
- **Tarjeta activa / inactiva**: Una Tarjeta activa aparece en el catálogo público; una inactiva no aparece y no puede comprarse, pero se conserva en la base de datos.
- **Estado de Orden**: Situación de una Orden. Valores válidos: `PENDING_PAYMENT` (Pendiente de pago), `PAID` (Pagada), `DELIVERED` (Entregada) y `CANCELLED` (Cancelada).
- **Estado final**: `DELIVERED` o `CANCELLED`; una Orden en un Estado final ya no cambia de estado.
- **Catálogo_API**, **Catálogo_UI**, **Orden**, **Tarjeta**, **Categoría**, **Precio**, **Cliente**: Definidos en el spec base.

---

## Requirements

### Requerimiento 10: Acceso y Estructura del Panel

**Historia de Usuario:** Como Administrador, quiero entrar a una sección privada con mi contraseña, para gestionar la tienda sin que los clientes puedan acceder a ella.

#### Criterios de Aceptación

1. WHEN el Administrador envía el formulario de acceso con credenciales válidas, THE Panel SHALL iniciar la Sesión y llevarlo a la página que intentaba abrir o, si no había ninguna, al listado de Órdenes.
2. IF el Administrador envía credenciales inválidas, THEN THE Panel SHALL mostrar el mensaje "Usuario o contraseña incorrectos", conservar el usuario escrito y vaciar la contraseña.
3. IF el Catálogo_API no responde durante el acceso, THEN THE Panel SHALL indicar que el servidor no está disponible y permitir reintentar, sin afirmar que las credenciales son incorrectas.
4. WHILE se espera la respuesta del Catálogo_API, que puede tardar si se está despertando de la capa gratuita, THE Panel SHALL mostrar un indicador de carga en el formulario de acceso y mantener deshabilitado el botón de envío.
5. WHEN un visitante sin Sesión abre cualquier ruta del Panel distinta de `/admin/login`, THE Panel SHALL redirigirlo a `/admin/login` sin mostrar datos administrativos.
6. WHEN el Administrador hace clic en "Cerrar sesión", THE Panel SHALL borrar las credenciales del navegador y mostrar `/admin/login`.
7. THE Panel SHALL conservar la Sesión al recargar la página y SHALL perderla al cerrar la pestaña; nunca SHALL guardar las credenciales en `localStorage`.
8. IF el Catálogo_API responde 401 a una petición del Panel con Sesión iniciada, THEN THE Panel SHALL cerrar la Sesión y redirigir a `/admin/login` con el mensaje "Tu sesión expiró. Vuelve a ingresar.".
9. THE Panel SHALL enviar las credenciales únicamente en las peticiones del Panel al Catálogo_API; las peticiones de la tienda pública y a otros dominios no SHALL incluirlas.
10. THE Panel SHALL mostrar su propia navegación (Órdenes, Tarjetas, Ver tienda y Cerrar sesión) en lugar de la barra, el pie de página y el carrito de la tienda.
11. THE Catálogo_UI SHALL impedir la indexación del Panel: `robots.txt` SHALL excluir `/admin` y la tienda pública no SHALL enlazarlo.
12. THE Catálogo_API SHALL exponer un endpoint que requiera el rol `admin` para validar las credenciales, y SHALL responder 401 sin revelar si falló el usuario o la contraseña.

---

### Requerimiento 11: Gestión del Catálogo desde el Panel

**Historia de Usuario:** Como Administrador, quiero crear, editar, ocultar y volver a publicar tarjetas desde pantallas sencillas, para mantener el catálogo actualizado sin ayuda técnica.

#### Criterios de Aceptación

1. WHEN el Administrador abre la sección Tarjetas, THE Panel SHALL listar todas las Tarjetas, activas e inactivas, ordenadas por número de catálogo, con portada, número, nombre, categorías, precio y estado.
2. THE Panel SHALL permitir filtrar el listado por estado (todas, activas o inactivas) y buscar por nombre o número de catálogo.
3. THE Catálogo_API SHALL exponer un endpoint que requiera el rol `admin` y devuelva las Tarjetas activas e inactivas; el listado público `GET /api/cards` SHALL seguir devolviendo solo las activas.
4. WHEN el Administrador crea una Tarjeta con nombre, número de catálogo, al menos una Categoría y un Precio válido, THE Panel SHALL enviarla al Catálogo_API y, al confirmarse, volver al listado mostrando un mensaje de éxito. THE Panel SHALL proponer como número de catálogo el mayor existente más 1, incluidas las Tarjetas inactivas.
5. THE Catálogo_API SHALL aceptar cualquier número de catálogo entero mayor o igual a 1 que no esté en uso.
6. IF el número de catálogo ya existe, THEN THE Panel SHALL mostrar el error junto a ese campo y conservar el resto del formulario.
7. WHEN el Administrador abre una Tarjeta existente, THE Panel SHALL mostrar sus datos en el mismo formulario, con el número de catálogo en modo de solo lectura, y SHALL guardar los cambios al confirmar.
8. THE Panel SHALL validar antes de enviar: nombre obligatorio de hasta 150 caracteres, al menos una Categoría, Precio entre los valores permitidos, dimensiones de hasta 50 caracteres y descripción 3D de hasta 300 caracteres. Cada error SHALL mostrarse junto a su campo, y el foco SHALL ir al primer campo inválido.
9. THE Panel SHALL permitir indicar hasta 10 imágenes por Tarjeta, cada una con URL y tipo (vista principal, tarjeta abierta o tarjeta cerrada), reordenarlas y ver su vista previa. IF una URL no carga, THEN THE Panel SHALL avisarlo junto a esa imagen sin impedir el guardado.
10. THE Catálogo_API SHALL rechazar con 422 una Tarjeta con más de 10 imágenes (criterio 6.1 del spec base, hoy sin validar en el backend).
11. WHEN el Administrador solicita desactivar una Tarjeta, THE Panel SHALL pedir confirmación indicando que dejará de verse en la tienda y, al confirmarse, SHALL marcarla como inactiva.
12. WHEN el Administrador solicita activar una Tarjeta inactiva, THE Catálogo_API SHALL marcarla como activa y conservar todos sus datos.
13. IF una Orden incluye una Tarjeta inactiva, THEN THE Catálogo_API SHALL rechazarla con 404 y no registrar ninguna parte de la Orden.
14. WHEN un Cliente abre la ficha de una Tarjeta inactiva, THE Catálogo_UI SHALL indicar que no está disponible y deshabilitar "Agregar al carrito".
15. WHEN se edita o desactiva una Tarjeta, THE Catálogo_API SHALL conservar sin cambios el nombre y el precio copiados en las Órdenes ya registradas.
16. IF se abandona un formulario con cambios sin guardar, THEN THE Panel SHALL pedir confirmación antes de descartarlos.

---

### Requerimiento 12: Gestión de Órdenes desde el Panel

**Historia de Usuario:** Como Administrador, quiero ver los pedidos y registrar si ya se pagaron o entregaron, para saber qué falta atender.

#### Criterios de Aceptación

1. WHEN el Administrador abre la sección Órdenes, THE Panel SHALL listar las Órdenes de la más reciente a la más antigua, con código, fecha, cliente, total y estado, con paginación de 20 Órdenes por página.
2. THE Panel SHALL permitir filtrar por Estado de Orden y conservar el filtro y la página en la URL. IF el Catálogo_API recibe un estado inexistente, THEN SHALL responder 400 con un mensaje descriptivo.
3. WHEN el Administrador abre una Orden, THE Panel SHALL mostrar código, fecha, estado, nombre y teléfono del cliente, punto de entrega, fecha estimada de entrega, ítems con cantidad y subtotal, y total.
4. THE Catálogo_API SHALL permitir únicamente estos cambios de estado: `PENDING_PAYMENT` → `PAID`, `PAID` → `DELIVERED`, `PENDING_PAYMENT` → `CANCELLED` y `PAID` → `CANCELLED`.
5. IF se solicita un cambio de estado no permitido, THEN THE Catálogo_API SHALL responder 409 con un mensaje que indique el estado actual y no modificar la Orden.
6. THE Panel SHALL ofrecer en cada Orden solo los cambios permitidos desde su estado actual, y ninguno si está en un Estado final.
7. WHEN el Administrador solicita cancelar una Orden o marcarla como entregada, THE Panel SHALL pedir confirmación indicando que no se podrá deshacer.
8. IF otro dispositivo cambió la Orden y el Catálogo_API responde 409, THEN THE Panel SHALL mostrar el mensaje y recargar la Orden con su estado actual.
9. THE Panel SHALL ofrecer en el detalle un enlace para escribir al cliente por WhatsApp, con su teléfono y el código de la Orden en el mensaje.
10. THE Catálogo_API SHALL seguir creando toda Orden nueva en `PENDING_PAYMENT`, y la respuesta pública de creación no SHALL incluir campos nuevos.
11. THE Catálogo_API SHALL mantener protegidos con el rol `admin` el listado, el detalle y el cambio de estado de las Órdenes.

---

### Requerimiento 13: Calidad del Panel

**Historia de Usuario:** Como Administrador, quiero que el Panel sea cómodo desde el celular y no perjudique a la tienda, para atender pedidos desde cualquier lugar sin afectar a los clientes.

#### Criterios de Aceptación

1. THE Panel SHALL ser funcional desde 375px hasta 1440px de ancho, sin desplazamiento horizontal de la página.
2. THE Panel SHALL ser navegable por teclado, con foco visible, etiquetas asociadas a cada campo y contraste WCAG 2.1 AA, y sus diálogos de confirmación SHALL retener el foco y cerrarse con Escape.
3. THE Panel SHALL usar la identidad visual de la tienda (colores, tipografías y logo) y mostrar los precios con el formato "S/. XX.00".
4. THE Panel SHALL mostrar estados de carga, vacío y error en cada listado y detalle, y permitir reintentar tras un error.
5. THE Panel SHALL cargarse en diferido, sin aumentar el bundle inicial de la tienda en más de 5 kB transferidos, y la portada SHALL mantener Lighthouse móvil ≥ 80 en Performance.
6. WHEN el Administrador guarda una Tarjeta, THE Panel SHALL invalidar la caché de catálogo de su propia pestaña; los demás visitantes SHALL ver el cambio al expirar su caché de 5 minutos.
