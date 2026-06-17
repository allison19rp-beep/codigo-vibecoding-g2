# Spec: Warehouses

## Requisitos

- Página lista con TanStack Table (columnas: name, city, country, capacity, actions)
- Filtros: city (input), capacity range (inputs gte/lte), search (input)
- Formulario crear/editar con shadcn Dialog
- Confirmación de soft delete antes de ejecutar DELETE
- Paginación server-side con TanStack Query (20 items por página)
- TanStack Table con column headers, sorting client-side, y paginación integrada
- Estados: loading (skeleton), empty (mensaje "No se encontraron bodegas"), error (toast sonner)

## API Endpoints

| Método | Path | Descripción | Query Params |
|--------|------|-------------|-------------|
| GET | `/warehouses/` | Listar (paginado) | `page`, `search`, `city`, `capacity_m3_gte`, `capacity_m3_lte`, `ordering` |
| POST | `/warehouses/` | Crear | — |
| GET | `/warehouses/{id}/` | Obtener por ID | — |
| PUT | `/warehouses/{id}/` | Actualizar completo | — |
| PATCH | `/warehouses/{id}/` | Actualizar parcial | — |
| DELETE | `/warehouses/{id}/` | Soft delete | — |

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
      "name": "Bodega Principal",
      "address": "Cra 50 #123-45",
      "city": "Bogotá",
      "country": "Colombia",
      "latitude": "4.711000",
      "longitude": "-74.072000",
      "capacity_m3": "5000.00",
      "is_active": true,
      "created_at": "2026-01-01T00:00:00Z",
      "updated_at": "2026-01-01T00:00:00Z"
    }
  ]
}
```

**Filtros disponibles:**
- `?city=Bogotá` — exacto
- `?capacity_m3_gte=100&capacity_m3_lte=500` — rango
- `?search=termino` — búsqueda textual en name, city, address
- `?ordering=name|-created_at` — ordenamiento
- `?page=1` — número de página

## Modelo

| Campo | Tipo | TypeScript | Notas |
|-------|------|------------|-------|
| id | BigAutoField | `number` | PK |
| name | CharField(255) | `string` | NOT NULL |
| address | CharField(500) | `string` | NOT NULL |
| city | CharField(100) | `string` | NOT NULL |
| country | CharField(100) | `string` | default=`Colombia` |
| latitude | DecimalField(9,6) | `string \| null` | nullable |
| longitude | DecimalField(9,6) | `string \| null` | nullable |
| capacity_m3 | DecimalField(10,2) | `string` | NOT NULL, capacidad total en m³ |
| is_active | BooleanField | `boolean` | default=True, soft delete |
| created_at | DateTimeField | `string` (ISO) | auto_now_add |
| updated_at | DateTimeField | `string` (ISO) | auto_now |

## Tipos TypeScript

```typescript
// types/warehouses.ts

interface Warehouse {
  id: number
  name: string
  address: string
  city: string
  country: string
  latitude: string | null
  longitude: string | null
  capacity_m3: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface WarehouseFormData {
  name: string
  address: string
  city: string
  country?: string
  latitude?: string
  longitude?: string
  capacity_m3: string
}

interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

interface WarehouseFilters {
  page: number
  search?: string
  city?: string
  capacity_m3_gte?: string
  capacity_m3_lte?: string
  ordering?: string
}
```

## Estructura de archivos

```
app/warehouses/
  page.tsx              → lista con TanStack Table + filtros ("use client")

hooks/
  use-warehouses.ts     → TanStack Query hooks (useWarehouses, useWarehouse, useCreateWarehouse, useUpdateWarehouse, useDeleteWarehouse)

components/
  warehouses-table.tsx   → TanStack Table component
  warehouses-form.tsx    → Dialog con formulario crear/editar (shadcn)
  warehouses-delete-dialog.tsx → Confirmación soft delete (shadcn AlertDialog)
```

## Componentes

### `app/warehouses/page.tsx`
- `"use client"`
- Estado local para filtros: `search`, `city`, `capacity_m3_gte`, `capacity_m3_lte`, `page`
- Renderiza filtros en un toolbar horizontal:
  - Input para `search` — shadcn `<Input>` con placeholder "Buscar bodegas..."
  - Input para `city` — shadcn `<Input>` con placeholder "Filtrar por ciudad"
  - Input para `capacity_m3_gte` — shadcn `<Input>` type="number" placeholder "Cap. mín (m³)"
  - Input para `capacity_m3_lte` — shadcn `<Input>` type="number" placeholder "Cap. máx (m³)"
  - Debounce en search (300ms) para no disparar requests en cada tecla
- Pasa `filters` a `useWarehouses(filters)` hook
- Renderiza `<WarehousesTable>` con data + página actual + total páginas
- Botón "Nueva bodega" que abre `<WarehousesForm>` en modo creación
- Al crear/editar/eliminar con éxito, invalida query de lista con `queryClient.invalidateQueries({ queryKey: ["warehouses"] })`

### `components/warehouses-table.tsx`
- `"use client"`
- Recibe: `data: Warehouse[]`, `totalPages: number`, `page: number`, `onPageChange: (page: number) => void`, `onEdit: (warehouse: Warehouse) => void`, `onDelete: (warehouse: Warehouse) => void`
- Crea instancia de TanStack Table con `useReactTable`:
  - **Columnas:**
    - `name` — nombre de la bodega
    - `city` — ciudad
    - `country` — país
    - `capacity_m3` — capacidad formateada: `parseFloat(val).toLocaleString("es-CO") + " m³"`
    - `actions` — botones editar (lápiz) y eliminar (basurero) con iconos de lucide-react
  - `manualPagination: true` (server-side), `pageCount: totalPages`
  - Sorting client-side (no envía al backend)
- Usa shadcn `<Table>`, `<TableHeader>`, `<TableBody>`, `<TableRow>`, `<TableCell>`
- Paginación con botones "Anterior"/"Siguiente" en el footer
- Estado vacío: mostrar mensaje "No se encontraron bodegas" centrado
- Estado carga: mostrar `<Skeleton>` rows (5 filas de esqueleto)

### `components/warehouses-form.tsx`
- `"use client"`
- shadcn `<Dialog>` modal para crear/editar
- Props: `open: boolean`, `onOpenChange: (open: boolean) => void`, `warehouse?: Warehouse | null` (null = crear, Warehouse = editar)
- Título dinámico: "Nueva bodega" / "Editar bodega"
- Campos del formulario:
  - `name` — Input required
  - `address` — Input required
  - `city` — Input required
  - `country` — Input (default "Colombia")
  - `latitude` — Input type="text" opcional, placeholder "4.711000"
  - `longitude` — Input type="text" opcional, placeholder "-74.072000"
  - `capacity_m3` — Input type="number" step="0.01" required, placeholder "Capacidad en m³"
- Botones: Cancelar + Guardar
- Validación client-side: todos los required marcados con `required`
- Al editar, pre-poblar el formulario con los datos de la bodega
- Estado carga en botón Guardar: disabled + spinner mientras muta
- Al guardar éxito: cerrar Dialog + toast.success("Bodega creada/actualizada correctamente")
- Al guardar error: toast.error con mensaje del backend
- Si hay error de validación del backend (400), mostrar errores debajo de cada campo

### `components/warehouses-delete-dialog.tsx`
- `"use client"`
- shadcn `<AlertDialog>` (si no está instalado, usar `<Dialog>` con variante de confirmación)
- Props: `open: boolean`, `onOpenChange: (open: boolean) => void`, `warehouse: Warehouse`, `onConfirm: () => void`
- Mensaje: "¿Estás seguro de eliminar {warehouse.name}?" con texto explicativo: "Esta acción desactivará la bodega. No se eliminarán sus datos."
- Botones: Cancelar + "Eliminar" (variant="destructive")
- Estado carga en botón Eliminar mientras muta
- Al confirmar con éxito: toast.success("Bodega eliminada correctamente")

## Hooks/Queries

Todos en `hooks/use-warehouses.ts`:

### `useWarehouses(filters: WarehouseFilters)`
- `useQuery` con queryKey: `["warehouses", filters]`
- `queryFn`: `api.get("/warehouses/", { params: filters })` → `data: PaginatedResponse<Warehouse>`
- Retorna `{ data, isLoading, isError, error }`

### `useWarehouse(id: number | null)`
- `useQuery` con queryKey: `["warehouses", id]`
- `enabled: !!id` (no ejecuta si id es null)
- `queryFn`: `api.get(\`/warehouses/${id}/\`)` → `data: Warehouse`

### `useCreateWarehouse()`
- `useMutation`
- `mutationFn`: `(formData: WarehouseFormData) => api.post("/warehouses/", formData)`
- `onSuccess`: invalida `["warehouses"]` query
- Retorna `{ mutate, isPending, error }`

### `useUpdateWarehouse()`
- `useMutation`
- `mutationFn`: `({ id, data }: { id: number; data: Partial<WarehouseFormData> }) => api.patch(\`/warehouses/${id}/\`, data)`
- Usar PATCH (partial update) en lugar de PUT
- `onSuccess`: invalida `["warehouses"]` query

### `useDeleteWarehouse()`
- `useMutation`
- `mutationFn`: `(id: number) => api.delete(\`/warehouses/${id}/\`)`
- Soft delete: el backend setea `is_active = false`
- `onSuccess`: invalida `["warehouses"]` query
- Retorna `{ mutate, isPending, error }`

## Estados de UI

| Estado | Componente | Comportamiento |
|--------|------------|----------------|
| Loading (lista) | warehouses-table | 5 filas de Skeleton |
| Empty (lista) | warehouses-table | Mensaje "No se encontraron bodegas" |
| Error (lista) | warehouses-table | Toast sonner con error |
| Loading (form save) | warehouses-form | Botón Guardar disabled + spinner |
| Error (form save) | warehouses-form | Toast con mensaje error + errores inline |
| Success (form save) | warehouses-form → close | Toast "Bodega creada/actualizada" + refetch lista |
| Loading (delete) | warehouses-delete-dialog | Botón Eliminar disabled + spinner |
| Success (delete) | warehouses-delete-dialog → close | Toast "Bodega eliminada" + refetch lista |
| Debounce (search) | page | 300ms delay antes de disparar query |

## Dependencias

- Auth (layout protegido, axios interceptor con Bearer token)
- shadcn/ui componentes ya instalados: button, input, label, select, dialog, table, skeleton, badge, sonner
- **Nota:** `alert-dialog` de shadcn no está instalado. Usar `<Dialog>` con estilo de confirmación destructiva, o instalar `npx shadcn@latest add alert-dialog`
- TanStack Query v5 (ya instalado)
- TanStack Table v8 (ya instalado)
- lucide-react (ya instalado) — iconos: Pencil, Trash2, Plus, ChevronLeft, ChevronRight, Search, Loader2
- No requiere nuevas dependencias npm (salvo alert-dialog opcional)

## Tareas

- [x] Crear `types/warehouses.ts` — interfaces Warehouse, WarehouseFormData, PaginatedResponse, WarehouseFilters
- [x] Crear `hooks/use-warehouses.ts` — 5 hooks: useWarehouses, useWarehouse, useCreateWarehouse, useUpdateWarehouse, useDeleteWarehouse
- [x] Crear `components/warehouses-table.tsx` — TanStack Table con columnas, skeletons, paginación, estados
- [x] Crear `components/warehouses-form.tsx` — shadcn Dialog con formulario crear/editar
- [x] Crear `components/warehouses-delete-dialog.tsx` — shadcn AlertDialog (o Dialog) con confirmación
- [x] Crear `app/warehouses/page.tsx` — página con filtros + toolbar + WarehousesTable
- [x] Wire up: mutations invalidan queryKey "warehouses" en onSuccess
- [x] Verificar build con `npm run build`
