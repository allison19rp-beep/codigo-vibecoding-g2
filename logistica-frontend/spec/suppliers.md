# Spec: Suppliers

## Requisitos

- Página lista con TanStack Table (columnas: name, contact_name, email, city, actions)
- Filtros: city (input), search (input)
- Formulario crear/editar con shadcn Dialog
- Confirmación de soft delete antes de ejecutar DELETE
- Paginación server-side con TanStack Query (20 items por página)
- TanStack Table con column headers, sorting client-side, y paginación integrada
- Estados: loading (skeleton), empty (mensaje "No se encontraron proveedores"), error (toast sonner)

## API Endpoints

| Método | Path | Descripción | Query Params |
|--------|------|-------------|-------------|
| GET | `/suppliers/` | Listar (paginado) | `page`, `search`, `city`, `ordering` |
| POST | `/suppliers/` | Crear | — |
| GET | `/suppliers/{id}/` | Obtener por ID | — |
| PUT | `/suppliers/{id}/` | Actualizar completo | — |
| PATCH | `/suppliers/{id}/` | Actualizar parcial | — |
| DELETE | `/suppliers/{id}/` | Soft delete | — |

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
      "name": "Proveedor Ejemplo",
      "tax_id": "123456789-0",
      "contact_name": "Juan Pérez",
      "email": "contacto@proveedor.com",
      "phone": "+571234567890",
      "address": "Calle 123",
      "city": "Bogotá",
      "country": "Colombia",
      "is_active": true,
      "created_at": "2026-01-01T00:00:00Z",
      "updated_at": "2026-01-01T00:00:00Z"
    }
  ]
}
```

**Filtros disponibles:**
- `?city=Bogotá` — exacto
- `?search=termino` — búsqueda textual en name, contact_name, email, tax_id
- `?ordering=name|-created_at` — ordenamiento
- `?page=1` — número de página

## Modelo

| Campo | Tipo | TypeScript | Notas |
|-------|------|------------|-------|
| id | BigAutoField | `number` | PK |
| name | CharField(255) | `string` | NOT NULL |
| tax_id | CharField(50) | `string \| null` | UNIQUE, nullable |
| contact_name | CharField(255) | `string` | NOT NULL |
| email | CharField(254) | `string` | UNIQUE, NOT NULL |
| phone | CharField(20) | `string` | NOT NULL |
| address | CharField(500) | `string` | NOT NULL |
| city | CharField(100) | `string` | NOT NULL |
| country | CharField(100) | `string` | default=`Colombia` |
| is_active | BooleanField | `boolean` | default=True, soft delete |
| created_at | DateTimeField | `string` (ISO) | auto_now_add |
| updated_at | DateTimeField | `string` (ISO) | auto_now |

## Tipos TypeScript

```typescript
// types/suppliers.ts

interface Supplier {
  id: number
  name: string
  tax_id: string | null
  contact_name: string
  email: string
  phone: string
  address: string
  city: string
  country: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface SupplierFormData {
  name: string
  tax_id?: string
  contact_name: string
  email: string
  phone: string
  address: string
  city: string
  country?: string
}

interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

interface SupplierFilters {
  page: number
  search?: string
  city?: string
  ordering?: string
}
```

## Estructura de archivos

```
app/suppliers/
  page.tsx              → lista con TanStack Table + filtros ("use client")

hooks/
  use-suppliers.ts      → TanStack Query hooks (useSuppliers, useSupplier, useCreateSupplier, useUpdateSupplier, useDeleteSupplier)

components/
  suppliers-table.tsx    → TanStack Table component
  suppliers-form.tsx     → Dialog con formulario crear/editar (shadcn)
  suppliers-delete-dialog.tsx → Confirmación soft delete (shadcn AlertDialog)
```

## Componentes

### `app/suppliers/page.tsx`
- `"use client"`
- Estado local para filtros: `search`, `city`, `page`
- Renderiza filtros en un toolbar horizontal:
  - Input para `search` — shadcn `<Input>` con placeholder "Buscar proveedores..."
  - Input para `city` — shadcn `<Input>` con placeholder "Filtrar por ciudad"
  - Debounce en search (300ms) para no disparar requests en cada tecla
- Pasa `filters` a `useSuppliers(filters)` hook
- Renderiza `<SuppliersTable>` con data + página actual + total páginas
- Botón "Nuevo proveedor" que abre `<SuppliersForm>` en modo creación
- Al crear/editar/eliminar con éxito, invalida query de lista con `queryClient.invalidateQueries({ queryKey: ["suppliers"] })`

### `components/suppliers-table.tsx`
- `"use client"`
- Recibe: `data: Supplier[]`, `totalPages: number`, `page: number`, `onPageChange: (page: number) => void`, `onEdit: (supplier: Supplier) => void`, `onDelete: (supplier: Supplier) => void`
- Crea instancia de TanStack Table con `useReactTable`:
  - **Columnas:**
    - `name` — nombre del proveedor
    - `contact_name` — nombre de contacto
    - `email` — email
    - `city` — ciudad
    - `actions` — botones editar (lápiz) y eliminar (basurero) con iconos de lucide-react
  - `manualPagination: true` (server-side), `pageCount: totalPages`
  - Sorting client-side (no envía al backend)
- Usa shadcn `<Table>`, `<TableHeader>`, `<TableBody>`, `<TableRow>`, `<TableCell>`
- Paginación con botones "Anterior"/"Siguiente" en el footer
- Estado vacío: mostrar mensaje "No se encontraron proveedores" centrado
- Estado carga: mostrar `<Skeleton>` rows (5 filas de esqueleto)

### `components/suppliers-form.tsx`
- `"use client"`
- shadcn `<Dialog>` modal para crear/editar
- Props: `open: boolean`, `onOpenChange: (open: boolean) => void`, `supplier?: Supplier | null` (null = crear, Supplier = editar)
- Título dinámico: "Nuevo proveedor" / "Editar proveedor"
- Campos del formulario:
  - `name` — Input required
  - `tax_id` — Input opcional, placeholder "RUC/NIT"
  - `contact_name` — Input required
  - `email` — Input type="email" required
  - `phone` — Input required
  - `address` — Input required
  - `city` — Input required
  - `country` — Input (default "Colombia")
- Botones: Cancelar + Guardar
- Validación client-side: todos los required marcados con `required`
- Al editar, pre-poblar el formulario con los datos del proveedor
- Estado carga en botón Guardar: disabled + spinner mientras muta
- Al guardar éxito: cerrar Dialog + toast.success("Proveedor creado/actualizado correctamente")
- Al guardar error: toast.error con mensaje del backend
- Si hay error de validación del backend (400), mostrar errores debajo de cada campo

### `components/suppliers-delete-dialog.tsx`
- `"use client"`
- shadcn `<AlertDialog>`
- Props: `open: boolean`, `onOpenChange: (open: boolean) => void`, `supplier: Supplier`, `onConfirm: () => void`
- Mensaje: "¿Estás seguro de eliminar a {supplier.name}?" con texto explicativo: "Esta acción desactivará el proveedor. No se eliminarán sus datos."
- Botones: Cancelar + "Eliminar" (variant="destructive")
- Estado carga en botón Eliminar mientras muta
- Al confirmar con éxito: toast.success("Proveedor eliminado correctamente")

## Hooks/Queries

Todos en `hooks/use-suppliers.ts`:

### `useSuppliers(filters: SupplierFilters)`
- `useQuery` con queryKey: `["suppliers", filters]`
- `queryFn`: `api.get("/suppliers/", { params: filters })` → `data: PaginatedResponse<Supplier>`
- Retorna `{ data, isLoading, isError, error }`

### `useSupplier(id: number | null)`
- `useQuery` con queryKey: `["suppliers", id]`
- `enabled: !!id` (no ejecuta si id es null)
- `queryFn`: `api.get(\`/suppliers/${id}/\`)` → `data: Supplier`

### `useCreateSupplier()`
- `useMutation`
- `mutationFn`: `(formData: SupplierFormData) => api.post("/suppliers/", formData)`
- `onSuccess`: invalida `["suppliers"]` query
- Retorna `{ mutate, isPending, error }`

### `useUpdateSupplier()`
- `useMutation`
- `mutationFn`: `({ id, data }: { id: number; data: Partial<SupplierFormData> }) => api.patch(\`/suppliers/${id}/\`, data)`
- Usar PATCH (partial update) en lugar de PUT
- `onSuccess`: invalida `["suppliers"]` query

### `useDeleteSupplier()`
- `useMutation`
- `mutationFn`: `(id: number) => api.delete(\`/suppliers/${id}/\`)`
- Soft delete: el backend setea `is_active = false`
- `onSuccess`: invalida `["suppliers"]` query
- Retorna `{ mutate, isPending, error }`

## Estados de UI

| Estado | Componente | Comportamiento |
|--------|------------|----------------|
| Loading (lista) | suppliers-table | 5 filas de Skeleton |
| Empty (lista) | suppliers-table | Mensaje "No se encontraron proveedores" |
| Error (lista) | suppliers-table | Toast sonner con error |
| Loading (form save) | suppliers-form | Botón Guardar disabled + spinner |
| Error (form save) | suppliers-form | Toast con mensaje error + errores inline |
| Success (form save) | suppliers-form → close | Toast "Proveedor creado/actualizado" + refetch lista |
| Loading (delete) | suppliers-delete-dialog | Botón Eliminar disabled + spinner |
| Success (delete) | suppliers-delete-dialog → close | Toast "Proveedor eliminado" + refetch lista |
| Debounce (search) | page | 300ms delay antes de disparar query |

## Dependencias

- Auth (layout protegido, axios interceptor con Bearer token)
- shadcn/ui componentes ya instalados: button, input, label, select, dialog, table, skeleton, badge, sonner
- TanStack Query v5 (ya instalado)
- TanStack Table v8 (ya instalado)
- lucide-react (ya instalado) — iconos: Pencil, Trash2, Plus, ChevronLeft, ChevronRight, Search, Loader2
- No requiere nuevas dependencias npm

## Tareas

- [ ] Crear `types/suppliers.ts` — interfaces Supplier, SupplierFormData, PaginatedResponse, SupplierFilters
- [ ] Crear `hooks/use-suppliers.ts` — 5 hooks: useSuppliers, useSupplier, useCreateSupplier, useUpdateSupplier, useDeleteSupplier
- [ ] Crear `components/suppliers-table.tsx` — TanStack Table con columnas, skeletons, paginación, estados
- [ ] Crear `components/suppliers-form.tsx` — shadcn Dialog con formulario crear/editar
- [ ] Crear `components/suppliers-delete-dialog.tsx` — shadcn AlertDialog con confirmación
- [ ] Crear `app/suppliers/page.tsx` — página con filtros + toolbar + SuppliersTable
- [ ] Wire up: mutations invalidan queryKey "suppliers" en onSuccess
- [ ] Verificar build con `npm run build`
