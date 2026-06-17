# Spec: Routes

## Requisitos

- Página lista con TanStack Table (columnas: name, origin_warehouse, estimated_duration_hours, estimated_distance_km, actions)
- Filtros: search (debounce 300ms), origin_warehouse (Select que carga warehouses via `useWarehouseList`)
- Formulario crear/editar con shadcn Dialog
- Gestión anidada de paradas (route_stops) dentro del formulario:
  - Sub-sección con tabla de paradas actuales (stop_order, address, city, estimated_offset_hours)
  - Botón "Agregar parada" que añade fila a la tabla (datos pendientes de guardar)
  - Las paradas se crean via `POST /routes/{id}/stops/` después de crear la ruta
- Confirmación de soft delete antes de ejecutar DELETE
- Paginación server-side con TanStack Query (20 items por página)
- TanStack Table con column headers, sorting client-side, y paginación integrada
- Estados: loading (skeleton), empty (mensaje "No se encontraron rutas"), error (toast sonner)

## API Endpoints

| Método | Path | Descripción | Query Params |
|--------|------|-------------|-------------|
| GET | `/routes/` | Listar (paginado) | `page`, `search`, `origin_warehouse`, `ordering` |
| POST | `/routes/` | Crear | — |
| GET | `/routes/{id}/` | Obtener por ID | — |
| PUT | `/routes/{id}/` | Actualizar completo | — |
| PATCH | `/routes/{id}/` | Actualizar parcial | — |
| DELETE | `/routes/{id}/` | Soft delete | — |
| GET | `/routes/{id}/stops/` | Listar paradas de la ruta | — |
| POST | `/routes/{id}/stops/` | Crear parada en la ruta | — |

**Base URL:** `http://localhost:8000/api/v1/` (ya configurado en `lib/axios.ts`)

**Respuesta paginada (GET list):**
```json
{
  "count": 128,
  "next": "http://.../?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "origin_warehouse": 1,
      "origin_warehouse_name": "Bodega Central",
      "name": "Ruta Norte",
      "estimated_duration_hours": "4.50",
      "estimated_distance_km": "120.00",
      "is_active": true,
      "created_at": "2026-01-01T00:00:00Z",
      "updated_at": "2026-01-01T00:00:00Z"
    }
  ]
}
```

**Nota:** La respuesta incluye `origin_warehouse_name` (o `origin_warehouse_detail`) para mostrar el nombre del warehouse en la tabla.

**Filtros disponibles:**
- `?origin_warehouse=1` — exacto por ID de warehouse
- `?search=termino` — búsqueda textual en name
- `?ordering=name|-estimated_duration_hours` — ordenamiento
- `?page=1` — número de página

### `POST /routes/{id}/stops/`

```json
// Request
{ "stop_order": 1, "address": "string", "city": "string",
  "latitude": "9.999999", "longitude": "-9.999999",
  "estimated_offset_hours": "0.00" }
```

El campo `route` se asigna automáticamente desde la URL.

### `GET /routes/{id}/stops/`

```json
// Response 200
[
  {
    "id": 1,
    "route": 1,
    "stop_order": 1,
    "address": "Calle 123",
    "city": "Bogotá",
    "latitude": "4.711000",
    "longitude": "-74.072000",
    "estimated_offset_hours": "0.00"
  }
]
```

## Modelos

### routes

| Campo | Tipo | TypeScript | Notas |
|-------|------|------------|-------|
| id | BigAutoField | `number` | PK |
| origin_warehouse | FK → warehouses | `number` (ID) | PROTECT, NOT NULL |
| name | CharField(255) | `string` | NOT NULL |
| estimated_duration_hours | DecimalField(6,2) | `string` | NOT NULL |
| estimated_distance_km | DecimalField(10,2) | `string` | NOT NULL |
| is_active | BooleanField | `boolean` | default=True, soft delete |
| created_at | DateTimeField | `string` (ISO) | auto_now_add |
| updated_at | DateTimeField | `string` (ISO) | auto_now |

### route_stops

| Campo | Tipo | TypeScript | Notas |
|-------|------|------------|-------|
| id | BigAutoField | `number` | PK |
| route | FK → routes | `number` | CASCADE, NOT NULL |
| stop_order | IntegerField | `number` | NOT NULL (1, 2, 3...) |
| address | CharField(500) | `string` | NOT NULL |
| city | CharField(100) | `string` | NOT NULL |
| latitude | DecimalField(9,6) | `string \| null` | nullable |
| longitude | DecimalField(9,6) | `string \| null` | nullable |
| estimated_offset_hours | DecimalField(6,2) | `string` | NOT NULL, horas desde inicio |

**Unique:** `(route, stop_order)`

## Tipos TypeScript

```typescript
// types/routes.ts

interface Route {
  id: number
  origin_warehouse: number
  origin_warehouse_name: string
  name: string
  estimated_duration_hours: string
  estimated_distance_km: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface RouteFormData {
  name: string
  origin_warehouse: number
  estimated_duration_hours: string
  estimated_distance_km: string
}

interface RouteStop {
  id: number
  route: number
  stop_order: number
  address: string
  city: string
  latitude: string | null
  longitude: string | null
  estimated_offset_hours: string
}

interface RouteStopFormData {
  stop_order: number
  address: string
  city: string
  latitude?: string
  longitude?: string
  estimated_offset_hours: string
}

interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

interface RoutesFilters {
  page: number
  search?: string
  origin_warehouse?: number | ""
  ordering?: string
}
```

## Estructura de archivos

```
app/routes/
  page.tsx              → lista con TanStack Table + filtros

hooks/
  use-routes.ts         → TanStack Query hooks (useRoutes, useRoute, useCreateRoute, useUpdateRoute, useDeleteRoute, useRouteStops, useCreateRouteStop)

components/
  routes-table.tsx      → TanStack Table component
  routes-form.tsx       → Dialog con formulario crear/editar + sub-sección paradas
  routes-delete-dialog.tsx → Confirmación soft delete (shadcn AlertDialog)
```

## Componentes

### `app/routes/page.tsx`

- Server component wrapper o directamente `"use client"` con toda la page
- Estado local para filtros: `origin_warehouse`, `search`, `page`
- Renderiza filtros en un toolbar horizontal:
  - Select para `origin_warehouse` — shadcn `<Select>` que carga opciones via `useWarehouseList()` hook (TanStack Query). Opción inicial "Todos los almacenes"
  - Input para `search` — shadcn `<Input>` con placeholder "Buscar ruta..."
  - Debounce en search (300ms) para no disparar requests en cada tecla
- Pasa `filters` a `useRoutes(filters)` hook
- Renderiza `<RoutesTable>` con data + página actual + total páginas
- Botón "Nueva ruta" que abre `<RoutesForm>` en modo creación
- Al crear/editar/eliminar con éxito, invalida query de lista con `queryClient.invalidateQueries({ queryKey: ["routes"] })`

### `components/routes-table.tsx`

- `"use client"`
- Recibe: `data: Route[]`, `totalPages: number`, `page: number`, `onPageChange: (page: number) => void`, `onEdit: (route: Route) => void`, `onDelete: (route: Route) => void`
- Crea instancia de TanStack Table con `useReactTable`:
  - **Columnas:**
    - `name` — nombre de la ruta
    - `origin_warehouse` — nombre del warehouse de origen (`origin_warehouse_name`)
    - `estimated_duration_hours` — duración estimada (horas)
    - `estimated_distance_km` — distancia estimada (km)
    - `actions` — botones editar (lápiz) y eliminar (basurero) con iconos de lucide-react
  - `manualPagination: true` (server-side), `pageCount: totalPages`
  - Sorting client-side (no envía al backend)
- Usa shadcn `<Table>`, `<TableHeader>`, `<TableBody>`, `<TableRow>`, `<TableCell>`
- Paginación con botones "Anterior"/"Siguiente" en el footer
- Estado vacío: mostrar mensaje "No se encontraron rutas" centrado
- Estado carga: mostrar `<Skeleton>` rows (5 filas de esqueleto)

### `components/routes-form.tsx`

- `"use client"`
- shadcn `<Dialog>` modal para crear/editar
- Props: `open: boolean`, `onOpenChange: (open: boolean) => void`, `route?: Route | null` (null = crear, Route = editar), `warehouses: Warehouse[]` (lista completa para selects)
- Título dinámico: "Nueva ruta" / "Editar ruta"
- **Sección 1 — Datos de la ruta:**
  - `name` — Input required
  - `origin_warehouse` — Select required, carga opciones desde prop `warehouses` (obtenidas via `useWarehouseList()` en page.tsx). Muestra `warehouse.name` como label, value = `warehouse.id`
  - `estimated_duration_hours` — Input type="number" step="0.01" required
  - `estimated_distance_km` — Input type="number" step="0.01" required
- **Sección 2 — Paradas (solo visible en modo edición, o después de crear la ruta):**
  - Tabla con columnas: `stop_order`, `address`, `city`, `estimated_offset_hours`, `actions` (eliminar parada)
  - Botón "Agregar parada" que añade una fila vacía a la tabla local (no persistida aún)
  - Inputs inline en la tabla para address, city, estimated_offset_hours, latitude, longitude
  - Al guardar cada parada: `POST /routes/{routeId}/stops/` con los datos de la fila
  - Si el backend soporta envío inline de paradas al crear/editar la ruta, se envían juntas; de lo contrario se crean después de que la ruta existe
  - **Orden:** Crear ruta primero → si éxito → abrir sub-sección de paradas → crear paradas una a una via mutation
- Botones: Cancelar + Guardar
- Validación client-side: todos los required marcados con `required`
- Al editar, pre-poblar el formulario con los datos de la ruta
- Al editar, cargar paradas existentes via `useRouteStops(route.id)` y mostrarlas en la tabla
- Estado carga en botón Guardar: disabled + spinner mientras muta
- Al guardar éxito: cerrar Dialog + toast.success("Ruta creada/actualizada correctamente")
- Al guardar error: toast.error con mensaje del backend
- Si hay error de validación del backend (400), mostrar errores debajo de cada campo

### `components/routes-delete-dialog.tsx`

- `"use client"`
- shadcn `<AlertDialog>` (puede usarse Dialog con variante de confirmación)
- Props: `open: boolean`, `onOpenChange: (open: boolean) => void`, `route: Route`, `onConfirm: () => void`
- Mensaje: "¿Estás seguro de desactivar la ruta {route.name}?" con texto explicativo: "Esta acción desactivará la ruta. No se eliminarán sus datos."
- Botones: Cancelar + "Desactivar" (variant="destructive")
- Estado carga en botón Desactivar mientras muta
- Al confirmar con éxito: toast.success("Ruta desactivada correctamente")

## Hooks/Queries

Todos en `hooks/use-routes.ts`:

### `useRoutes(filters: RoutesFilters)`
- `useQuery` con queryKey: `["routes", filters]`
- `queryFn`: `api.get("/routes/", { params: filters })` → `data: PaginatedResponse<Route>`
- Retorna `{ data, isLoading, isError, error }`

### `useRoute(id: number | null)`
- `useQuery` con queryKey: `["routes", id]`
- `enabled: !!id`
- `queryFn`: `api.get(\`/routes/${id}/\`)` → `data: Route`

### `useCreateRoute()`
- `useMutation`
- `mutationFn`: `(formData: RouteFormData) => api.post("/routes/", formData)`
- `onSuccess`: invalida `["routes"]` query
- Retorna `{ mutate, isPending, error, data }` (data contiene la ruta creada, útil para obtener el ID y crear paradas)

### `useUpdateRoute()`
- `useMutation`
- `mutationFn`: `({ id, data }: { id: number; data: Partial<RouteFormData> }) => api.patch(\`/routes/${id}/\`, data)`
- Usar PATCH (partial update)
- `onSuccess`: invalida `["routes"]` query

### `useDeleteRoute()`
- `useMutation`
- `mutationFn`: `(id: number) => api.delete(\`/routes/${id}/\`)`
- Soft delete: el backend setea `is_active = false`
- `onSuccess`: invalida `["routes"]` query
- Retorna `{ mutate, isPending, error }`

### `useRouteStops(routeId: number | null)`
- `useQuery` con queryKey: `["route-stops", routeId]`
- `enabled: !!routeId`
- `queryFn`: `api.get(\`/routes/${routeId}/stops/\`)` → `data: RouteStop[]`

### `useCreateRouteStop(routeId: number)`
- `useMutation`
- `mutationFn`: `(formData: RouteStopFormData) => api.post(\`/routes/${routeId}/stops/\`, formData)`
- `onSuccess`: invalida `["route-stops", routeId]` query
- Retorna `{ mutate, isPending, error }`

### `useWarehouseList()` (importado o compartido desde hooks/use-warehouses.ts)
- `useQuery` con queryKey fijo: `["warehouses", "all"]` (o sin filtros de paginación, todos los activos)
- `queryFn`: `api.get("/warehouses/", { params: { is_active: true, page_size: 100 } })` → `data: PaginatedResponse<Warehouse>`
- Retorna `{ data, isLoading, isError, error }`
- Se usa en el toolbar de filtros y en el Select de origin_warehouse del formulario

## Estados de UI

| Estado | Componente | Comportamiento |
|--------|------------|----------------|
| Loading (lista) | routes-table | 5 filas de Skeleton |
| Empty (lista) | routes-table | Mensaje "No se encontraron rutas" |
| Error (lista) | routes-table | Toast sonner con error |
| Loading (form save) | routes-form | Botón Guardar disabled + spinner |
| Error (form save) | routes-form | Toast con mensaje error + errores inline |
| Success (form save) | routes-form → close | Toast "Ruta creada/actualizada" + refetch lista |
| Loading (delete) | routes-delete-dialog | Botón Desactivar disabled + spinner |
| Success (delete) | routes-delete-dialog → close | Toast "Ruta desactivada" + refetch lista |
| Debounce (search) | page | 300ms delay antes de disparar query |
| Loading (stops) | routes-form sub-sección | Spinner en tabla de paradas |
| Success (stop created) | routes-form | Refetch paradas + actualizar tabla |

## Dependencias

- Auth (layout protegido, axios interceptor con Bearer token)
- Warehouses (hook `useWarehouseList` para cargar lista de almacenes en filtros y formulario)
- shadcn/ui components ya instalados: button, input, label, select, dialog, table, skeleton, sonner
- TanStack Query v5 (ya instalado)
- TanStack Table v8 (ya instalado)
- lucide-react (ya instalado) — iconos: Pencil, Trash2, Plus, ChevronLeft, ChevronRight, Search, Loader2
- No requiere nuevas dependencias npm

## Tareas

- [x] Crear `types/routes.ts` — interfaces Route, RouteFormData, RouteStop, RouteStopFormData, PaginatedResponse, RoutesFilters
- [x] Crear `hooks/use-routes.ts` — hooks: useRoutes, useRoute, useCreateRoute, useUpdateRoute, useDeleteRoute, useRouteStops, useCreateRouteStop
- [x] Crear `components/routes-table.tsx` — TanStack Table con columnas, skeletons, paginación, estados
- [x] Crear `components/routes-form.tsx` — shadcn Dialog con formulario crear/editar (pendiente: sub-sección paradas)
- [x] Crear `components/routes-delete-dialog.tsx` — shadcn AlertDialog con confirmación
- [x] Crear `app/routes/page.tsx` — página con filtros (search + warehouse Select) + toolbar + RoutesTable
- [x] Wire up: mutations invalidan queryKey "routes" en onSuccess
- [x] Verificar build con `npm run build`
