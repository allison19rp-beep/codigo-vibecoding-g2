# Arquitectura Frontend — Logística API

## Stack Frontend Propuesto

| Capa          | Tecnología                          |
|---------------|-------------------------------------|
| Framework     | React 19 + TypeScript 6             |
| Bundler       | Vite 8                              |
| Estilos       | Tailwind CSS v4                     |
| HTTP          | axios                               |
| Routing       | react-router-dom                    |
| Auth          | JWT (access + refresh en localStorage) |

## Comunicación con Backend

```
Frontend (Vite :5173)
  └─ axios → http://localhost:8000/api/v1/
       └─ Django 6 + DRF 3.17 (back :8000)
            └─ SQLite / PostgreSQL
```

- Todas las rutas bajo `/api/v1/`
- JWT requerido en todos los endpoints (excepto `/auth/token/` y `/auth/token/refresh/`)
- Enviar token como `Authorization: Bearer <access_token>`
- Refresh token: `POST /api/v1/auth/token/refresh/`

## Patrones del Backend

### Soft Delete
La mayoría de módulos usan soft delete con campo `is_active`:
- `GET` retorna solo `is_active=True`
- `DELETE` setea `is_active=False` (no borra el registro)
- **Excepciones:** Transport y Shipments usan hard delete

### Paginación
- `PageNumberPagination`, 20 items por página
- Navegar con `?page=2`

### Filtros
- **Exactos:** `?campo=valor` (ej: `?status=PENDING`, `?customer=5`)
- **Rango:** `?campo_gte=100&campo_lte=500` (en campos que lo soporten)
- **Búsqueda:** `?search=<termino>` (busca en múltiples campos)
- **Orden:** `?ordering=field` o `?ordering=-field`

### Dual Serializer Pattern (Drivers)
- `GET` usa `DriverReadSerializer` (incluye `user_full_name`, `user_email`, `user_username`)
- `POST/PUT/PATCH` usa `DriverSerializer` (solo campos del modelo)

### Nested Resources
- Rutas hijas accesibles via `/{parent}/{id}/{child}/`:
  - `/api/v1/routes/{id}/stops/` (GET lista, POST crea)
  - `/api/v1/shipments/{id}/items/` (GET lista, POST crea)

## Flujo de Autenticación

1. **Login:** `POST /api/v1/auth/token/` → recibe `{ access, refresh }`
2. **Almacenar:** guardar ambos en `localStorage`
3. **Interceptor axios:** adjuntar `Authorization: Bearer <access>` a cada request
4. **Refresh:** si el access expira (401), usar refresh token para obtener uno nuevo
5. **Logout:** limpiar `localStorage`, redirigir a `/login`

## Estados de Shipment (para UI)

`PENDING` → `CONFIRMED` → `IN_TRANSIT` → `DELIVERED`
                                   ↘ `CANCELLED` → `RETURNED`
