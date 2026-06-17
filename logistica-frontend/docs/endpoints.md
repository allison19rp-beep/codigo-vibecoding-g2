# API Endpoints — Logística API

Base URL: `http://localhost:8000/api/v1/`

Auth requerido en todos excepto donde se indica. Enviar: `Authorization: Bearer <access_token>`

---

## Auth (2 endpoints, públicos)

### `POST /auth/token/`
Login — obtener par JWT.
```json
// Request
{ "username": "string", "password": "string" }
// Response 200
{ "access": "string (JWT)", "refresh": "string (JWT)" }
```

### `POST /auth/token/refresh/`
Refrescar access token.
```json
// Request
{ "refresh": "string (JWT)" }
// Response 200
{ "access": "string (JWT)" }
```

---

## Customers (6 endpoints)

| Método | Path | Descripción |
|--------|------|-------------|
| GET | `/customers/` | Listar (paginado, 20/page) |
| POST | `/customers/` | Crear |
| GET | `/customers/{id}/` | Obtener |
| PUT | `/customers/{id}/` | Actualizar completo |
| PATCH | `/customers/{id}/` | Actualizar parcial |
| DELETE | `/customers/{id}/` | Soft delete |

**Filtros:** `?customer_type=COMPANY|INDIVIDUAL`, `?city=`, `?country=`, `?search=`, `?ordering=name|-created_at`

---

## Warehouses (6 endpoints)

| Método | Path | Descripción |
|--------|------|-------------|
| GET | `/warehouses/` | Listar |
| POST | `/warehouses/` | Crear |
| GET | `/warehouses/{id}/` | Obtener |
| PUT | `/warehouses/{id}/` | Actualizar |
| PATCH | `/warehouses/{id}/` | Actualizar parcial |
| DELETE | `/warehouses/{id}/` | Soft delete |

**Filtros:** `?city=`, `?country=`, `?capacity_m3_gte=`, `?capacity_m3_lte=`, `?search=`

---

## Suppliers (6 endpoints)

| Método | Path | Descripción |
|--------|------|-------------|
| GET | `/suppliers/` | Listar |
| POST | `/suppliers/` | Crear |
| GET | `/suppliers/{id}/` | Obtener |
| PUT | `/suppliers/{id}/` | Actualizar |
| PATCH | `/suppliers/{id}/` | Actualizar parcial |
| DELETE | `/suppliers/{id}/` | Soft delete |

**Filtros:** `?city=`, `?country=`, `?search=`, `?ordering=name|-created_at`

---

## Products (6 endpoints)

| Método | Path | Descripción |
|--------|------|-------------|
| GET | `/products/` | Listar |
| POST | `/products/` | Crear |
| GET | `/products/{id}/` | Obtener |
| PUT | `/products/{id}/` | Actualizar |
| PATCH | `/products/{id}/` | Actualizar parcial |
| DELETE | `/products/{id}/` | Soft delete |

**Filtros:** `?supplier=`, `?warehouse=`, `?category=`, `?unit_price_gte=`, `?unit_price_lte=`, `?stock_quantity_gte=`, `?search=`

---

## Transport (6 endpoints)

| Método | Path | Descripción |
|--------|------|-------------|
| GET | `/transport/` | Listar |
| POST | `/transport/` | Crear |
| GET | `/transport/{id}/` | Obtener |
| PUT | `/transport/{id}/` | Actualizar |
| PATCH | `/transport/{id}/` | Actualizar parcial |
| DELETE | `/transport/{id}/` | Hard delete (no soft delete) |

**Filtros:** `?transport_type=TRUCK|VAN|MOTORCYCLE|CARGO_BIKE`, `?is_available=true|false`, `?capacity_kg_gte=`, `?capacity_m3_gte=`, `?search=`

---

## Drivers (6 endpoints)

| Método | Path | Descripción | Serializer |
|--------|------|-------------|------------|
| GET | `/drivers/` | Listar | DriverReadSerializer |
| POST | `/drivers/` | Crear | DriverSerializer |
| GET | `/drivers/{id}/` | Obtener | DriverReadSerializer |
| PUT | `/drivers/{id}/` | Actualizar | DriverSerializer |
| PATCH | `/drivers/{id}/` | Actualizar parcial | DriverSerializer |
| DELETE | `/drivers/{id}/` | Soft delete | — |

**DriverReadSerializer** incluye campos extra: `user_full_name`, `user_email`, `user_username`.

**Filtros:** `?transport=`, `?is_active=`, `?search=`

---

## Routes (8 endpoints)

| Método | Path | Descripción |
|--------|------|-------------|
| GET | `/routes/` | Listar |
| POST | `/routes/` | Crear |
| GET | `/routes/{id}/` | Obtener |
| PUT | `/routes/{id}/` | Actualizar |
| PATCH | `/routes/{id}/` | Actualizar parcial |
| DELETE | `/routes/{id}/` | Soft delete |
| GET | `/routes/{id}/stops/` | Listar paradas de la ruta |
| POST | `/routes/{id}/stops/` | Crear parada en la ruta |

**Filtros:** `?origin_warehouse=`, `?search=`, `?ordering=name|estimated_duration_hours`

### `POST /routes/{id}/stops/`
```json
{ "stop_order": 1, "address": "string", "city": "string",
  "latitude": "9.999999", "longitude": "-9.999999",
  "estimated_offset_hours": "0.00" }
```
El campo `route` se asigna automáticamente desde la URL.

---

## Shipments (8 endpoints)

| Método | Path | Descripción |
|--------|------|-------------|
| GET | `/shipments/` | Listar |
| POST | `/shipments/` | Crear |
| GET | `/shipments/{id}/` | Obtener |
| PUT | `/shipments/{id}/` | Actualizar |
| PATCH | `/shipments/{id}/` | Actualizar parcial |
| DELETE | `/shipments/{id}/` | Hard delete (no soft delete) |
| GET | `/shipments/{id}/items/` | Listar items del envío |
| POST | `/shipments/{id}/items/` | Crear item en el envío |

**Filtros:** `?status=PENDING|CONFIRMED|IN_TRANSIT|DELIVERED|CANCELLED|RETURNED`, `?customer=`, `?driver=`, `?origin_warehouse=`, `?destination_city=`, `?search=`

### `POST /shipments/{id}/items/`
```json
{ "product": 1, "quantity": 5, "unit_price_at_time": "1500.00" }
```
`subtotal` se calcula automáticamente (`quantity * unit_price_at_time`). `shipment` se asigna desde la URL.

---

## Documentación (2 endpoints, públicos)

| Método | Path | Descripción |
|--------|------|-------------|
| GET | `/schema/` | OpenAPI schema (JSON) |
| GET | `/docs/` | Swagger UI |
