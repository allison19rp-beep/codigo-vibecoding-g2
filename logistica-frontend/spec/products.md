# Spec: Products

## Requisitos

- Página lista con TanStack Table (columnas: name, sku, category, supplier_name, unit_price, stock_quantity, actions)
- Filtros: search, category, supplier (select), warehouse (select), unit_price range, stock_quantity range
- Formulario crear/editar con shadcn Dialog
- Selects de supplier y warehouse cargados via TanStack Query desde la API
- SKU UNIQUE — mostrar error inline si el backend responde 400 por duplicado
- Confirmación de soft delete antes de ejecutar DELETE
- Paginación server-side con TanStack Query (20 items por página)
- TanStack Table con column headers, sorting client-side, y paginación integrada
- Estados: loading (skeleton), empty (mensaje "No se encontraron productos"), error (toast sonner)
- Precio formateado como moneda en tabla (ej: "$ 1,500.00")

## API Endpoints

| Método | Path | Descripción | Query Params |
|--------|------|-------------|-------------|
| GET | `/products/` | Listar (paginado) | `page`, `search`, `supplier`, `warehouse`, `category`, `unit_price_gte`, `unit_price_lte`, `stock_quantity_gte`, `ordering` |
| POST | `/products/` | Crear | — |
| GET | `/products/{id}/` | Obtener por ID | — |
| PUT | `/products/{id}/` | Actualizar completo | — |
| PATCH | `/products/{id}/` | Actualizar parcial | — |
| DELETE | `/products/{id}/` | Soft delete | — |

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
      "supplier": 1,
      "supplier_name": "Proveedor Ejemplo",
      "warehouse": 1,
      "warehouse_name": "Bodega Central",
      "name": "Laptop Pro",
      "sku": "LAP-001",
      "description": "Laptop de alta gama",
      "category": "laptop",
      "weight_kg": "2.500",
      "width_cm": "35.00",
      "height_cm": "2.50",
      "depth_cm": "25.00",
      "unit_price": "1500.00",
      "stock_quantity": 50,
      "is_active": true,
      "created_at": "2026-01-01T00:00:00Z",
      "updated_at": "2026-01-01T00:00:00Z"
    }
  ]
}
```

**Filtros disponibles:**
- `?supplier=1` — FK exacto
- `?warehouse=1` — FK exacto
- `?category=laptop` — exacto
- `?unit_price_gte=100&unit_price_lte=5000` — rango
- `?stock_quantity_gte=10` — mínimo
- `?search=termino` — búsqueda textual en name, sku, category, description
- `?page=1` — número de página

## Modelo

| Campo | Tipo | TypeScript | Notas |
|-------|------|------------|-------|
| id | BigAutoField | `number` | PK |
| supplier | FK → suppliers | `number` | NOT NULL, PROTECT |
| supplier_name | (read-only) | `string` | Devuelto por API, no se envía |
| warehouse | FK → warehouses | `number` | NOT NULL, PROTECT |
| warehouse_name | (read-only) | `string` | Devuelto por API, no se envía |
| name | CharField(255) | `string` | NOT NULL |
| sku | CharField(100) | `string` | UNIQUE, NOT NULL |
| description | TextField | `string \| null` | nullable |
| category | CharField(100) | `string` | NOT NULL, texto libre |
| weight_kg | DecimalField(8,3) | `string` | NOT NULL |
| width_cm | DecimalField(8,2) | `string` | NOT NULL |
| height_cm | DecimalField(8,2) | `string` | NOT NULL |
| depth_cm | DecimalField(8,2) | `string` | NOT NULL |
| unit_price | DecimalField(12,2) | `string` | NOT NULL |
| stock_quantity | IntegerField | `number` | default=0 |
| is_active | BooleanField | `boolean` | default=True, soft delete |
| created_at | DateTimeField | `string` (ISO) | auto_now_add |
| updated_at | DateTimeField | `string` (ISO) | auto_now |

## Tipos TypeScript

```typescript
// types/products.ts

interface Product {
  id: number
  supplier: number
  supplier_name: string
  warehouse: number
  warehouse_name: string
  name: string
  sku: string
  description: string | null
  category: string
  weight_kg: string
  width_cm: string
  height_cm: string
  depth_cm: string
  unit_price: string
  stock_quantity: number
  is_active: boolean
  created_at: string
  updated_at: string
}

interface ProductFormData {
  name: string
  sku: string
  description?: string
  category: string
  supplier: number
  warehouse: number
  unit_price: string
  stock_quantity: number
  weight_kg: string
  width_cm: string
  height_cm: string
  depth_cm: string
}

interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

interface ProductFilters {
  page: number
  search?: string
  supplier?: number | ""
  warehouse?: number | ""
  category?: string
  unit_price_gte?: string
  unit_price_lte?: string
  stock_quantity_gte?: number | ""
}
```

## Estructura de archivos

```
app/products/
  page.tsx              → lista con TanStack Table + filtros ("use client")

hooks/
  use-products.ts       → TanStack Query hooks (useProducts, useProduct, useCreateProduct, useUpdateProduct, useDeleteProduct)
                          + hooks para selects: useSuppliersList, useWarehousesList

types/
  products.ts           → interfaces Product, ProductFormData, ProductFilters

components/
  products-table.tsx    → TanStack Table component
  products-form.tsx     → Dialog con formulario crear/editar (shadcn)
  products-delete-dialog.tsx → Confirmación soft delete (shadcn AlertDialog)
```

## Componentes

### `app/products/page.tsx`
- `"use client"`
- Estado local para filtros: `search`, `category`, `supplier`, `warehouse`, `unit_price_gte`, `unit_price_lte`, `stock_quantity_gte`, `page`
- Renderiza filtros en un toolbar horizontal:
  - Input para `search` — shadcn `<Input>` con placeholder "Buscar por nombre, SKU, categoría..."
  - Input para `category` — shadcn `<Input>` con placeholder "Filtrar por categoría"
  - Select para `supplier` — cargado via `useSuppliersList()` (shadcn `<Select>`)
  - Select para `warehouse` — cargado via `useWarehousesList()` (shadcn `<Select>`)
  - Input pair para `unit_price` — "Precio desde" + "Precio hasta"
  - Input para `stock_quantity_gte` — "Stock mínimo"
  - Debounce en search (300ms)
- Pasa `filters` a `useProducts(filters)` hook
- Renderiza `<ProductsTable>` con data + página actual + total páginas
- Botón "Nuevo producto" que abre `<ProductsForm>` en modo creación
- Al crear/editar/eliminar con éxito, invalida query de lista con `queryClient.invalidateQueries({ queryKey: ["products"] })`

### `components/products-table.tsx`
- `"use client"`
- Recibe: `data: Product[]`, `totalPages: number`, `page: number`, `onPageChange: (page: number) => void`, `onEdit: (product: Product) => void`, `onDelete: (product: Product) => void`
- Crea instancia de TanStack Table con `useReactTable`:
  - **Columnas:**
    - `name` — nombre del producto
    - `sku` — SKU
    - `category` — categoría (badge: `bg-gray-100 text-gray-800`)
    - `supplier_name` — nombre del proveedor
    - `unit_price` — precio formateado como moneda: `new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP" })` o formato simple `$ ${price}`
    - `stock_quantity` — cantidad en stock
    - `actions` — botones editar (lápiz) y eliminar (basurero) con iconos de lucide-react
  - `manualPagination: true` (server-side), `pageCount: totalPages`
  - Sorting client-side
- Usa shadcn `<Table>`, `<TableHeader>`, `<TableBody>`, `<TableRow>`, `<TableCell>`
- Paginación con botones "Anterior"/"Siguiente" en el footer
- Estado vacío: mostrar mensaje "No se encontraron productos" centrado
- Estado carga: mostrar `<Skeleton>` rows (5 filas de esqueleto)

### `components/products-form.tsx`
- `"use client"`
- shadcn `<Dialog>` modal para crear/editar
- Props: `open: boolean`, `onOpenChange: (open: boolean) => void`, `product?: Product | null` (null = crear, Product = editar)
- Título dinámico: "Nuevo producto" / "Editar producto"
- Carga selects de supplier y warehouse via TanStack Query:
  - `useSuppliersList()` — obtiene lista plana de suppliers (sin paginación, todos los activos)
  - `useWarehousesList()` — obtiene lista plana de warehouses (sin paginación, todos los activos)
- Campos del formulario:
  - `name` — Input required
  - `sku` — Input required, mostrar error inline si ya existe (capturar 400 de backend)
  - `description` — Textarea opcional
  - `category` — Input required (texto libre, no select)
  - `supplier` — Select required, opciones cargadas desde API
  - `warehouse` — Select required, opciones cargadas desde API
  - `unit_price` — Input type="number" step="0.01" required
  - `stock_quantity` — Input type="number" step="1" required
  - `weight_kg` — Input type="number" step="0.001" required
  - `width_cm` — Input type="number" step="0.01" required
  - `height_cm` — Input type="number" step="0.01" required
  - `depth_cm` — Input type="number" step="0.01" required
- Botones: Cancelar + Guardar
- Validación client-side: todos los required marcados con `required`
- Al editar, pre-poblar el formulario con los datos del producto (incluyendo supplier y warehouse como ids)
- Estado carga en botón Guardar: disabled + spinner mientras muta
- Al guardar éxito: cerrar Dialog + toast.success("Producto creado/actualizado correctamente")
- Al guardar error: toast.error con mensaje del backend
- Si hay error de validación del backend (400), mostrar errores debajo de cada campo
- SKU duplicado: el backend retorna `{ "sku": ["product with this sku already exists."] }` — mostrar inline en campo SKU

### `components/products-delete-dialog.tsx`
- `"use client"`
- shadcn `<AlertDialog>` o `<Dialog>` con variante de confirmación
- Props: `open: boolean`, `onOpenChange: (open: boolean) => void`, `product: Product`, `onConfirm: () => void`
- Mensaje: "¿Estás seguro de eliminar {product.name}?" con texto explicativo: "Esta acción desactivará el producto. No se eliminarán sus datos."
- Botones: Cancelar + "Eliminar" (variant="destructive")
- Estado carga en botón Eliminar mientras muta
- Al confirmar con éxito: toast.success("Producto eliminado correctamente")

## Hooks/Queries

Todos en `hooks/use-products.ts`:

### `useProducts(filters: ProductFilters)`
- `useQuery` con queryKey: `["products", filters]`
- `queryFn`: `api.get("/products/", { params: filters })` → `data: PaginatedResponse<Product>`
- Retorna `{ data, isLoading, isError, error }`

### `useProduct(id: number | null)`
- `useQuery` con queryKey: `["products", id]`
- `enabled: !!id`
- `queryFn`: `api.get(\`/products/${id}/\`)` → `data: Product`

### `useCreateProduct()`
- `useMutation`
- `mutationFn`: `(formData: ProductFormData) => api.post("/products/", formData)`
- `onSuccess`: invalida `["products"]` query
- Retorna `{ mutate, isPending, error }`

### `useUpdateProduct()`
- `useMutation`
- `mutationFn`: `({ id, data }: { id: number; data: Partial<ProductFormData> }) => api.patch(\`/products/${id}/\`, data)`
- Usar PATCH (partial update)
- `onSuccess`: invalida `["products"]` query

### `useDeleteProduct()`
- `useMutation`
- `mutationFn`: `(id: number) => api.delete(\`/products/${id}/\`)`
- Soft delete: backend setea `is_active = false`
- `onSuccess`: invalida `["products"]` query
- Retorna `{ mutate, isPending, error }`

### Hooks para selects:

### `useSuppliersList()`
- `useQuery` con queryKey: `["suppliers", "all"]`
- `queryFn`: `api.get("/suppliers/")` → obtiene todos los proveedores activos
- Retorna `{ data, isLoading }` — data es `PaginatedResponse<Supplier>`
- Usado en el formulario para llenar el select de proveedor
- Transformar `data?.results` para opciones del select: `{ value: supplier.id, label: supplier.name }`

### `useWarehousesList()`
- `useQuery` con queryKey: `["warehouses", "all"]`
- `queryFn`: `api.get("/warehouses/")` → obtiene todos los almacenes activos
- Retorna `{ data, isLoading }` — data es `PaginatedResponse<Warehouse>`
- Usado en el formulario para llenar el select de almacén
- Transformar `data?.results` para opciones del select: `{ value: warehouse.id, label: warehouse.name }`

## Estados de UI

| Estado | Componente | Comportamiento |
|--------|------------|----------------|
| Loading (lista) | products-table | 5 filas de Skeleton |
| Empty (lista) | products-table | Mensaje "No se encontraron productos" |
| Error (lista) | products-table | Toast sonner con error |
| Loading (form save) | products-form | Botón Guardar disabled + spinner |
| Error (form save) | products-form | Toast con mensaje error + errores inline |
| Success (form save) | products-form → close | Toast "Producto creado/actualizado" + refetch lista |
| Loading (delete) | products-delete-dialog | Botón Eliminar disabled + spinner |
| Success (delete) | products-delete-dialog → close | Toast "Producto eliminado" + refetch lista |
| Debounce (search) | page | 300ms delay antes de disparar query |
| Loading (selects) | products-form | Selects disabled con texto "Cargando..." |
| SKU duplicate error | products-form | Error inline debajo del campo SKU |

## Dependencias

- Auth (layout protegido, axios interceptor con Bearer token)
- shadcn/ui components ya instalados: button, input, label, select, dialog, table, skeleton, badge, sonner, textarea
- TanStack Query v5 (ya instalado)
- TanStack Table v8 (ya instalado)
- lucide-react (ya instalado) — iconos: Pencil, Trash2, Plus, ChevronLeft, ChevronRight, Search, Loader2
- Tipos Supplier y Warehouse ya existen en `types/suppliers.ts` y `types/warehouses.ts`
- No requiere nuevas dependencias npm

## Tareas

- [ ] Crear `types/products.ts` — interfaces Product, ProductFormData, PaginatedResponse, ProductFilters
- [ ] Crear `hooks/use-products.ts` — 5 hooks CRUD + 2 hooks para selects (suppliers, warehouses)
- [ ] Crear `components/products-table.tsx` — TanStack Table con columnas, skeletons, paginación, price formateado
- [ ] Crear `components/products-form.tsx` — shadcn Dialog con selects de supplier/warehouse via API
- [ ] Crear `components/products-delete-dialog.tsx` — shadcn AlertDialog con confirmación
- [ ] Crear `app/products/page.tsx` — página con filtros + toolbar + ProductsTable
- [ ] Wire up: mutations invalidan queryKey "products" en onSuccess
- [ ] Verificar build con `npm run build`
