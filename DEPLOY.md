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

No hace falta crear tablas: Flyway aplica `db/migration/V1__esquema_inicial.sql` y `V2__catalogo_2026.sql` la primera vez que arranca el backend.

## 2. Render (backend)

1. En <https://dashboard.render.com>: **New → Blueprint** y conectar el repositorio de GitHub.
2. Render lee `render.yaml` y pide los valores secretos:

   | Variable | Valor |
   |---|---|
   | `QUARKUS_DATASOURCE_JDBC_URL` | La URL JDBC del paso 1 |
   | `QUARKUS_DATASOURCE_USERNAME` | Usuario de Neon |
   | `QUARKUS_DATASOURCE_PASSWORD` | Contraseña de Neon |

   `ADMIN_PASSWORD` la genera Render (verla en *Environment*); `CORS_ORIGINS` ya viene con `https://hora-azul.pages.dev`.
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
3. Si el dominio asignado no es `https://hora-azul.pages.dev`, añadirlo en Render a `CORS_ORIGINS` (separado por comas).

Las rutas internas (`/tarjeta/…`, `/checkout`) funcionan sin configuración extra: Pages sirve `index.html` cuando no hay `404.html`. `public/_headers` define la caché.

## 4. Comprobación final

- `https://hora-azul.pages.dev` muestra las 33 tarjetas con fotos.
- Un pedido de prueba devuelve un código `ORD-AAAA-NNNN` y abre WhatsApp.
- `GET /api/orders` con `admin` / `ADMIN_PASSWORD` lista el pedido.

## Probar la imagen en local

```bash
docker run -d --name pg -e POSTGRES_DB=horaazul -e POSTGRES_USER=horaazul -e POSTGRES_PASSWORD=secreto -p 5433:5432 postgres:17-alpine
docker build -t hora-azul-api hora-azul-backend
docker run --rm -p 10000:10000 -e PORT=10000 \
  -e QUARKUS_DATASOURCE_JDBC_URL=jdbc:postgresql://host.docker.internal:5433/horaazul \
  -e QUARKUS_DATASOURCE_USERNAME=horaazul -e QUARKUS_DATASOURCE_PASSWORD=secreto \
  -e ADMIN_PASSWORD=otro-secreto hora-azul-api
```
