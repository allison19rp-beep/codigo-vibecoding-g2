# Spec: Drivers

## Requisitos

- Página lista con TanStack Table (columnas: full_name, license_number, phone, email, is_active, actions)
- Filtros: search (debounce 300ms), is_active (Select: Sí/No/Todos)
- Formulario crear/editar con shadcn Dialog
- Confirmación de DELETE antes de eliminar (DELETE real, no soft delete)
- Paginación server-side con TanStack Query (20 items por página)
- TanStack Table con column headers, sorting client-side, y paginación integrada
- Estados: loading (skeleton), empty (mensaje "No se encontraron conductores"), error (toast sonner)

## API Endpoints

| Método | Path | Descripción | Query Params |
|--------|------|-------------|-------------|
| GET | `/drivers/` | Listar (paginado) | `page`, `search`, `is_active`, `transport` |
| POST | `/drivers/` | Crear | — |
| GET | `/drivers/{id}/` | Obtener por ID | — |
| PUT | `/drivers/{id}/` | Actualizar completo | — |
| PATCH | `/drivers/{id}/` | Actualizar parcial | — |
| DELETE | `/drivers/{id}/` | Hard delete | — |

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
      "user_full_name": "Juan Pérez",
      "user_email": "juan@example.com",
      "user_username": "juanp",
      "license_number": "ABC123",
      "license_expiry": "2027-01-01",
      "phone": "+571234567890",
      "transport": 1,
      "is_active": true,
      "created_at": "2026-01-01T00:00:00Z",
      "updated_at": "2026-01-01T00:00:00Z"
    }
  ]
}
```

**Filtros disponibles:**
- `?is_active=true|false` — exacto
- `?transport=1` — exacto
- `?search=termino` — búsqueda textual en full_name, license_number, phone, email
- `?page=1` — número de página

## Modelo

| Campo | Tipo | TypeScript | Notas |
|-------|------|------------|-------|
| id | BigAutoField | `number` | PK |
| user_full_name | — | `string` | Desde auth_user via DriverReadSerializer |
| user_email | — | `string` | Desde auth_user via DriverReadSerializer |
| user_username | — | `string` | Desde auth_user via DriverReadSerializer |
| license_number | CharField(50) | `string` | UNIQUE, NOT NULL |
| license_expiry | DateField | `string` | NOT NULL |
| phone | CharField(20) | `string` | NOT NULL |
| transport | FK | `number \| null` | FK → transport, SET_NULL, nullable |
| is_active | BooleanField | `boolean` | default=True, activo/inactivo |
| created_at | DateTimeField | `string` (ISO) | auto_now_add |
| updated_at | DateTimeField | `string` (ISO) | auto_now |

## Tipos TypeScript

```typescript
// types/drivers.ts

interface Driver {
  id: number
  user_full_name: string
  user_email: string
  user_username: string
  license_number: string
  license_expiry: string
  phone: string
  transport: number | null
  is_active: boolean
  created_at: string
  updated_at: string
}

interface DriverFormData {
  user_full_name: string
  user_email: string
  license_number: string
  license_expiry: string
  phone: string
  transport?: number | null
  is_active?: boolean
}

interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

interface DriverFilters {
  page: number
  search?: string
  is_active?: "true" | "false" | ""
}
```

## Estructura de archivos

```
app/drivers/
  page.tsx              → lista con TanStack Table + filtros

hooks/
  use-drivers.ts        → TanStack Query hooks (useDrivers, useDriver, useCreateDriver, useUpdateDriver, useDeleteDriver)

components/
  drivers-table.tsx     → TanStack Table component
  drivers-form.tsx      → Dialog con formulario crear/editar (shadcn)
  drivers-delete-dialog.tsx → Confirmación de delete (shadcn AlertDialog)
```

## Componentes

### `app/drivers/page.tsx`
- `"use client"`
- Estado local para filtros: `is_active`, `search`, `page`
- Renderiza filtros en un toolbar horizontal:
  - Input para `search` — shadcn `<Input>` con placeholder "Buscar conductores..."
  - Debounce en search (300ms) para no disparar requests en cada tecla
  - Select para `is_active` (opciones: "Todos", "Sí", "No") — shadcn `<Select>`
- Pasa `filters` a `useDrivers(filters)` hook
- Renderiza `<DriversTable>` con data + página actual + total páginas
- Botón "Nuevo conductor" que abre `<DriversForm>` en modo creación
- Al crear/editar/eliminar con éxito, invalida query de lista con `queryClient.invalidateQueries({ queryKey: ["drivers"] })`

### `components/drivers-table.tsx`
- `"use client"`
- Recibe: `data: Driver[]`, `totalPages: number`, `page: number`, `onPageChange: (page: number) => void`, `onEdit: (driver: Driver) => void`, `onDelete: (driver: Driver) => void`
- Crea instancia de TanStack Table con `useReactTable`:
  - **Columnas:**
    - `full_name` — `driver.user_full_name`
    - `license_number` — número de licencia
    - `phone` — teléfono
    - `email` — `driver.user_email`
    - `is_active` — badge: activo → `bg-green-100 text-green-800` "Activo", inactivo → `bg-gray-100 text-gray-800` "Inactivo"
    - `actions` — botones editar (lápiz) y eliminar (basurero) con iconos de lucide-react
  - `manualPagination: true` (server-side), `pageCount: totalPages`
  - Sorting client-side (no envía al backend)
- Usa shadcn `<Table>`, `<TableHeader>`, `<TableBody>`, `<TableRow>`, `<TableCell>`
- Paginación con botones "Anterior"/"Siguiente" en el footer
- Estado vacío: mostrar mensaje "No se encontraron conductores" centrado
- Estado carga: mostrar `<Skeleton>` rows (5 filas de esqueleto)

### `components/drivers-form.tsx`
- `"use client"`
- shadcn `<Dialog>` modal para crear/editar
- Props: `open: boolean`, `onOpenChange: (open: boolean) => void`, `driver?: Driver | null` (null = crear, Driver = editar)
- Título dinámico: "Nuevo conductor" / "Editar conductor"
- Campos del formulario:
  - `user_full_name` — Input required
  - `user_email` — Input type="email" required
  - `license_number` — Input required
  - `license_expiry` — Input type="date" required
  - `phone` — Input type="tel" required
  - `transport` — Select (cargar opciones via TanStack Query desde `/transport/`) opcional
  - `is_active` — Switch (encendido = activo, apagado = inactivo), default ON
- Botones: Cancelar + Guardar
- Validación client-side: todos los required marcados con `required`
- Al editar, pre-poblar el formulario con los datos del driver
- Estado carga en botón Guardar: disabled + spinner mientras muta
- Al guardar éxito: cerrar Dialog + toast.success("Conductor creado/actualizado correctamente")
- Al guardar error: toast.error con mensaje del backend
- Si hay error de validación del backend (400), mostrar errores debajo de cada campo

### `components/drivers-delete-dialog.tsx`
- `"use client"`
- shadcn `<AlertDialog>`
- Props: `open: boolean`, `onOpenChange: (open: boolean) => void`, `driver: Driver`, `onConfirm: () => void`
- Mensaje: "¿Estás seguro de eliminar a {driver.user_full_name}?" con texto explicativo: "Esta acción eliminará permanentemente el conductor. No se puede deshacer."
- Botones: Cancelar + "Eliminar" (variant="destructive")
- Estado carga en botón Eliminar mientras muta
- Al confirmar con éxito: toast.success("Conductor eliminado correctamente")

## Hooks/Queries

Todos en `hooks/use-drivers.ts`:

### `useDrivers(filters: DriversFilters)`
- `useQuery` con queryKey: `["drivers", filters]`
- `queryFn`: `api.get("/drivers/", { params: filters })` → `data: PaginatedResponse<Driver>`
- Retorna `{ data, isLoading, isError, error }`

### `useDriver(id: number | null)`
- `useQuery` con queryKey: `["drivers", id]`
- `enabled: !!id`
- `queryFn`: `api.get(\`/drivers/${id}/\`)` → `data: Driver`

### `useCreateDriver()`
- `useMutation`
- `mutationFn`: `(formData: DriverFormData) => api.post("/drivers/", formData)`
- `onSuccess`: invalida `["drivers"]` query
- Retorna `{ mutate, isPending, error }`

### `useUpdateDriver()`
- `useMutation`
- `mutationFn`: `({ id, data }: { id: number; data: Partial<DriverFormData> }) => api.patch(\`/drivers/${id}/\`, data)`
- Usar PATCH (partial update) en lugar de PUT
- `onSuccess`: invalida `["drivers"]` query

### `useDeleteDriver()`
- `useMutation`
- `mutationFn`: `(id: number) => api.delete(\`/drivers/${id}/\`)`
- DELETE real (no soft delete)
- `onSuccess`: invalida `["drivers"]` query
- Retorna `{ mutate, isPending, error }`

## Estados de UI

| Estado | Componente | Comportamiento |
|--------|------------|----------------|
| Loading (lista) | drivers-table | 5 filas de Skeleton |
| Empty (lista) | drivers-table | Mensaje "No se encontraron conductores" |
| Error (lista) | drivers-table | Toast sonner con error |
| Loading (form save) | drivers-form | Botón Guardar disabled + spinner |
| Error (form save) | drivers-form | Toast con mensaje error + errores inline |
| Success (form save) | drivers-form → close | Toast "Conductor creado/actualizado" + refetch lista |
| Loading (delete) | drivers-delete-dialog | Botón Eliminar disabled + spinner |
| Success (delete) | drivers-delete-dialog → close | Toast "Conductor eliminado" + refetch lista |
| Debounce (search) | page | 300ms delay antes de disparar query |

## Dependencias

- Auth (layout protegido, axios interceptor con Bearer token)
- Transport (cargar lista para select en formulario — `useTransport` hook)
- shadcn/ui components ya instalados: button, input, label, select, dialog, table, skeleton, badge, sonner, switch
- TanStack Query v5 (ya instalado)
- TanStack Table v8 (ya instalado)
- lucide-react (ya instalado) — iconos: Pencil, Trash2, Plus, ChevronLeft, ChevronRight, Search, Loader2
- No requiere nuevas dependencias npm

## Tareas

- [x] Crear `types/drivers.ts` — interfaces Driver, DriverFormData, PaginatedResponse, DriverFilters
- [x] Crear `hooks/use-drivers.ts` — 5 hooks: useDrivers, useDriver, useCreateDriver, useUpdateDriver, useDeleteDriver
- [x] Crear `components/drivers-table.tsx` — TanStack Table con columnas, skeletons, paginación, badge is_active
- [x] Crear `components/drivers-form.tsx` — shadcn Dialog con formulario crear/editar + select transport
- [x] Crear `components/drivers-delete-dialog.tsx` — shadcn Dialog con confirmación de soft delete
- [x] Crear `app/drivers/page.tsx` — página con filtros + toolbar + DriversTable
- [x] Wire up: mutations invalidan queryKey "drivers" en onSuccess
- [x] Verificar build con `npm run build`
