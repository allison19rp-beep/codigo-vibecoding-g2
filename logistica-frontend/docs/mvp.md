# MVP — Logística Frontend

## Stack

| Herramienta | Versión |
|---|---|
| Next.js | 16.2.6 |
| React | 19.2.4 |
| TypeScript | ^5 |
| Tailwind CSS | v4 |
| shadcn/ui | latest |
| TanStack Query | v5 |
| TanStack Table | v8 |
| Axios | latest |
| Zustand | latest |

## Módulos — Orden de implementación

Cada módulo es un CRUD completo excepto Auth. Se implementa **uno a la vez** siguiendo este orden.

---

### 1. Auth (no es CRUD)
**Dependencias:** ninguna

**Endpoints:**
- `POST /api/v1/auth/token/` — login
- `POST /api/v1/auth/token/refresh/` — refresh token

**Lo que incluye:**
- Página de login
- Store zustand de auth (token, user, login, logout)
- Axios interceptor (adjuntar Bearer token, manejar 401)
- TanStack Query hook para login mutation
- Protección de rutas (redirect a /login si no hay token)
- Layout base con header/sidebar

---

### 2. Customers
**Dependencias:** Auth

**Endpoints:**
- `GET /api/v1/customers/` — listar (paginado, 20/page)
- `POST /api/v1/customers/` — crear
- `GET /api/v1/customers/{id}/` — obtener
- `PUT /api/v1/customers/{id}/` — actualizar
- `PATCH /api/v1/customers/{id}/` — actualizar parcial
- `DELETE /api/v1/customers/{id}/` — soft delete

**Lo que incluye:**
- Página lista con TanStack Table (columnas: name, type, email, city, actions)
- Filtros: customer_type, city, search
- Formulario crear/editar con shadcn (Dialog o página)
- Confirmación de soft delete
- Paginación client-side (o server-side con TanStack Query)

---

### 3. Warehouses
**Dependencias:** Auth

**Endpoints:**
- `GET /api/v1/warehouses/` — listar
- `POST /api/v1/warehouses/` — crear
- `GET /api/v1/warehouses/{id}/` — obtener
- `PUT /api/v1/warehouses/{id}/` — actualizar
- `PATCH /api/v1/warehouses/{id}/` — actualizar parcial
- `DELETE /api/v1/warehouses/{id}/` — soft delete

**Lo que incluye:**
- Página lista con TanStack Table (columnas: name, city, country, capacity, actions)
- Filtros: city, capacity range, search
- Formulario crear/editar
- Confirmación de soft delete

---

### 4. Suppliers
**Dependencias:** Auth

**Endpoints:**
- `GET /api/v1/suppliers/` — listar
- `POST /api/v1/suppliers/` — crear
- `GET /api/v1/suppliers/{id}/` — obtener
- `PUT /api/v1/suppliers/{id}/` — actualizar
- `PATCH /api/v1/suppliers/{id}/` — actualizar parcial
- `DELETE /api/v1/suppliers/{id}/` — soft delete

**Lo que incluye:**
- Página lista con TanStack Table (columnas: name, contact, email, city, actions)
- Filtros: city, search
- Formulario crear/editar
- Confirmación de soft delete

---

### 5. Products
**Dependencias:** Auth, Suppliers, Warehouses

**Endpoints:**
- `GET /api/v1/products/` — listar
- `POST /api/v1/products/` — crear
- `GET /api/v1/products/{id}/` — obtener
- `PUT /api/v1/products/{id}/` — actualizar
- `PATCH /api/v1/products/{id}/` — actualizar parcial
- `DELETE /api/v1/products/{id}/` — soft delete

**Lo que incluye:**
- Página lista con TanStack Table (columnas: name, sku, category, supplier, price, stock, actions)
- Filtros: supplier, warehouse, category, price range, stock range, search
- Formulario crear/editar con selects de supplier y warehouse (cargados via TanStack Query)
- Confirmación de soft delete

---

### 6. Transport
**Dependencias:** Auth

**Endpoints:**
- `GET /api/v1/transport/` — listar
- `POST /api/v1/transport/` — crear
- `GET /api/v1/transport/{id}/` — obtener
- `PUT /api/v1/transport/{id}/` — actualizar
- `PATCH /api/v1/transport/{id}/` — actualizar parcial
- `DELETE /api/v1/transport/{id}/` — hard delete

**Lo que incluye:**
- Página lista con TanStack Table (columnas: plate, type, brand, model, capacity, available, actions)
- Filtros: transport_type, is_available, capacity range, search
- Formulario crear/editar
- Confirmación de hard delete (nota: es hard delete, no soft)

---

### 7. Drivers
**Dependencias:** Auth, Transport

**Endpoints:**
- `GET /api/v1/drivers/` — listar (DriverReadSerializer: incluye user_full_name, user_email)
- `POST /api/v1/drivers/` — crear (DriverSerializer)
- `GET /api/v1/drivers/{id}/` — obtener (DriverReadSerializer)
- `PUT /api/v1/drivers/{id}/` — actualizar (DriverSerializer)
- `PATCH /api/v1/drivers/{id}/` — actualizar parcial (DriverSerializer)
- `DELETE /api/v1/drivers/{id}/` — soft delete

**Lo que incluye:**
- Página lista con TanStack Table (columnas: full_name, email, license, transport, phone, actions)
- Filtros: transport, is_active, search
- Formulario crear/editar con select de transport
- Confirmación de soft delete

---

### 8. Routes
**Dependencias:** Auth, Warehouses

**Endpoints:**
- `GET /api/v1/routes/` — listar
- `POST /api/v1/routes/` — crear
- `GET /api/v1/routes/{id}/` — obtener
- `PUT /api/v1/routes/{id}/` — actualizar
- `PATCH /api/v1/routes/{id}/` — actualizar parcial
- `DELETE /api/v1/routes/{id}/` — soft delete
- `GET /api/v1/routes/{id}/stops/` — listar paradas
- `POST /api/v1/routes/{id}/stops/` — crear parada

**Lo que incluye:**
- Página lista con TanStack Table (columnas: name, origin_warehouse, duration, distance, actions)
- Filtros: origin_warehouse, search
- Formulario crear/editar con select de warehouse
- Gestión de paradas anidadas (sub-tabla o sección expandible)
- Confirmación de soft delete

---

### 9. Shipments
**Dependencias:** Auth, Customers, Drivers, Transport, Routes, Products

**Endpoints:**
- `GET /api/v1/shipments/` — listar
- `POST /api/v1/shipments/` — crear
- `GET /api/v1/shipments/{id}/` — obtener
- `PUT /api/v1/shipments/{id}/` — actualizar
- `PATCH /api/v1/shipments/{id}/` — actualizar parcial
- `DELETE /api/v1/shipments/{id}/` — hard delete
- `GET /api/v1/shipments/{id}/items/` — listar items
- `POST /api/v1/shipments/{id}/items/` — crear item

**Lo que incluye:**
- Página lista con TanStack Table (columnas: tracking, customer, status, driver, origin, destination, actions)
- Filtros: status, customer, driver, warehouse, destination_city, search
- Formulario crear/editar con selects de customer, driver, transport, route, warehouse
- Gestión de items anidados (product, quantity, unit_price)
- Badge de status con colores según estado
- Confirmación de hard delete

---

## Convenciones por módulo

Cada módulo sigue esta estructura de archivos:

```
app/<modulo>/
  page.tsx              → lista con TanStack Table
  [id]/
    page.tsx            → detalle (opcional)
    edit/
      page.tsx          → formulario editar (opcional)
  new/
    page.tsx            → formulario crear (opcional)

hooks/
  use-<modulo>.ts       → hooks TanStack Query (useQuery, useMutation)

components/
  <modulo>-table.tsx    → componente TanStack Table
  <modulo>-form.tsx     → formulario crear/editar con shadcn
```

Para módulos simples se pueden usar Dialogs en lugar de páginas separadas para crear/editar.
