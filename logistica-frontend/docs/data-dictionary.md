# Data Dictionary — Logística API

## Convenciones

- **Soft delete:** campo `is_active` (boolean, default=True) en todas las tablas excepto `transport` y `shipments`
- **Timestamps:** `created_at` (auto_now_add), `updated_at` (auto_now) en todas las tablas
- **IDs:** BigAutoField auto-incrementales en todas las tablas

---

## auth_user (Django built-in)

| Campo | Tipo | Notas |
|-------|------|-------|
| id | BigAutoField | PK |
| first_name | VARCHAR(150) | |
| last_name | VARCHAR(150) | |
| email | VARCHAR(254) | |
| username | VARCHAR(150) | UNIQUE |
| password | VARCHAR(128) | Hasheada |
| is_active | Boolean | |
| date_joined | DateTime | |
| last_login | DateTime | nullable |

Relacionado con: `Driver` (OneToOne)

---

## customers

| Campo | Tipo | Notas |
|-------|------|-------|
| id | BigAutoField | PK |
| name | CharField(255) | NOT NULL |
| customer_type | CharField(10) | `COMPANY` \| `INDIVIDUAL` |
| tax_id | CharField(50) | UNIQUE, nullable (RUC/NIT) |
| email | CharField(254) | UNIQUE, NOT NULL |
| phone | CharField(20) | NOT NULL |
| address | CharField(500) | NOT NULL |
| city | CharField(100) | NOT NULL |
| country | CharField(100) | default=`Colombia` |
| is_active | BooleanField | default=True |
| created_at | DateTimeField | auto_now_add |
| updated_at | DateTimeField | auto_now |

Relacionado con: `Shipment` (Uno a Muchos)

---

## warehouses

| Campo | Tipo | Notas |
|-------|------|-------|
| id | BigAutoField | PK |
| name | CharField(255) | NOT NULL |
| address | CharField(500) | NOT NULL |
| city | CharField(100) | NOT NULL |
| country | CharField(100) | default=`Colombia` |
| latitude | DecimalField(9,6) | nullable |
| longitude | DecimalField(9,6) | nullable |
| capacity_m3 | DecimalField(10,2) | NOT NULL, capacidad total en m³ |
| is_active | BooleanField | default=True |
| created_at | DateTimeField | auto_now_add |
| updated_at | DateTimeField | auto_now |

Relacionado con: `Product`, `Route` (origin_warehouse), `Shipment` (origin_warehouse)

---

## suppliers

| Campo | Tipo | Notas |
|-------|------|-------|
| id | BigAutoField | PK |
| name | CharField(255) | NOT NULL |
| tax_id | CharField(50) | UNIQUE, nullable |
| contact_name | CharField(255) | NOT NULL |
| email | CharField(254) | NOT NULL |
| phone | CharField(20) | NOT NULL |
| address | CharField(500) | NOT NULL |
| city | CharField(100) | NOT NULL |
| country | CharField(100) | default=`Colombia` |
| is_active | BooleanField | default=True |
| created_at | DateTimeField | auto_now_add |
| updated_at | DateTimeField | auto_now |

Relacionado con: `Product` (Uno a Muchos)

---

## products

| Campo | Tipo | Notas |
|-------|------|-------|
| id | BigAutoField | PK |
| supplier | FK → suppliers | PROTECT, NOT NULL |
| warehouse | FK → warehouses | PROTECT, NOT NULL |
| name | CharField(255) | NOT NULL |
| sku | CharField(100) | UNIQUE, NOT NULL |
| description | TextField | nullable |
| category | CharField(100) | NOT NULL (ej: laptop, celular) |
| weight_kg | DecimalField(8,3) | NOT NULL |
| width_cm | DecimalField(8,2) | NOT NULL |
| height_cm | DecimalField(8,2) | NOT NULL |
| depth_cm | DecimalField(8,2) | NOT NULL |
| unit_price | DecimalField(12,2) | NOT NULL |
| stock_quantity | IntegerField | default=0 |
| is_active | BooleanField | default=True |
| created_at | DateTimeField | auto_now_add |
| updated_at | DateTimeField | auto_now |

Relacionado con: `Supplier` (FK), `Warehouse` (FK), `ShipmentItem` (Uno a Muchos)

---

## transport

| Campo | Tipo | Notas |
|-------|------|-------|
| id | BigAutoField | PK |
| plate_number | CharField(20) | UNIQUE, NOT NULL |
| transport_type | CharField(20) | `TRUCK` \| `VAN` \| `MOTORCYCLE` \| `CARGO_BIKE` |
| brand | CharField(100) | NOT NULL |
| model | CharField(100) | NOT NULL |
| year | IntegerField | NOT NULL |
| capacity_kg | DecimalField(10,2) | NOT NULL |
| capacity_m3 | DecimalField(8,2) | NOT NULL |
| is_available | BooleanField | default=True |
| created_at | DateTimeField | auto_now_add |
| updated_at | DateTimeField | auto_now |

**Nota:** No tiene `is_active` — usa hard delete. Relacionado con: `Driver`, `Shipment`

---

## drivers

| Campo | Tipo | Notas |
|-------|------|-------|
| id | BigAutoField | PK |
| user | OneToOne → auth_user | PROTECT, UNIQUE |
| transport | FK → transport | SET_NULL, nullable |
| license_number | CharField(50) | UNIQUE, NOT NULL |
| license_expiry | DateField | NOT NULL |
| phone | CharField(20) | NOT NULL |
| is_active | BooleanField | default=True |
| created_at | DateTimeField | auto_now_add |
| updated_at | DateTimeField | auto_now |

**Lectura (GET):** incluye `user_full_name`, `user_email`, `user_username` como campos extra.

Relacionado con: `auth_user` (OneToOne), `Transport` (FK), `Shipment` (Uno a Muchos)

---

## routes

| Campo | Tipo | Notas |
|-------|------|-------|
| id | BigAutoField | PK |
| origin_warehouse | FK → warehouses | PROTECT, NOT NULL |
| name | CharField(255) | NOT NULL |
| estimated_duration_hours | DecimalField(6,2) | NOT NULL |
| estimated_distance_km | DecimalField(10,2) | NOT NULL |
| is_active | BooleanField | default=True |
| created_at | DateTimeField | auto_now_add |
| updated_at | DateTimeField | auto_now |

Relacionado con: `Warehouse` (FK), `RouteStop` (Uno a Muchos), `Shipment` (Uno a Muchos)

---

## route_stops

| Campo | Tipo | Notas |
|-------|------|-------|
| id | BigAutoField | PK |
| route | FK → routes | CASCADE, NOT NULL |
| stop_order | IntegerField | NOT NULL (1, 2, 3...) |
| address | CharField(500) | NOT NULL |
| city | CharField(100) | NOT NULL |
| latitude | DecimalField(9,6) | nullable |
| longitude | DecimalField(9,6) | nullable |
| estimated_offset_hours | DecimalField(6,2) | NOT NULL, horas desde inicio |

**Unique:** `(route, stop_order)`

---

## shipments

| Campo | Tipo | Notas |
|-------|------|-------|
| id | BigAutoField | PK |
| tracking_number | CharField(50) | UNIQUE, auto-generado |
| customer | FK → customers | PROTECT, NOT NULL |
| driver | FK → drivers | SET_NULL, nullable |
| transport | FK → transport | SET_NULL, nullable |
| route | FK → routes | SET_NULL, nullable |
| origin_warehouse | FK → warehouses | PROTECT, NOT NULL |
| destination_address | CharField(500) | NOT NULL |
| destination_city | CharField(100) | NOT NULL |
| destination_country | CharField(100) | default=`Colombia` |
| status | CharField(20) | `PENDING` \| `CONFIRMED` \| `IN_TRANSIT` \| `DELIVERED` \| `CANCELLED` \| `RETURNED` |
| estimated_delivery_date | DateField | nullable |
| actual_delivery_date | DateTimeField | nullable |
| weight_total_kg | DecimalField(10,3) | default=0 |
| base_cost | DecimalField(12,2) | default=0 |
| calculated_cost | DecimalField(12,2) | default=0 |
| notes | TextField | nullable |
| created_at | DateTimeField | auto_now_add |
| updated_at | DateTimeField | auto_now |

**Nota:** Hard delete (no `is_active`). `tracking_number` se auto-genera: `uuid4().hex[:12].upper()`.

Relacionado con: `Customer`, `Driver`, `Transport`, `Route`, `Warehouse` (FKs), `ShipmentItem` (Uno a Muchos)

---

## shipment_items

| Campo | Tipo | Notas |
|-------|------|-------|
| id | BigAutoField | PK |
| shipment | FK → shipments | CASCADE, NOT NULL |
| product | FK → products | PROTECT, NOT NULL |
| quantity | IntegerField | NOT NULL |
| unit_price_at_time | DecimalField(12,2) | NOT NULL, precio al momento del envío |
| subtotal | DecimalField(12,2) | NOT NULL, calculado: quantity × unit_price |

**Unique:** `(shipment, product)`

---

## Diagrama de Relaciones

```
auth_user ──OneToOne──► drivers ──FK──► transport
                                            │
customers ◄──FK── shipments ──FK────────────┘
                      │  │
                      │  └──FK──► routes ──FK──► route_stops
                      │          │
                      │       warehouses (origin)
                      │
            shipment_items ──FK──► products ──FK──► suppliers
                                        │
                                     warehouses (storage)
```

## Resumen de Tipos de Delete

| Tabla | Tipo Delete | Campo |
|-------|-------------|-------|
| customers | Soft | `is_active` |
| warehouses | Soft | `is_active` |
| suppliers | Soft | `is_active` |
| products | Soft | `is_active` |
| transport | Hard | — |
| drivers | Soft | `is_active` |
| routes | Soft | `is_active` |
| route_stops | Cascade | (borrado con route) |
| shipments | Hard | — |
| shipment_items | Cascade | (borrado con shipment) |
