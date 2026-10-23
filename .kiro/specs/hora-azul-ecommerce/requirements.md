# Requirements Document

## Introduction

"Hora Azul E-Commerce" es una plataforma de venta en línea para la tienda Hora Azul, especializada en tarjetas pop-up 3D de diseño artesanal con corte láser. La plataforma permite a los clientes explorar el catálogo completo de 33 tarjetas, filtrar por categoría y precio, agregar productos al carrito y cerrar la venta mediante un flujo de checkout que genera un código de orden y abre un enlace de WhatsApp preformateado para coordinar el pago y la entrega en Lima/Callao.

El MVP no incluye módulo de dedicatorias personalizadas ni pasarela de pago en línea; el pago se coordina directamente por WhatsApp.

**Stack tecnológico:**
- Frontend: Angular 18+ (Standalone Components, Signals, Reactive Forms, Tailwind CSS) desplegado en Cloudflare Pages.
- Backend: Java 21 con Quarkus 3.x (Quarkus REST / RESTEasy Reactive, Hibernate ORM con Panache) desplegado en Render o Koyeb (capa gratuita, bajo consumo de RAM).
- Base de datos: PostgreSQL en Neon (capa gratuita).

---

## Glossary

- **Catálogo**: Colección completa de tarjetas pop-up 3D disponibles para la venta.
- **Tarjeta**: Producto físico pop-up 3D con corte láser, identificado por un número de catálogo (1 al 33) y un nombre comercial.
- **Categoría**: Clasificación temática de una tarjeta. Valores válidos: Cumpleaños, Flores, Amor, Sin Mensaje Predefinido, Mejores Deseos, Agradecimiento.
- **Precio**: Valor en Soles peruanos (S/.).
- **Carrito**: Colección temporal de ítems seleccionados por el cliente antes de confirmar la compra.
- **Ítem_Carrito**: Un par (Tarjeta, cantidad) dentro del Carrito.
- **Checkout**: Proceso de recopilación de datos del cliente y confirmación de la orden.
- **Orden**: Registro persistido de una solicitud de compra, identificado por un código único con formato ORD-YYYY-XXXX.
- **Cliente**: Usuario final que navega el catálogo y realiza compras.
- **Administrador**: Usuario interno de Hora Azul con acceso al panel de gestión del catálogo.
- **Catálogo_API**: Servicio backend Quarkus que expone los endpoints REST del catálogo y las órdenes.
- **Catálogo_UI**: Aplicación Angular que presenta el catálogo al Cliente.
- **Carrito_Service**: Servicio Angular que gestiona el estado del Carrito y su persistencia en localStorage.
- **Checkout_Service**: Servicio Angular que valida el formulario y envía la Orden al Catálogo_API.
- **WhatsApp_Helper**: Utilidad Angular que construye el enlace `wa.me` con el mensaje preformateado.

---

## Requirements

### Requerimiento 1: Visualización del Catálogo en Cuadrícula

**Historia de Usuario:** Como Cliente, quiero ver todas las tarjetas disponibles en una cuadrícula visual, para poder explorar el catálogo de forma rápida y atractiva.

#### Criterios de Aceptación

1. WHEN la página del catálogo carga, THE Catálogo_UI SHALL mostrar todas las Tarjetas activas en una cuadrícula de mínimo 2 columnas en viewports de hasta 768px de ancho y de mínimo 4 columnas en viewports de 1024px de ancho o más.
2. WHEN la página del catálogo carga, THE Catálogo_UI SHALL solicitar al Catálogo_API la lista de Tarjetas activas y renderizarla en un plazo máximo de 3 segundos, medido en un entorno con latencia de red menor a 100ms y ancho de banda mayor a 10 Mbps.
3. WHEN la página del catálogo carga y el Catálogo_API devuelve al menos una Tarjeta activa, THE Catálogo_UI SHALL mostrar por cada Tarjeta en la cuadrícula: la imagen principal, el nombre comercial, la categoría y el precio en Soles (S/.).
4. IF el Catálogo_API devuelve un error al cargar el catálogo, THEN THE Catálogo_UI SHALL mostrar un mensaje de error indicando que el catálogo no pudo cargarse y un botón de "Reintentar" que vuelva a ejecutar la solicitud al Catálogo_API.
5. WHILE el Catálogo_API está respondiendo, THE Catálogo_UI SHALL mostrar un indicador de carga (skeleton cards o spinner) en lugar de las tarjetas.
6. IF el Catálogo_API responde exitosamente pero no devuelve Tarjetas activas, THEN THE Catálogo_UI SHALL mostrar un mensaje indicando que no hay tarjetas disponibles en lugar de la cuadrícula.

---

### Requerimiento 2: Filtrado y Búsqueda del Catálogo

**Historia de Usuario:** Como Cliente, quiero filtrar las tarjetas por categoría y rango de precio, y buscar por texto, para encontrar rápidamente la tarjeta que me interesa.

#### Criterios de Aceptación

1. THE Catálogo_UI SHALL ofrecer filtros de selección múltiple por Categoría con las opciones: Cumpleaños, Flores, Amor, Sin Mensaje Predefinido, Mejores Deseos y Agradecimiento, de modo que el Cliente pueda seleccionar una o más categorías simultáneamente.
2. THE Catálogo_UI SHALL ofrecer filtros por Precio con los siguientes rangos excluyentes: precio ≤ S/. 15.00, precio ≤ S/. 17.00, precio ≤ S/. 20.00, precio ≥ S/. 30.00; los límites de precio son inclusivos.
3. WHEN el Cliente selecciona uno o más filtros, THE Catálogo_UI SHALL actualizar la cuadrícula mostrando únicamente las Tarjetas que cumplan todos los filtros activos.
4. WHEN el Cliente ingresa al menos 1 carácter en el buscador, THE Catálogo_UI SHALL filtrar automáticamente por cada carácter ingresado las Tarjetas cuyo nombre comercial o descripción contengan el texto ingresado, sin distinguir mayúsculas de minúsculas ni acentos.
5. IF el Cliente ingresa texto en el buscador y no existe ninguna Tarjeta que coincida con los criterios activos, THEN THE Catálogo_UI SHALL mostrar el mensaje "No se encontraron tarjetas con ese criterio de búsqueda." y mantener visibles los controles de filtro.
6. WHEN el Cliente activa el botón "Limpiar filtros", THE Catálogo_UI SHALL deseleccionar todos los filtros de categoría y precio, limpiar el texto del buscador y mostrar nuevamente la cuadrícula completa de Tarjetas activas.
7. WHEN el Cliente combina filtros de categoría, rango de precio y texto de búsqueda simultáneamente, THE Catálogo_UI SHALL aplicar todos los criterios de forma conjunta (intersección).

---

### Requerimiento 3: Detalle de Producto

**Historia de Usuario:** Como Cliente, quiero ver la ficha completa de una tarjeta, para tomar una decisión de compra informada.

#### Criterios de Aceptación

1. WHEN el Cliente hace clic en una Tarjeta de la cuadrícula, THE Catálogo_UI SHALL navegar a la página de detalle de esa Tarjeta.
2. WHEN la página de detalle de una Tarjeta carga correctamente, THE Catálogo_UI SHALL mostrar: galería de imágenes (portada, tarjeta desplegada, sobre), nombre comercial, número de catálogo, categoría, precio, dimensiones en centímetros (ancho × alto), descripción del efecto 3D/pop-up de entre 10 y 300 caracteres, e indicador de sobre incluido.
3. WHEN la página de detalle de una Tarjeta carga correctamente, THE Catálogo_UI SHALL mostrar la imagen de portada como imagen activa inicial en la galería.
4. WHEN el Cliente selecciona una imagen de la galería, THE Catálogo_UI SHALL mostrar esa imagen como imagen activa ocupando al menos el 80% del ancho del contenedor principal, sin abandonar la página de detalle.
5. WHEN la página de detalle de una Tarjeta con stock disponible carga correctamente, THE Catálogo_UI SHALL mostrar el botón "Agregar al carrito" en estado habilitado.
6. IF la Tarjeta mostrada tiene stock igual a cero, THEN THE Catálogo_UI SHALL mostrar el botón "Agregar al carrito" en estado deshabilitado con una indicación de no disponible.
7. IF la Tarjeta solicitada en la URL no existe en el Catálogo_API, THEN THE Catálogo_UI SHALL mostrar una página de error con mensaje indicando que la Tarjeta no fue encontrada y un enlace para volver al catálogo.
8. WHEN la página de detalle carga desde una navegación previa del catálogo con filtros activos, THE Catálogo_UI SHALL mostrar un control de regreso al catálogo que al activarse restaura exactamente los mismos filtros y página activos antes de entrar al detalle.
9. IF la página de detalle carga desde acceso directo por URL sin sesión de navegación previa, THEN THE Catálogo_UI SHALL mostrar un control de regreso que al activarse navega al catálogo sin filtros aplicados.

---

### Requerimiento 4: Gestión del Carrito de Compras

**Historia de Usuario:** Como Cliente, quiero agregar tarjetas a mi carrito, ajustar cantidades y ver el total, para revisar mi pedido antes de comprar.

#### Criterios de Aceptación

1. WHEN el Cliente hace clic en "Agregar al carrito" y la Tarjeta seleccionada tiene stock disponible mayor a 0, THE Carrito_Service SHALL agregar la Tarjeta al Carrito con cantidad 1 si no existe, o incrementar en 1 la cantidad si ya existe, hasta un máximo de 99 unidades por Ítem_Carrito.
2. THE Carrito_Service SHALL calcular el subtotal de cada Ítem_Carrito como el producto del precio unitario de la Tarjeta por la cantidad, expresado en Soles (S/.) con dos decimales.
3. THE Carrito_Service SHALL calcular el total del Carrito como la suma de los subtotales de todos los Ítems_Carrito, expresado en Soles (S/.) con dos decimales.
4. WHEN el Cliente incrementa o decrementa la cantidad de un Ítem_Carrito, THE Carrito_Service SHALL actualizar el subtotal del ítem y el total del Carrito en un tiempo máximo de 300 ms.
5. WHEN la cantidad de un Ítem_Carrito llega a 0 mediante el botón de decremento, THE Carrito_Service SHALL eliminar ese ítem del Carrito.
6. WHEN el Cliente hace clic en el ícono del carrito o en el botón de cierre del panel, THE Catálogo_UI SHALL abrir o cerrar el panel lateral del Carrito sin redirigir al Cliente a otra página.
7. WHEN el estado del Carrito cambia, IF el localStorage del navegador está disponible, THEN THE Carrito_Service SHALL persistir el estado actualizado del Carrito en localStorage, de modo que al recargar la página el Carrito conserve los ítems previamente agregados.
8. IF el localStorage no está disponible o su cuota está excedida al intentar persistir, THEN THE Carrito_Service SHALL mantener el estado del Carrito en memoria durante la sesión activa y mostrar al Cliente un mensaje indicando que el carrito no se guardará al cerrar el navegador.
9. WHEN el Cliente vacía el Carrito o elimina todos los ítems, THE Carrito_Service SHALL eliminar la entrada correspondiente del Carrito en localStorage.
10. IF el Carrito contiene al menos 1 ítem, THEN THE Catálogo_UI SHALL mostrar un badge numérico sobre el ícono del carrito en la barra de navegación con el total de ítems del Carrito; si el Carrito está vacío, THE Catálogo_UI SHALL ocultar el badge.
11. IF el Cliente intenta agregar una Tarjeta al Carrito y no hay stock disponible o la cantidad en el Carrito ya alcanzó el máximo de 99 unidades, THEN THE Carrito_Service SHALL rechazar la acción y mostrar al Cliente un mensaje indicando el motivo por el que no se puede agregar la Tarjeta.

---

### Requerimiento 5: Proceso de Checkout

**Historia de Usuario:** Como Cliente, quiero completar mis datos de entrega y confirmar mi pedido, para recibir un código de orden y coordinar el pago por WhatsApp.

#### Criterios de Aceptación

1. WHEN el Cliente hace clic en "Confirmar pedido" desde el Carrito y el Carrito contiene al menos un Ítem_Carrito, THE Catálogo_UI SHALL navegar al formulario de Checkout.
2. IF el Cliente hace clic en "Confirmar pedido" y el Carrito está vacío, THEN THE Catálogo_UI SHALL mostrar un mensaje indicando que debe agregar al menos una Tarjeta antes de proceder y no navegar al formulario de Checkout.
3. THE Catálogo_UI SHALL presentar en el formulario de Checkout los campos: Nombre completo (obligatorio, máximo 100 caracteres), Teléfono (obligatorio, exactamente 9 dígitos numéricos, formato peruano), Dirección o Punto de Entrega en Lima/Callao (obligatorio, máximo 200 caracteres) y Fecha estimada de entrega (obligatorio, debe ser igual o posterior a la fecha actual).
4. IF el Cliente intenta confirmar el Checkout sin completar todos los campos obligatorios, THEN THE Catálogo_UI SHALL mostrar mensajes de validación por campo y mantener el formulario abierto sin enviar la solicitud al Catálogo_API.
5. IF el Cliente ingresa un número de teléfono con formato incorrecto, THEN THE Catálogo_UI SHALL mostrar el mensaje "Ingresa un número de teléfono peruano válido de 9 dígitos."
6. WHEN el Cliente confirma el Checkout con todos los campos válidos, THE Checkout_Service SHALL enviar al Catálogo_API la Orden con los datos del Cliente y la lista de Ítems_Carrito.
7. WHEN el Catálogo_API recibe una solicitud de creación de Orden válida, THE Catálogo_API SHALL persistir la Orden en la base de datos con estado "PENDING_PAYMENT" y generar un código único con el formato ORD-YYYY-XXXX donde YYYY es el año actual y XXXX es un número secuencial de 4 dígitos con ceros a la izquierda.
8. WHEN el Catálogo_API responde con éxito a la creación de la Orden, THE Checkout_Service SHALL invocar al WhatsApp_Helper para abrir automáticamente en el navegador el enlace `https://wa.me/<número_tienda>` con un mensaje preformateado que incluya: el código de Orden, la lista de Tarjetas con nombre y cantidad, el monto total en Soles con dos decimales (ejemplo: S/. 120.50) y el punto de entrega indicado.
9. IF el Catálogo_API devuelve un error al crear la Orden, THEN THE Checkout_Service SHALL mostrar al Cliente un mensaje de error descriptivo y permitir reintentar el envío sin perder los datos del formulario.
10. WHEN la Orden es creada exitosamente, THE Carrito_Service SHALL vaciar el Carrito y limpiar su entrada en localStorage.

---

### Requerimiento 6: Gestión del Catálogo por el Administrador (Backend)

**Historia de Usuario:** Como Administrador, quiero gestionar las tarjetas del catálogo a través de la API, para mantener actualizado el inventario y la información de cada producto.

#### Criterios de Aceptación

1. WHEN THE Catálogo_API recibe una solicitud de creación de Tarjeta con todos los atributos obligatorios (nombre comercial, número de catálogo, categoría y precio) y los atributos opcionales presentes (dimensiones, descripción del efecto 3D, detalle del sobre incluido y URLs de imágenes, con un máximo de 10 URLs por Tarjeta), THE Catálogo_API SHALL crear la Tarjeta con estado activo y devolver los datos de la Tarjeta creada, incluyendo su identificador único generado.
2. WHEN THE Catálogo_API recibe una solicitud de actualización de una Tarjeta existente, THE Catálogo_API SHALL actualizar únicamente los atributos modificables (nombre comercial, categoría, precio, dimensiones, descripción del efecto 3D, detalle del sobre incluido y URLs de imágenes) y devolver los datos actualizados de la Tarjeta; el número de catálogo no podrá ser modificado mediante este endpoint.
3. WHEN THE Catálogo_API recibe una solicitud de baja lógica de una Tarjeta existente, THE Catálogo_API SHALL marcar la Tarjeta como inactiva sin eliminarla físicamente de la base de datos y confirmar la operación en la respuesta.
4. WHEN THE Catálogo_API recibe una solicitud de consulta de la lista de Tarjetas, THE Catálogo_API SHALL devolver únicamente las Tarjetas con estado activo, permitiendo filtrar por categoría y por rango de precio mediante parámetros de consulta, con un máximo de 100 Tarjetas por respuesta.
5. WHEN THE Catálogo_API recibe una solicitud de consulta del detalle de una Tarjeta por su identificador único, THE Catálogo_API SHALL devolver todos los atributos de la Tarjeta independientemente de su estado (activo o inactivo).
6. IF se envía al Catálogo_API una solicitud de creación de Tarjeta con un número de catálogo ya existente, THEN THE Catálogo_API SHALL rechazar la solicitud con el código HTTP 409 y un mensaje descriptivo del conflicto.
7. IF se envía al Catálogo_API una solicitud con un precio fuera de los valores válidos (S/. 15.00, S/. 17.00, S/. 20.00, S/. 30.00), THEN THE Catálogo_API SHALL rechazar la solicitud con el código HTTP 422 y un mensaje que indique los valores permitidos.
8. IF se envía al Catálogo_API una solicitud de creación de Tarjeta con uno o más atributos obligatorios ausentes, THEN THE Catálogo_API SHALL rechazar la solicitud con el código HTTP 422 y un mensaje que identifique los atributos faltantes.
9. IF se envía al Catálogo_API una solicitud de consulta, actualización o baja lógica de una Tarjeta con un identificador único que no existe en la base de datos, THEN THE Catálogo_API SHALL rechazar la solicitud con el código HTTP 404 y un mensaje indicando que la Tarjeta no fue encontrada.
10. IF THE Catálogo_API recibe una solicitud de creación, actualización o baja lógica de Tarjeta sin credenciales de administrador válidas, THEN THE Catálogo_API SHALL rechazar la solicitud con el código HTTP 401 y no realizar ningún cambio en la base de datos.

---

### Requerimiento 7: Persistencia y Consulta de Órdenes

**Historia de Usuario:** Como Administrador, quiero consultar las órdenes generadas, para hacer seguimiento de los pedidos pendientes de pago y entrega.

#### Criterios de Aceptación

1. THE Catálogo_API SHALL persistir cada Orden con los siguientes datos: código de orden, fecha y hora de creación, nombre del cliente, teléfono, dirección de entrega, fecha estimada de entrega, estado ("PENDING_PAYMENT") y lista de ítems (número de catálogo de la Tarjeta, nombre, precio unitario y cantidad).
2. THE Catálogo_API SHALL exponer un endpoint REST para consultar todas las Órdenes ordenadas por fecha de creación descendente.
3. THE Catálogo_API SHALL exponer un endpoint REST para consultar el detalle de una Orden por su código único.
4. IF se solicita al Catálogo_API el detalle de una Orden con un código que no existe, THEN THE Catálogo_API SHALL responder con el código HTTP 404 y un mensaje descriptivo.

---

### Requerimiento 8: Rendimiento y Disponibilidad

**Historia de Usuario:** Como Cliente, quiero que la plataforma responda de forma fluida incluso desde los primeros accesos del día, para no tener que esperar tiempos de arranque prolongados.

#### Criterios de Aceptación

1. THE Catálogo_API SHALL exponer un endpoint `/q/health` que responda con estado HTTP 200 y el estado de salud del servicio.
2. WHEN el Catálogo_API recibe la primera solicitud tras un período de inactividad en la capa gratuita, THE Catálogo_API SHALL responder en un plazo máximo de 30 segundos.
3. THE Catálogo_UI SHALL implementar caché en memoria de la lista de Tarjetas activas con una duración máxima de 5 minutos, para reducir las solicitudes al Catálogo_API en sesiones de navegación continua.
4. THE Catálogo_UI SHALL alcanzar una puntuación de al menos 80 en la categoría Performance de Lighthouse en dispositivos móviles.

---

### Requerimiento 9: Experiencia de Usuario y Accesibilidad

**Historia de Usuario:** Como Cliente, quiero navegar la plataforma desde cualquier dispositivo y acceder a ella con tecnologías de asistencia, para tener una experiencia de compra inclusiva.

#### Criterios de Aceptación

1. THE Catálogo_UI SHALL ser completamente responsiva y funcional en resoluciones desde 375px de ancho (móvil) hasta 1440px (escritorio).
2. THE Catálogo_UI SHALL cumplir con los criterios de contraste de color WCAG 2.1 nivel AA para todo el texto visible.
3. THE Catálogo_UI SHALL asignar atributos `alt` descriptivos a todas las imágenes de Tarjetas.
4. THE Catálogo_UI SHALL ser navegable mediante teclado en los flujos principales: explorar catálogo, abrir detalle, agregar al carrito y completar checkout.
5. THE Catálogo_UI SHALL mostrar el precio de cada Tarjeta con el formato "S/. XX.00" en todos los puntos de la interfaz donde aparezca un valor monetario.
