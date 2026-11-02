# Configuración de PostgreSQL en Neon

Esta guía explica cómo crear y configurar la base de datos PostgreSQL en Neon para el proyecto Hora Azul E-Commerce.

---

## ¿Qué es Neon?

[Neon](https://neon.tech) es un servicio PostgreSQL serverless con capa gratuita que incluye:
- 0.5 GB de almacenamiento
- Compute que se "duerme" tras 5 minutos de inactividad (cold start ~1–3 s)
- Soporte para múltiples ramas de base de datos (ideal para dev/prod separados)
- Conexión SSL obligatoria

---

## Pasos para crear el proyecto en Neon

### 1. Crear cuenta

1. Ir a [https://console.neon.tech](https://console.neon.tech)
2. Registrarse con cuenta de GitHub, Google o correo electrónico.
3. Verificar el correo si es necesario.

---

### 2. Crear el proyecto

1. En el dashboard de Neon, hacer clic en **"New Project"**.
2. Completar los campos:
   - **Project name**: `hora-azul`
   - **Database name**: `hora_azul_db`
   - **Region**: `AWS US East (N. Virginia)` o la más cercana a Perú disponible (actualmente `AWS South America (São Paulo)` si está disponible, sino `US East`)
   - **PostgreSQL version**: `16` (recomendada)
3. Hacer clic en **"Create project"**.

---

### 3. Obtener el connection string

Una vez creado el proyecto, Neon mostrará la pantalla de conexión:

1. En la sección **"Connection Details"**, seleccionar:
   - **Role**: `[nombre-del-proyecto]` (el rol por defecto generado por Neon)
   - **Database**: `hora_azul_db`
   - **Connection type**: `Connection string`
2. Copiar el string que tiene el formato:

   ```
   postgresql://[user]:[password]@[host].neon.tech/hora_azul_db?sslmode=require
   ```

3. Para JDBC (Quarkus/Java), convertirlo al formato:

   ```
   jdbc:postgresql://[host].neon.tech/hora_azul_db?sslmode=require
   ```

> ⚠️ **Importante**: Guardar el password en este momento. Neon solo lo muestra una vez al crear el proyecto. Si se pierde, se puede regenerar desde **Settings → Roles**.

---

### 4. Crear rama para desarrollo (opcional pero recomendado)

Neon permite crear **branches** de la base de datos, similares a ramas de Git. Se recomienda:

1. En el proyecto, ir a la pestaña **"Branches"**.
2. Hacer clic en **"New Branch"**.
3. Nombrarla `dev`.
4. Obtener el connection string específico de la rama `dev`.

Esto permite tener datos de prueba en `dev` sin afectar `main` (producción).

---

### 5. Variables de entorno necesarias

Completar el archivo `.env` (copiar desde `.env.example`) con los valores obtenidos:

```env
# Producción (rama main de Neon)
QUARKUS_DATASOURCE_JDBC_URL=jdbc:postgresql://[host].neon.tech/hora_azul_db?sslmode=require
QUARKUS_DATASOURCE_USERNAME=[user]
QUARKUS_DATASOURCE_PASSWORD=[password]

# Desarrollo (rama dev de Neon, o usar H2/Testcontainers localmente)
QUARKUS_DATASOURCE_JDBC_URL_DEV=jdbc:postgresql://[host-dev].neon.tech/hora_azul_db?sslmode=require
QUARKUS_DATASOURCE_USERNAME_DEV=[user-dev]
QUARKUS_DATASOURCE_PASSWORD_DEV=[password-dev]
```

---

### 6. Verificar la conexión

Una vez configurado el `.env`, verificar la conexión ejecutando:

```bash
# En la carpeta hora-azul-backend
mvn quarkus:dev
```

Si la conexión es exitosa, el log de Quarkus mostrará algo como:

```
INFO  [io.quarkus] Quarkus started in X.XXXs.
INFO  [io.agroal] Datasource '<default>': pool is started
```

También se puede verificar haciendo:

```bash
curl http://localhost:8080/q/health
```

La respuesta esperada es:
```json
{ "status": "UP", "checks": [{ "name": "Database connections", "status": "UP" }] }
```

---

## Configuración de application.properties

Los valores del connection string deben ir en `application.properties` usando variables de entorno:

```properties
# Perfil de producción
%prod.quarkus.datasource.jdbc.url=${QUARKUS_DATASOURCE_JDBC_URL}
%prod.quarkus.datasource.username=${QUARKUS_DATASOURCE_USERNAME}
%prod.quarkus.datasource.password=${QUARKUS_DATASOURCE_PASSWORD}

# Perfil de desarrollo (usando rama dev de Neon o H2 local)
%dev.quarkus.datasource.jdbc.url=${QUARKUS_DATASOURCE_JDBC_URL_DEV:jdbc:h2:mem:hora_azul_dev;DB_CLOSE_DELAY=-1}
%dev.quarkus.datasource.username=${QUARKUS_DATASOURCE_USERNAME_DEV:sa}
%dev.quarkus.datasource.password=${QUARKUS_DATASOURCE_PASSWORD_DEV:}
```

Esto permite que en `%dev` se use H2 en memoria por defecto si no se configura una base Neon de desarrollo.

---

## Configuración en Render / Koyeb (producción)

Al desplegar el backend en Render o Koyeb, agregar las siguientes variables de entorno en el panel del servicio:

| Variable | Valor |
|---|---|
| `QUARKUS_DATASOURCE_JDBC_URL` | `jdbc:postgresql://[host].neon.tech/hora_azul_db?sslmode=require` |
| `QUARKUS_DATASOURCE_USERNAME` | `[user de Neon]` |
| `QUARKUS_DATASOURCE_PASSWORD` | `[password de Neon]` |
| `QUARKUS_HTTP_PORT` | `8080` |
| `JAVA_OPTS` | `-Xmx512m -Xms128m` |

---

## Consideraciones de seguridad

- **Nunca** incluir el connection string real o credenciales en el código fuente ni en repositorios Git.
- El archivo `.env` está incluido en `.gitignore` para evitar commits accidentales.
- Usar el archivo `.env.example` como plantilla y documentar las variables necesarias sin valores reales.
- Rotar el password de Neon periódicamente desde **Settings → Roles → Reset password**.

---

## Referencia rápida de Neon

| Acción | URL |
|---|---|
| Dashboard | https://console.neon.tech |
| Documentación | https://neon.tech/docs |
| Connection strings | https://neon.tech/docs/connect/connect-from-any-app |
| Límites capa gratuita | https://neon.tech/docs/introduction/plans |
