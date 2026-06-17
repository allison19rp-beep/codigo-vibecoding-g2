# Spec: Customers

## Requisitos

- Página lista con TanStack Table (columnas: name, customer_type, email, city, actions)
- Filtros: customer_type (select), city (input), search (input)
- Formulario crear/editar con shadcn Dialog
- Confirmación de soft delete antes de ejecutar DELETE
- Paginación server-side con TanStack Query (20 items por página)
- TanStack Table con column headers, sorting client-side, y paginación integrada
- Estados: loading (skeleton), empty (mensaje "No se encontraron clientes"), error (toast sonner)

## API Endpoints

| Método | Path | Descripción | Query Params |
|--------|------|-------------|-------------|
| GET | `/customers/` | Listar (paginado) | `page`, `search`, `customer_type`, `city`, `ordering` |
| POST | `/customers/` | Crear | — |
| GET | `/customers/{id}/` | Obtener por ID | — |
| PUT | `/customers/{id}/` | Actualizar completo | — |
| PATCH | `/customers/{id}/` | Actualizar parcial | — |
| DELETE | `/customers/{id}/` | Soft delete | — |

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
      "name": "Cliente Ejemplo",
      "customer_type": "COMPANY",
      "tax_id": "123456789-0",
      "email": "cliente@ejemplo.com",
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
- `?customer_type=COMPANY|INDIVIDUAL` — exacto
- `?city=Bogotá` — exacto
- `?search=termino` — búsqueda textual en name, email, city, tax_id
- `?ordering=name|-created_at` — ordenamiento
- `?page=1` — número de página

## Modelo

| Campo | Tipo | TypeScript | Notas |
|-------|------|------------|-------|
| id | BigAutoField | `number` | PK |
| name | CharField(255) | `string` | NOT NULL |
| customer_type | CharField(10) | `"COMPANY" \| "INDIVIDUAL"` | NOT NULL |
| tax_id | CharField(50) | `string \| null` | UNIQUE, nullable |
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
// types/customers.ts (o inline en hooks)

type CustomerType = "COMPANY" | "INDIVIDUAL"

interface Customer {
  id: number
  name: string
  customer_type: CustomerType
  tax_id: string | null
  email: string
  phone: string
  address: string
  city: string
  country: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface CustomerFormData {
  name: string
  customer_type: CustomerType
  tax_id?: string
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

interface CustomersFilters {
  page: number
  search?: string
  customer_type?: CustomerType | ""
  city?: string
  ordering?: string
}
```

## Estructura de archivos

```
app/customers/
  page.tsx              → lista con TanStack Table + filtros (server component wrapper + "use client" inner)

hooks/
  use-customers.ts      → TanStack Query hooks (useCustomers, useCustomer, useCreateCustomer, useUpdateCustomer, useDeleteCustomer)

components/
  customers-table.tsx    → TanStack Table component
  customers-form.tsx     → Dialog con formulario crear/editar (shadcn)
  customers-delete-dialog.tsx → Confirmación soft delete (shadcn AlertDialog)
```

## Componentes

### `app/customers/page.tsx`
- Server component wrapper o directamente `"use client"` con toda la page
- Estado local para filtros: `customer_type`, `city`, `search`, `page`
- Renderiza filtros en un toolbar horizontal:
  - Select para `customer_type` (opciones: "Todos", "COMPANY", "INDIVIDUAL") — shadcn `<Select>`
  - Input para `city` — shadcn `<Input>` con placeholder "Filtrar por ciudad"
  - Input para `search` — shadcn `<Input>` con placeholder "Buscar..."
  - Debounce en search (300ms) para no disparar requests en cada tecla
- Pasa `filters` a `useCustomers(filters)` hook
- Renderiza `<CustomersTable>` con data + página actual + total páginas
- Botón "Nuevo cliente" que abre `<CustomersForm>` en modo creación
- Al crear/editar/eliminar con éxito, invalida query de lista con `queryClient.invalidateQueries({ queryKey: ["customers"] })`

### `components/customers-table.tsx`
- `"use client"`
- Recibe: `data: Customer[]`, `totalPages: number`, `page: number`, `onPageChange: (page: number) => void`, `onEdit: (customer: Customer) => void`, `onDelete: (customer: Customer) => void`
- Crea instancia de TanStack Table con `useReactTable`:
  - **Columnas:**
    - `name` — nombre del cliente
    - `customer_type` — badge con color: COMPANY → `bg-blue-100 text-blue-800`, INDIVIDUAL → `bg-green-100 text-green-800`
    - `email` — email
    - `city` — ciudad
    - `actions` — botones editar (lápiz) y eliminar (basurero) con iconos de lucide-react
  - `manualPagination: true` (server-side), `pageCount: totalPages`
  - Sorting client-side (no envía al backend)
- Usa shadcn `<Table>`, `<TableHeader>`, `<TableBody>`, `<TableRow>`, `<TableCell>`
- Paginación con botones "Anterior"/"Siguiente" en el footer
- Estado vacío: mostrar mensaje "No se encontraron clientes" centrado
- Estado carga: mostrar `<Skeleton>` rows (5 filas de esqueleto)

### `components/customers-form.tsx`
- `"use client"`
- shadcn `<Dialog>` modal para crear/editar
- Props: `open: boolean`, `onOpenChange: (open: boolean) => void`, `customer?: Customer | null` (null = crear, Customer = editar)
- Título dinámico: "Nuevo cliente" / "Editar cliente"
- Campos del formulario:
  - `name` — Input required
  - `customer_type` — Select required ("COMPANY" | "INDIVIDUAL")
  - `tax_id` — Input opcional
  - `email` — Input type="email" required
  - `phone` — Input required
  - `address` — Input required
  - `city` — Input required
  - `country` — Input (default "Colombia")
- Botones: Cancelar + Guardar
- Validación client-side: todos los required marcados con `required`
- Al editar, pre-poblar el formulario con los datos del customer
- Estado carga en botón Guardar: disabled + spinner mientras muta
- Al guardar éxito: cerrar Dialog + toast.success("Cliente creado/actualizado correctamente")
- Al guardar error: toast.error con mensaje del backend
- Si hay error de validación del backend (400), mostrar errores debajo de cada campo

### `components/customers-delete-dialog.tsx`
- `"use client"`
- shadcn `<AlertDialog>` (puede usarse Dialog con variante de confirmación)
- Props: `open: boolean`, `onOpenChange: (open: boolean) => void`, `customer: Customer`, `onConfirm: () => void`
- Mensaje: "¿Estás seguro de eliminar a {customer.name}?" con texto explicativo: "Esta acción desactivará el cliente. No se eliminarán sus datos."
- Botones: Cancelar + "Eliminar" (variant="destructive")
- Estado carga en botón Eliminar mientras muta
- Al confirmar con éxito: toast.success("Cliente eliminado correctamente")

## Hooks/Queries

Todos en `hooks/use-customers.ts`:

### `useCustomers(filters: CustomersFilters)`
- `useQuery` con queryKey: `["customers", filters]`
- `queryFn`: `api.get("/customers/", { params: filters })` → `data: PaginatedResponse<Customer>`
- Retorna `{ data, isLoading, isError, error }`
- `select` opcional para transformar respuesta si es necesario

### `useCustomer(id: number | null)`
- `useQuery` con queryKey: `["customers", id]`
- `enabled: !!id` (no ejecuta si id es null)
- `queryFn`: `api.get(\`/customers/${id}/\`)` → `data: Customer`

### `useCreateCustomer()`
- `useMutation`
- `mutationFn`: `(formData: CustomerFormData) => api.post("/customers/", formData)`
- `onSuccess`: invalida `["customers"]` query
- Retorna `{ mutate, isPending, error }`

### `useUpdateCustomer()`
- `useMutation`
- `mutationFn`: `({ id, data }: { id: number; data: Partial<CustomerFormData> }) => api.patch(\`/customers/${id}/\`, data)`
- Usar PATCH (partial update) en lugar de PUT
- `onSuccess`: invalida `["customers"]` query

### `useDeleteCustomer()`
- `useMutation`
- `mutationFn`: `(id: number) => api.delete(\`/customers/${id}/\`)`
- Soft delete: el backend setea `is_active = false`
- `onSuccess`: invalida `["customers"]` query
- Retorna `{ mutate, isPending, error }`

## Estados de UI

| Estado | Componente | Comportamiento |
|--------|------------|----------------|
| Loading (lista) | customers-table | 5 filas de Skeleton |
| Empty (lista) | customers-table | Mensaje "No se encontraron clientes" |
| Error (lista) | customers-table | Toast sonner con error |
| Loading (form save) | customers-form | Botón Guardar disabled + spinner |
| Error (form save) | customers-form | Toast con mensaje error + errores inline |
| Success (form save) | customers-form → close | Toast "Cliente creado/actualizado" + refetch lista |
| Loading (delete) | customers-delete-dialog | Botón Eliminar disabled + spinner |
| Success (delete) | customers-delete-dialog → close | Toast "Cliente eliminado" + refetch lista |
| Debounce (search) | page | 300ms delay antes de disparar query |

## Dependencias

- Auth (layout protegido, axios interceptor con Bearer token)
- shadcn/ui components ya instalados: button, input, label, select, dialog, table, skeleton, badge, sonner
- TanStack Query v5 (ya instalado)
- TanStack Table v8 (ya instalado)
- lucide-react (ya instalado) — iconos: Pencil, Trash2, Plus, ChevronLeft, ChevronRight, Search, Loader2
- No requiere nuevas dependencias npm

## Tareas

- [x] Crear `types/customers.ts` — interfaces Customer, CustomerFormData, PaginatedResponse, CustomersFilters
- [x] Crear `hooks/use-customers.ts` — 5 hooks: useCustomers, useCustomer, useCreateCustomer, useUpdateCustomer, useDeleteCustomer
- [x] Crear `components/customers-table.tsx` — TanStack Table con columnas, skeletons, paginación, estados
- [x] Crear `components/customers-form.tsx` — shadcn Dialog con formulario crear/editar
- [x] Crear `components/customers-delete-dialog.tsx` — shadcn AlertDialog con confirmación
- [x] Crear `app/customers/page.tsx` — página con filtros + toolbar + CustomersTable
- [x] Wire up: mutations invalidan queryKey "customers" en onSuccess
- [x] Verificar build con `npm run build`
