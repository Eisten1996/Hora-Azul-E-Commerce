---
inclusion: auto
name: git-flow
description: Reglas de Git Flow para el proyecto Hora Azul E-Commerce. Se activa automáticamente cuando el agente trabaja con git, ramas, commits, pull requests o tareas del spec.
---

# Estrategia de Ramas — Git Flow

## Ramas principales (permanentes)

| Rama | Propósito |
|---|---|
| `main` | Código en producción. Solo recibe merges desde `release/*` y `hotfix/*`. Nunca se hace commit directo. |
| `develop` | Rama de integración. Todas las features se mergen aquí primero. |

## Ramas de soporte (temporales)

### Feature branches
- **Nomenclatura:** `feature/REQ-N-descripcion-corta`  
  Ejemplo: `feature/REQ-1-catalogo-grid`, `feature/REQ-4-carrito-compras`
- **Origen:** `develop`
- **Destino del PR:** `develop`
- **Una rama por requerimiento** del `requirements.md` para que el usuario pueda revisar el PR de cada requerimiento de forma independiente.

### Release branches
- **Nomenclatura:** `release/vX.Y.Z`
- **Origen:** `develop`
- **Destino del PR:** `main` y back-merge a `develop`

### Hotfix branches
- **Nomenclatura:** `hotfix/descripcion-corta`
- **Origen:** `main`
- **Destino del PR:** `main` y back-merge a `develop`

---

## Reglas obligatorias para el agente

1. **Nunca hacer commit directo** a `main` ni a `develop`.
2. **Antes de empezar cualquier tarea** del `tasks.md`:
   - Identificar a qué requerimiento pertenece la tarea (campo `_Requirements:` de la sub-tarea).
   - Crear o cambiar a la rama `feature/REQ-N-descripcion-corta` correspondiente.
   - Si la rama ya existe, hacer `git checkout feature/REQ-N-...` y continuar.
3. **Commits atómicos** por sub-tarea completada. Formato del mensaje de commit:
   ```
   feat(REQ-N): descripcion corta de lo implementado
   ```
   Prefijos: `feat` (nueva funcionalidad), `fix` (corrección), `test` (tests), `chore` (configuración/infra), `docs` (documentación).
4. **Al completar todas las sub-tareas de un requerimiento**:
   - Hacer push de la rama: `git push -u origin feature/REQ-N-...`
   - Abrir un Pull Request hacia `develop` con:
     - **Título:** `feat(REQ-N): [Título del requerimiento]`
     - **Descripción:** lista de sub-tareas implementadas y referencia al requerimiento en `requirements.md`
   - NO mergear el PR; dejarlo abierto para revisión del usuario.
5. **No hacer `git add .` ni `git add -A`**. Añadir únicamente los archivos modificados en la tarea.

---

## Mapa de ramas por requerimiento

| Rama | Requerimiento |
|---|---|
| `feature/REQ-1-catalogo-grid` | Visualización del Catálogo en Cuadrícula |
| `feature/REQ-2-filtros-busqueda` | Filtrado y Búsqueda del Catálogo |
| `feature/REQ-3-detalle-producto` | Detalle de Producto |
| `feature/REQ-4-carrito-compras` | Gestión del Carrito de Compras |
| `feature/REQ-5-checkout-whatsapp` | Proceso de Checkout |
| `feature/REQ-6-admin-catalogo-api` | Gestión del Catálogo por el Administrador |
| `feature/REQ-7-persistencia-ordenes` | Persistencia y Consulta de Órdenes |
| `feature/REQ-8-rendimiento` | Rendimiento y Disponibilidad |
| `feature/REQ-9-accesibilidad` | Experiencia de Usuario y Accesibilidad |

---

## Diagrama de flujo

```
main ──────────────────────────────────────────────► producción
  └─ develop ─────────────────────────────────────► integración
        ├─ feature/REQ-1-catalogo-grid ──► PR → develop
        ├─ feature/REQ-2-filtros-busqueda ──► PR → develop
        ├─ feature/REQ-3-detalle-producto ──► PR → develop
        ├─ feature/REQ-4-carrito-compras ──► PR → develop
        ├─ feature/REQ-5-checkout-whatsapp ──► PR → develop
        ├─ feature/REQ-6-admin-catalogo-api ──► PR → develop
        ├─ feature/REQ-7-persistencia-ordenes ──► PR → develop
        ├─ feature/REQ-8-rendimiento ──► PR → develop
        └─ feature/REQ-9-accesibilidad ──► PR → develop
```
