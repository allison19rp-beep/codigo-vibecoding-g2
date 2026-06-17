# Spec: Transport

## Requisitos

- Página lista con TanStack Table (columnas: plate_number, transport_type, brand, model, year, capacity_kg, is_available, actions)
- Filtros: search, transport_type (Select), is_available (Select Sí/No/Todos), capacity_kg range
- Formulario crear/editar con shadcn Dialog
- Confirmación de **hard delete** antes de ejecutar DELETE
- Paginación server-side con TanStack Query (20 items por página)
- TanStack Table con column headers, sorting client-side, y paginación integrada
- Estados: loading (skeleton), empty (mensaje "No se encontraron vehículos"), error (toast sonner)

## API Endpoints

| Método | Path | Descripción | Query Params |
|--------|------|-------------|-------------|
| GET | `/transport/` | Listar (paginado) | `page`, `search`, `transport_type`, `is_available`, `capacity_kg_gte`, `capacity_kg_lte`, `capacity_m3_gte`, `capacity_m3_lte` |
| POST | `/transport/` | Crear | — |
| GET | `/transport/{id}/` | Obtener por ID | — |
| PUT | `/transport/{id}/` | Actualizar completo | — |
| PATCH | `/transport/{id}/` | Actualizar parcial | — |
| DELETE | `/transport/{id}/` | **Hard delete** | — |

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
      "plate_number": "ABC-123",
      "transport_type": "TRUCK",
      "brand": "Toyota",
      "model": "Hilux",
      "year": 2023,
      "capacity_kg": "1500.00",
      "capacity_m3": "8.50",
      "is_available": true,
      "created_at": "2026-01-01T00:00:00Z",
      "updated_at": "2026-01-01T00:00:00Z"
    }
  ]
}
```

**Filtros disponibles:**
- `?transport_type=TRUCK|VAN|MOTORCYCLE|CARGO_BIKE` — exacto
- `?is_available=true|false` — exacto
- `?capacity_kg_gte=1000` — capacidad mínima en kg
- `?capacity_kg_lte=5000` — capacidad máxima en kg
- `?capacity_m3_gte=1.5` — capacidad mínima en m³
- `?capacity_m3_lte=10` — capacidad máxima en m³
- `?search=termino` — búsqueda textual en plate_number, brand, model
- `?page=1` — número de página

## Modelo

| Campo | Tipo | TypeScript | Notas |
|-------|------|------------|-------|
| id | BigAutoField | `number` | PK |
| plate_number | CharField(20) | `string` | UNIQUE, NOT NULL |
| transport_type | CharField(20) | `TransportType` | NOT NULL |
| brand | CharField(100) | `string` | NOT NULL |
| model | CharField(100) | `string` | NOT NULL |
| year | IntegerField | `number` | NOT NULL |
| capacity_kg | DecimalField(10,2) | `string` | NOT NULL |
| capacity_m3 | DecimalField(8,2) | `string` | NOT NULL |
| is_available | BooleanField | `boolean` | default=True |
| created_at | DateTimeField | `string` (ISO) | auto_now_add |
| updated_at | DateTimeField | `string` (ISO) | auto_now |

**Nota:** Hard delete. No tiene campo `is_active`. El DELETE elimina el registro físicamente.

## Tipos TypeScript

```typescript
// types/transport.ts

type TransportType = "TRUCK" | "VAN" | "MOTORCYCLE" | "CARGO_BIKE"

interface Transport {
  id: number
  plate_number: string
  transport_type: TransportType
  brand: string
  model: string
  year: number
  capacity_kg: string
  capacity_m3: string
  is_available: boolean
  created_at: string
  updated_at: string
}

interface TransportFormData {
  plate_number: string
  transport_type: TransportType
  brand: string
  model: string
  year: number
  capacity_kg: string
  capacity_m3: string
  is_available: boolean
}

interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

interface TransportFilters {
  page: number
  search?: string
  transport_type?: TransportType | ""
  is_available?: boolean | ""
  capacity_kg_gte?: string
  capacity_kg_lte?: string
  capacity_m3_gte?: string
  capacity_m3_lte?: string
}
```

## Estructura de archivos

```
app/transport/
  page.tsx              → lista con TanStack Table + filtros (server component wrapper + "use client" inner)

hooks/
  use-transport.ts      → TanStack Query hooks (useTransportList, useTransport, useCreateTransport, useUpdateTransport, useDeleteTransport)

components/
  transport-table.tsx    → TanStack Table component
  transport-form.tsx     → Dialog con formulario crear/editar (shadcn)
  transport-delete-dialog.tsx → Confirmación hard delete (shadcn AlertDialog)
```

## Componentes

### `app/transport/page.tsx`
- Server component wrapper o directamente `"use client"` con toda la page
- Estado local para filtros: `transport_type`, `is_available`, `search`, `capacity_kg_gte`, `capacity_kg_lte`, `page`
- Renderiza filtros en un toolbar horizontal:
  - Input para `search` — shadcn `<Input>` con placeholder "Buscar por placa, marca o modelo..."
  - Select para `transport_type` (opciones: "Todos", "TRUCK", "VAN", "MOTORCYCLE", "CARGO_BIKE") — shadcn `<Select>`
  - Select para `is_available` (opciones: "Todos", "Sí", "No") — shadcn `<Select>`
  - Inputs para rango de `capacity_kg` — dos shadcn `<Input>` type="number" con placeholder "Capacidad mín (kg)" y "Capacidad máx (kg)"
  - Debounce en search (300ms) para no disparar requests en cada tecla
- Pasa `filters` a `useTransportList(filters)` hook
- Renderiza `<TransportTable>` con data + página actual + total páginas
- Botón "Nuevo vehículo" que abre `<TransportForm>` en modo creación
- Al crear/editar/eliminar con éxito, invalida query de lista con `queryClient.invalidateQueries({ queryKey: ["transport"] })`

### `components/transport-table.tsx`
- `"use client"`
- Recibe: `data: Transport[]`, `totalPages: number`, `page: number`, `onPageChange: (page: number) => void`, `onEdit: (transport: Transport) => void`, `onDelete: (transport: Transport) => void`
- Crea instancia de TanStack Table con `useReactTable`:
  - **Columnas:**
    - `plate_number` — placa del vehículo
    - `transport_type` — badge con color: TRUCK → `bg-blue-100 text-blue-800`, VAN → `bg-green-100 text-green-800`, MOTORCYCLE → `bg-yellow-100 text-yellow-800`, CARGO_BIKE → `bg-purple-100 text-purple-800`
    - `brand` — marca
    - `model` — modelo
    - `year` — año
    - `capacity_kg` — capacidad en kg
    - `is_available` — badge: disponible → `bg-green-100 text-green-800` con texto "Disponible", no disponible → `bg-gray-100 text-gray-800` con texto "No disponible"
    - `actions` — botones editar (lápiz) y eliminar (basurero) con iconos de lucide-react
  - `manualPagination: true` (server-side), `pageCount: totalPages`
  - Sorting client-side (no envía al backend)
- Usa shadcn `<Table>`, `<TableHeader>`, `<TableBody>`, `<TableRow>`, `<TableCell>`
- Paginación con botones "Anterior"/"Siguiente" en el footer
- Estado vacío: mostrar mensaje "No se encontraron vehículos" centrado
- Estado carga: mostrar `<Skeleton>` rows (5 filas de esqueleto)

### `components/transport-form.tsx`
- `"use client"`
- shadcn `<Dialog>` modal para crear/editar
- Props: `open: boolean`, `onOpenChange: (open: boolean) => void`, `transport?: Transport | null` (null = crear, Transport = editar)
- Título dinámico: "Nuevo vehículo" / "Editar vehículo"
- Campos del formulario:
  - `plate_number` — Input required
  - `transport_type` — Select required con opciones: TRUCK, VAN, MOTORCYCLE, CARGO_BIKE (con labels descriptivos)
  - `brand` — Input required
  - `model` — Input required
  - `year` — Input type="number" required (min 1900, max año actual)
  - `capacity_kg` — Input type="number" step="0.01" required
  - `capacity_m3` — Input type="number" step="0.01" required
  - `is_available` — Switch (shadcn) o Select (Sí/No), default true
- Botones: Cancelar + Guardar
- Validación client-side: todos los required marcados con `required`
- Al editar, pre-poblar el formulario con los datos del transport
- Estado carga en botón Guardar: disabled + spinner mientras muta
- Al guardar éxito: cerrar Dialog + toast.success("Vehículo creado/actualizado correctamente")
- Al guardar error: toast.error con mensaje del backend
- Si hay error de validación del backend (400), mostrar errores debajo de cada campo

### `components/transport-delete-dialog.tsx`
- `"use client"`
- shadcn `<AlertDialog>` con variante destructiva
- Props: `open: boolean`, `onOpenChange: (open: boolean) => void`, `transport: Transport`, `onConfirm: () => void`
- Mensaje: "¿Estás seguro de eliminar el vehículo {transport.plate_number}?" con texto explicativo: "Esta acción eliminará permanentemente el vehículo. No se puede deshacer."
- Botones: Cancelar + "Eliminar" (variant="destructive")
- Estado carga en botón Eliminar mientras muta
- Al confirmar con éxito: toast.success("Vehículo eliminado correctamente")

## Hooks/Queries

Todos en `hooks/use-transport.ts`:

### `useTransportList(filters: TransportFilters)`
- `useQuery` con queryKey: `["transport", filters]`
- `queryFn`: `api.get("/transport/", { params: filters })` → `data: PaginatedResponse<Transport>`
- Retorna `{ data, isLoading, isError, error }`
- `select` opcional para transformar respuesta si es necesario

### `useTransport(id: number | null)`
- `useQuery` con queryKey: `["transport", id]`
- `enabled: !!id` (no ejecuta si id es null)
- `queryFn`: `api.get(\`/transport/${id}/\`)` → `data: Transport`

### `useCreateTransport()`
- `useMutation`
- `mutationFn`: `(formData: TransportFormData) => api.post("/transport/", formData)`
- `onSuccess`: invalida `["transport"]` query
- Retorna `{ mutate, isPending, error }`

### `useUpdateTransport()`
- `useMutation`
- `mutationFn`: `({ id, data }: { id: number; data: Partial<TransportFormData> }) => api.patch(\`/transport/${id}/\`, data)`
- Usar PATCH (partial update) en lugar de PUT
- `onSuccess`: invalida `["transport"]` query

### `useDeleteTransport()`
- `useMutation`
- `mutationFn`: `(id: number) => api.delete(\`/transport/${id}/\`)`
- **Hard delete:** el backend elimina el registro físicamente
- `onSuccess`: invalida `["transport"]` query
- Retorna `{ mutate, isPending, error }`

## Estados de UI

| Estado | Componente | Comportamiento |
|--------|------------|----------------|
| Loading (lista) | transport-table | 5 filas de Skeleton |
| Empty (lista) | transport-table | Mensaje "No se encontraron vehículos" |
| Error (lista) | transport-table | Toast sonner con error |
| Loading (form save) | transport-form | Botón Guardar disabled + spinner |
| Error (form save) | transport-form | Toast con mensaje error + errores inline |
| Success (form save) | transport-form → close | Toast "Vehículo creado/actualizado" + refetch lista |
| Loading (delete) | transport-delete-dialog | Botón Eliminar disabled + spinner |
| Success (delete) | transport-delete-dialog → close | Toast "Vehículo eliminado" + refetch lista |
| Debounce (search) | page | 300ms delay antes de disparar query |

## Dependencias

- Auth (layout protegido, axios interceptor con Bearer token)
- shadcn/ui components ya instalados: button, input, label, select, dialog, table, skeleton, badge, sonner, switch, alert-dialog
- TanStack Query v5 (ya instalado)
- TanStack Table v8 (ya instalado)
- lucide-react (ya instalado) — iconos: Pencil, Trash2, Plus, ChevronLeft, ChevronRight, Search, Loader2
- No requiere nuevas dependencias npm

## Tareas

- [x] Crear `types/transport.ts` — interfaces Transport, TransportFormData, PaginatedResponse, TransportFilters
- [x] Crear `hooks/use-transport.ts` — 5 hooks: useTransportList, useTransport, useCreateTransport, useUpdateTransport, useDeleteTransport
- [x] Crear `components/transport-table.tsx` — TanStack Table con columnas, skeletons, paginación, estados, badges
- [x] Crear `components/transport-form.tsx` — shadcn Dialog con formulario crear/editar
- [x] Crear `components/transport-delete-dialog.tsx` — shadcn AlertDialog con confirmación de hard delete
- [x] Crear `app/transport/page.tsx` — página con filtros + toolbar + TransportTable
- [x] Wire up: mutations invalidan queryKey "transport" en onSuccess
- [x] Verificar build con `npm run build`
