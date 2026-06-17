# CLAUDE.md — Vibe Coding G2

## Repo Structure

```
codigo-vibecoding-g2/
├── logistica-api/           # Django 6 + DRF 3.17 API (backend activo, :8000)
├── logistica-api_old/       # Deprecado (no tocar)
├── task-manager-backend/    # Express + Prisma + PostgreSQL (:3000)
├── task-manager-frontend/   # React 19 + Vite + Tailwind v4 (:5173)
├── logistica-frontend/      # Frontend para logistica-api (work in progress)
├── logistica-frontend/docs/ # Documentación del backend logistica-api
├── clase-01..04/            # Notas de clase — NO MODIFICAR
└── clase-sdd/               # Notas SDD — NO MODIFICAR
```

---

## logistica-api (backend activo)

| | |
|---|---|
| Runtime | Python 3 + Django 6.0.5 |
| API | DRF 3.17.1 + SimpleJWT (JWT requerido por defecto) |
| DB | SQLite dev (`config/settings/development.py`), PostgreSQL ready |
| Docs | Swagger en `http://localhost:8000/api/v1/docs/` |
| Puerto | `8000` |

### Activar venv primero
```bash
# Windows
.venv\Scripts\Activate.ps1
# Unix
source .venv/bin/activate
```

### Comandos
```bash
python manage.py makemigrations    # AI permitido
python manage.py migrate           # AI permitido
python manage.py test              # AI permitido
python manage.py test <app>        # app individual
python manage.py runserver         # MANUAL SOLO
```

### 8 Módulos + Auth

| App | Endpoints | Modelos |
|-----|-----------|---------|
| `authentication` | `POST /auth/token/`, `/auth/token/refresh/` | — (SimpleJWT) |
| `customers` | CRUD `/customers/` | Customer |
| `warehouses` | CRUD `/warehouses/` | Warehouse |
| `suppliers` | CRUD `/suppliers/` | Supplier |
| `products` | CRUD `/products/` | Product (FK → supplier, warehouse) |
| `transport` | CRUD `/transport/` | Transport |
| `drivers` | CRUD `/drivers/` | Driver (OneToOne → auth_user, FK → transport) |
| `routes` | CRUD `/routes/` + `/routes/{id}/stops/` | Route, RouteStop |
| `shipments` | CRUD `/shipments/` + `/shipments/{id}/items/` | Shipment, ShipmentItem |

**Todas las rutas bajo** `/api/v1/`. Ver `docs/endpoints.md` para referencia completa de 54 endpoints.

### Patrones clave
- **Soft delete** con `is_active` (excepciones: transport, shipments = hard delete)
- **Paginación:** PageNumberPagination, 20/page
- **Nested resources:** `/routes/{id}/stops/`, `/shipments/{id}/items/`
- **Dual serializer en drivers:** DriverReadSerializer para GET, DriverSerializer para POST/PUT/PATCH
- **Tracking number** auto-generado en shipments (`uuid4().hex[:12].upper()`)

### Documentación de referencia (leer antes de codear)
- `logistica-frontend/docs/architecture.md` — arquitectura frontend-backend
- `logistica-frontend/docs/endpoints.md` — todos los endpoints con request/response
- `logistica-frontend/docs/data-dictionary.md` — modelos, campos, tipos, relaciones

---

## logistica-frontend (proyecto actual)

Frontend para logistica-api. Mismas herramientas que task-manager-frontend: React 19 + TypeScript 6 + Vite 8 + Tailwind v4.

### Convenciones
- Servicios axios en `src/services/` (un archivo por módulo)
- Tipos TypeScript en `src/types/` (un archivo por módulo, alineado con `docs/data-dictionary.md`)
- Páginas en `src/pages/`, componentes en `src/components/`
- JWT en `localStorage("access_token")` y `localStorage("refresh_token")`
- Enviar `Authorization: Bearer` en interceptor axios
- 401 → intentar refresh; si falla, redirigir a `/login`

### Comandos frontend
```bash
npm run lint    # AI permitido
npm run build   # AI permitido (tsc -b + vite build)
npm run dev     # MANUAL SOLO
```

---

## task-manager-backend

| | |
|---|---|
| Runtime | Node.js ESM |
| ORM | Prisma 7 + PostgreSQL |
| Auth | bcrypt + JWT (Bearer) |
| Puerto | `3000` |

**Comandos AI:** `npx prisma migrate dev --name <name>`, `npx prisma studio`
**No editar** `src/generated/prisma/` (autogenerado). Editar `prisma/schema.prisma`.

---

## task-manager-frontend

| | |
|---|---|
| Stack | React 19 + TypeScript 6 + Vite 8 |
| Estilos | Tailwind v4 (plugin Vite, sin config file) |

**JWT** almacenado en `localStorage("token")`, enviado via interceptor axios.
**401** → limpia token, redirige a `/login`.

---

## Reglas generales

- **No ejecutar dev servers** (`npm run dev`, `python manage.py runserver`) — manual
- **No modificar** `clase-*/` — son notas de referencia
- `logistica-api_old/` tiene `requirements.tx` (intencional, no `.txt`) — deprecado, no desarrollar ahí
