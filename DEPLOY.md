# Despliegue de Hora Azul

| Pieza | Servicio | Qué se despliega |
|---|---|---|
| Base de datos | **Neon** (PostgreSQL) | Esquema y catálogo vía Flyway, automáticamente al arrancar el backend |
| Backend | **Render** (Docker, plan gratuito) | `hora-azul-backend/Dockerfile`, definido en `render.yaml` |
| Frontend | **Cloudflare Pages** | Build de Angular en `hora-azul-frontend/` |

Producción se despliega desde la rama **`main`** (git-flow: `release/*` → `main`).

---

## 1. Neon

1. Crear un proyecto en <https://console.neon.tech>. La región de Render en `render.yaml` debe ser la misma (hoy: *AWS US East 2 (Ohio)* → `region: ohio`).
2. En **Connect**, elegir la base `neondb` y copiar host, usuario y contraseña. Usar el host **sin** `-pooler`: el backend ya tiene su propio pool.
3. Armar la URL JDBC (sin usuario ni contraseña dentro):

   ```
   jdbc:postgresql://<host>/neondb?sslmode=require
   ```

No hace falta crear tablas: Flyway aplica las migraciones de `db/migration/` al arrancar el backend, solo las que aún no estén aplicadas.

## 2. Render (backend)

1. En <https://dashboard.render.com>: **New → Blueprint** y conectar el repositorio de GitHub.
2. Render lee `render.yaml` y pide los valores secretos:

   | Variable | Valor |
   |---|---|
   | `QUARKUS_DATASOURCE_JDBC_URL` | La URL JDBC del paso 1 |
   | `QUARKUS_DATASOURCE_USERNAME` | Usuario de Neon |
   | `QUARKUS_DATASOURCE_PASSWORD` | Contraseña de Neon |

   `ADMIN_PASSWORD` la genera Render (verla en *Environment*); `CORS_ORIGINS` ya viene con `https://hora-azul-e-commerce.pages.dev`.
3. Esperar el primer build (~5–10 min). Comprobar `https://<servicio>.onrender.com/q/health` → `"status": "UP"`.
4. Si la URL del servicio no es `https://hora-azul-api.onrender.com`, actualizar `apiUrl` en `hora-azul-frontend/src/environments/environment.prod.ts`.

> El plan gratuito se duerme tras ~15 min sin tráfico; el primer acceso tarda ~30–60 s. El frontend lo despierta al cargar (`/q/health`).

## 3. Cloudflare Pages (frontend)

1. En <https://dash.cloudflare.com>: **Workers & Pages → Create → Pages → Connect to Git** y elegir el repositorio.
2. Configuración del build:

   | Campo | Valor |
   |---|---|
   | Production branch | `main` |
   | Root directory | `hora-azul-frontend` |
   | Build command | `npx ng build` |
   | Build output directory | `dist/hora-azul-frontend/browser` |

   La versión de Node se toma de `hora-azul-frontend/.node-version`.
3. El dominio de producción es `https://hora-azul-e-commerce.pages.dev` (Cloudflare usa el nombre del repositorio). Si cambia, actualizar `CORS_ORIGINS` en `render.yaml` (varios dominios separados por comas).

Las rutas internas (`/tarjeta/…`, `/checkout`) funcionan sin configuración extra: Pages sirve `index.html` cuando no hay `404.html`. `public/_headers` define la caché.

## 4. Comprobación final

- `https://hora-azul-e-commerce.pages.dev` muestra las 33 tarjetas con fotos.
- Un pedido de prueba devuelve un código `ORD-AAAA-NNNN` y abre WhatsApp.
- En el panel, **Órdenes** muestra el pedido.

## 5. Panel administrativo

**Entrar:** abrir <https://hora-azul-e-commerce.pages.dev/admin> con el usuario `admin` y la contraseña `ADMIN_PASSWORD`. La tienda no enlaza al panel, así que conviene guardar la dirección.

**Ver o cambiar la contraseña:** en <https://dashboard.render.com>, servicio `hora-azul-api` → *Environment* → `ADMIN_PASSWORD`. Al cambiarla, Render reinicia el servicio y las sesiones abiertas vuelven a la pantalla de acceso.

La sesión dura lo que la pestaña: al cerrarla, hay que volver a entrar.

**Añadir fotos a una tarjeta:** el formulario pide la dirección de cada foto, no el archivo. Hay dos formas:

- **Fotos en otro servicio:** pegar la dirección completa, `https://…`. La foto se ve tal cual, sin miniatura, así que conviene que no pese mucho. Si ese servicio la borra, la tarjeta se queda sin foto.
- **Fotos en el repositorio:** añadir a `hora-azul-frontend/public/cards/` estos dos archivos, publicar el cambio con el flujo normal de git-flow y, ya desplegado, pegar `/cards/<número>-<orden>.webp`.

  | Archivo | Uso | Ancho |
  |---|---|---|
  | `<número>-<orden>.webp` | Foto completa, en la ficha | 800 px |
  | `<número>-<orden>-400.webp` | Miniatura, en el catálogo | 400 px |

  Por ejemplo, `34-0.webp` y `34-0-400.webp`. Hacen falta los dos: para una dirección con este formato, el catálogo pide siempre la miniatura.

Si una dirección no carga, el formulario lo avisa, pero deja guardar.

**Fechas:** el backend usa la hora de Lima (`-Duser.timezone=America/Lima` en el `Dockerfile`), y las órdenes guardan la fecha con esa hora.

## Probar la imagen en local

```bash
docker run -d --name pg -e POSTGRES_DB=horaazul -e POSTGRES_USER=horaazul -e POSTGRES_PASSWORD=secreto -p 5433:5432 postgres:17-alpine
docker build -t hora-azul-api hora-azul-backend
docker run --rm -p 10000:10000 -e PORT=10000 \
  -e QUARKUS_DATASOURCE_JDBC_URL=jdbc:postgresql://host.docker.internal:5433/horaazul \
  -e QUARKUS_DATASOURCE_USERNAME=horaazul -e QUARKUS_DATASOURCE_PASSWORD=secreto \
  -e ADMIN_PASSWORD=otro-secreto hora-azul-api
```
