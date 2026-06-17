# Spec: Dashboard

## Requisitos

- Dashboard con datos reales de la API (reemplazar placeholder estático actual)
- 5 gráficos estadísticos con Tremor (P1 + P2)
- KPIs en cards con shadcn Card
- Filtros globales (rango de fechas, status de envío)
- Todo el cómputo agregado client-side (no hay endpoints de agregación en backend)
- Estados: loading (skeletons), error (toast sonner), empty

## API Endpoints

| Método | Path | Descripción | Query Params | Uso en dashboard |
|--------|------|-------------|-------------|-----------------|
| GET | `/shipments/` | Listar envíos | `?page=1&page_size=100`, `?status=`, `?ordering=` | Envíos por estado (Donut), envíos por mes (Area), KPI "en tránsito" |
| GET | `/customers/` | Listar clientes | `?is_active=true`, `?customer_type=` | Clientes por tipo (Donut), KPI "clientes activos" |
| GET | `/transport/` | Listar transporte | `?is_available=true` | Composición flota (Bar), KPI "transporte disponible" |
| GET | `/drivers/` | Listar conductores | `?is_active=true` | KPI "conductores activos" |

**Base URL:** `http://localhost:8000/api/v1/` (ya configurado en `lib/axios.ts`)

### GET /shipments/
```json
{
  "count": 342,
  "next": "http://.../?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "tracking_number": "ABC123DEF456",
      "customer": 1,
      "customer_name": "Cliente Ejemplo",
      "driver": null,
      "transport": null,
      "route": null,
      "origin_warehouse": 1,
      "origin_warehouse_name": "Bodega Central",
      "destination_address": "Calle 456",
      "destination_city": "Medellín",
      "destination_country": "Colombia",
      "status": "IN_TRANSIT",
      "estimated_delivery_date": "2026-06-01",
      "actual_delivery_date": null,
      "weight_total_kg": "150.000",
      "base_cost": "500.00",
      "calculated_cost": "750.00",
      "notes": null,
      "created_at": "2026-05-15T10:30:00Z",
      "updated_at": "2026-05-15T10:30:00Z"
    }
  ]
}
```

### GET /customers/
```json
{
  "count": 128,
  "next": null,
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

### GET /transport/
```json
{
  "count": 28,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "plate_number": "ABC-123",
      "transport_type": "TRUCK",
      "brand": "Toyota",
      "model": "Hilux",
      "year": 2024,
      "capacity_kg": "1500.00",
      "capacity_m3": "8.00",
      "is_available": true,
      "created_at": "2026-01-15T00:00:00Z",
      "updated_at": "2026-01-15T00:00:00Z"
    }
  ]
}
```

### GET /drivers/
```json
{
  "count": 15,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "user": 5,
      "user_full_name": "Juan Pérez",
      "user_email": "juan@example.com",
      "user_username": "juanperez",
      "transport": 1,
      "transport_plate": "ABC-123",
      "license_number": "LIC-001",
      "license_expiry": "2027-01-01",
      "phone": "+571234567890",
      "is_active": true,
      "created_at": "2026-01-10T00:00:00Z",
      "updated_at": "2026-01-10T00:00:00Z"
    }
  ]
}
```

## Tipos TypeScript

```typescript
// types/dashboard.ts — tipos para los datos agregados del dashboard

type ShipmentStatus = "PENDING" | "CONFIRMED" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED" | "RETURNED"
type CustomerType = "COMPANY" | "INDIVIDUAL"
type TransportType = "TRUCK" | "VAN" | "MOTORCYCLE" | "CARGO_BIKE"

interface KpiData {
  clientesActivos: number
  enviosEnTransito: number
  transporteDisponible: number
  conductoresActivos: number
}

interface ChartDataItem {
  name: string
  value: number
}

interface ShipmentTrendItem {
  date: string
  envios: number
}

interface FleetItem {
  name: string
  cantidad: number
}

interface DashboardFilters {
  dateFrom: string
  dateTo: string
  status: ShipmentStatus | ""
}

// Tipos de respuesta de API (reutilizados de otros specs)
interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}
```

## Estructura de archivos

```
hooks/
  use-dashboard.ts              → hook principal con queries paralelas + agregaciones client-side

components/dashboard/
  kpi-cards.tsx                 → 4 cards con KPIs reales (shadcn Card + lucide icons)
  shipments-status-chart.tsx    → Tremor DonutChart envíos por estado
  shipments-trend-chart.tsx     → Tremor AreaChart envíos por mes
  fleet-composition.tsx         → Tremor BarChart composición de flota
  customers-by-type.tsx         → Tremor DonutChart clientes por tipo
  dashboard-filters.tsx         → Toolbar de filtros globales (fecha desde/hasta, status)

app/dashboard/
  page.tsx                      → Dashboard completo (reemplazar placeholder)
```

## Componentes

### `hooks/use-dashboard.ts`

Hook principal que ejecuta 4 queries en paralelo con `useQueries` o 4 `useQuery` individuales y realiza agregaciones client-side con `useMemo`.

**Queries:**
- `shipmentsQuery`: `GET /shipments/?page=1&page_size=100` (o con filtro status)
- `customersQuery`: `GET /customers/` (todos, sin paginación o page_size=100)
- `transportQuery`: `GET /transport/`
- `driversQuery`: `GET /drivers/`

**Filtros:**
- Recibe `filters: DashboardFilters` como parámetro
- Si `filters.dateFrom` o `filters.dateTo` están seteados, filtrar shipments client-side por `created_at`
- Si `filters.status` está seteado, pasar `?status=` al endpoint de shipments

**Agregaciones (useMemo):**

1. `kpis: KpiData`
   - `clientesActivos`: `customers.data?.results.filter(c => c.is_active).length ?? 0`
   - `enviosEnTransito`: `shipments.data?.results.filter(s => s.status === "IN_TRANSIT").length ?? 0`
   - `transporteDisponible`: `transport.data?.results.filter(t => t.is_available).length ?? 0`
   - `conductoresActivos`: `drivers.data?.results.filter(d => d.is_active).length ?? 0`

2. `shipmentsByStatus: ChartDataItem[]`
   - Agrupar `shipments.data.results` por `status`
   - Formato: `[{ name: "PENDING", value: 12 }, { name: "DELIVERED", value: 30 }, ...]`
   - Orden fijo: PENDING, CONFIRMED, IN_TRANSIT, DELIVERED, CANCELLED, RETURNED

3. `shipmentsByMonth: ShipmentTrendItem[]`
   - Agrupar `shipments.data.results` por mes de `created_at` (formato "YYYY-MM")
   - Formato: `[{ date: "2026-01", envios: 15 }, { date: "2026-02", envios: 22 }, ...]`
   - Orden cronológico ascendente

4. `fleetComposition: FleetItem[]`
   - Agrupar `transport.data.results` por `transport_type`
   - Formato: `[{ name: "TRUCK", cantidad: 8 }, { name: "VAN", cantidad: 12 }, ...]`

5. `customersByType: ChartDataItem[]`
   - Agrupar `customers.data.results` por `customer_type`
   - Formato: `[{ name: "COMPANY", value: 45 }, { name: "INDIVIDUAL", value: 30 }]`

**Retorno:**
```typescript
interface UseDashboardReturn {
  kpis: KpiData
  shipmentsByStatus: ChartDataItem[]
  shipmentsByMonth: ShipmentTrendItem[]
  fleetComposition: FleetItem[]
  customersByType: ChartDataItem[]
  isLoading: boolean
  isError: boolean
  error: Error | null
  refetch: () => void
}
```

**Consideraciones:**
- Usar `enabled: false` si no hay filtros obligatorios — todas las queries se disparan al montar
- Si alguna query individual falla, mostrar toast de error pero no bloquear todo el dashboard
- Idealmente usar `Promise.allSettled` pattern o manejo individual de errores
- Colores para DonutChart de status: `{ PENDING: "#EAB308", CONFIRMED: "#3B82F6", IN_TRANSIT: "#F97316", DELIVERED: "#22C55E", CANCELLED: "#EF4444", RETURNED: "#6B7280" }`

---

### `components/dashboard/kpi-cards.tsx`

**Props:**
```typescript
interface KpiCardsProps {
  data: KpiData
  isLoading: boolean
}
```

**Cards (4):**

| KPI | Icono lucide | Color icono | Fuente de datos |
|-----|-------------|-------------|-----------------|
| Clientes activos | `Users` | blue | `kpis.clientesActivos` |
| Envíos en tránsito | `Truck` | orange | `kpis.enviosEnTransito` |
| Transporte disponible | `Bus` | green | `kpis.transporteDisponible` |
| Conductores activos | `IdCard` | purple | `kpis.conductoresActivos` |

**Layout:** `<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">`

**Cada card:**
- shadcn `<Card size="sm">`
- `<CardHeader>` con icono (lucide, 20px, color correspondiente) + `<CardTitle className="text-3xl">{value}</CardTitle>`
- `<CardDescription>` con label del KPI
- **Loading:** mostrar `<Skeleton className="h-8 w-20" />` en lugar del valor
- **Error:** mostrar "--" en el valor

---

### `components/dashboard/shipments-status-chart.tsx`

**Props:**
```typescript
interface ShipmentsStatusChartProps {
  data: ChartDataItem[]
  isLoading: boolean
}
```

**Componente:**
- Tremor `<DonutChart>`
- Título: "Envíos por estado" en `<CardTitle>`
- Datos: `data: ChartDataItem[]` (name, value)
- Colores por status (hardcodeados en el componente):
  ```typescript
  const statusColors: Record<string, string> = {
    PENDING: "yellow",
    CONFIRMED: "blue",
    IN_TRANSIT: "orange",
    DELIVERED: "green",
    CANCELLED: "red",
    RETURNED: "gray",
  }
  ```
- Usar `colors` prop de DonutChart con los colores de Tremor correspondientes
- Agregar leyenda debajo del gráfico con los nombres de status legibles (PENDING → "Pendiente", etc.)
- Tooltip personalizado con cantidad y porcentaje

**Loading:** `<Skeleton className="h-[250px] w-full rounded-xl" />`
**Empty:** Mensaje "No hay envíos registrados"

---

### `components/dashboard/shipments-trend-chart.tsx`

**Props:**
```typescript
interface ShipmentsTrendChartProps {
  data: ShipmentTrendItem[]
  isLoading: boolean
}
```

**Componente:**
- Tremor `<AreaChart>`
- Título: "Envíos por mes" en `<CardTitle>`
- Datos: `data: ShipmentTrendItem[]` (date, envios)
- Config:
  - `index="date"`
  - `categories={["envios"]}`
  - `colors={["blue"]}`
  - `showLegend={false}`
  - `showAnimation={true}`
  - `curveType="monotone"`
- Tooltip con valor exacto + mes

**Loading:** `<Skeleton className="h-[250px] w-full rounded-xl" />`
**Empty:** Mensaje "No hay datos de envíos por mes"

---

### `components/dashboard/fleet-composition.tsx`

**Props:**
```typescript
interface FleetCompositionProps {
  data: FleetItem[]
  isLoading: boolean
}
```

**Componente:**
- Tremor `<BarChart>`
- Título: "Composición de flota" en `<CardTitle>`
- Datos: `data: FleetItem[]` (name, cantidad)
- Config:
  - `index="name"`
  - `categories={["cantidad"]}`
  - `colors={["indigo"]}`
  - `showLegend={false}`
  - `layout="vertical"` (barras horizontales para mejor legibilidad)
- Labels en español: TRUCK → "Camión", VAN → "Camioneta", MOTORCYCLE → "Moto", CARGO_BIKE → "Bici"

**Loading:** `<Skeleton className="h-[250px] w-full rounded-xl" />`
**Empty:** Mensaje "No hay vehículos registrados"

---

### `components/dashboard/customers-by-type.tsx`

**Props:**
```typescript
interface CustomersByTypeProps {
  data: ChartDataItem[]
  isLoading: boolean
}
```

**Componente:**
- Tremor `<DonutChart>`
- Título: "Clientes por tipo" en `<CardTitle>`
- Datos: `data: ChartDataItem[]` (name, value)
- Colors: `{ COMPANY: "emerald", INDIVIDUAL: "cyan" }`
- Labels en español en leyenda
- Tooltip con cantidad y porcentaje

**Loading:** `<Skeleton className="h-[250px] w-full rounded-xl" />`
**Empty:** Mensaje "No hay clientes registrados"

---

### `components/dashboard/dashboard-filters.tsx`

**Props:**
```typescript
interface DashboardFiltersProps {
  filters: DashboardFilters
  onFiltersChange: (filters: DashboardFilters) => void
}
```

**Componente:**
- Toolbar horizontal con flex/gap
- **Date inputs:**
  - `<input type="date">` para "Desde" con label
  - `<input type="date">` para "Hasta" con label
- **Status Select:**
  - shadcn `<Select>` con opciones: "Todos", "Pendiente", "Confirmado", "En tránsito", "Entregado", "Cancelado", "Devuelto"
  - Valores: "", PENDING, CONFIRMED, IN_TRANSIT, DELIVERED, CANCELLED, RETURNED
- **Botón:** "Aplicar filtros" (ejecuta callback con los filtros actuales)
- **Estado local:** el componente mantiene su propio estado interno y solo propaga cuando se hace clic en "Aplicar"
- **Responsive:** en mobile, apilar verticalmente

---

### `app/dashboard/page.tsx`

Reemplazar el placeholder actual con:

```tsx
"use client"

import { useDashboard } from "@/hooks/use-dashboard"
import { DashboardFilters } from "@/components/dashboard/dashboard-filters"
import { KpiCards } from "@/components/dashboard/kpi-cards"
import { ShipmentsStatusChart } from "@/components/dashboard/shipments-status-chart"
import { ShipmentsTrendChart } from "@/components/dashboard/shipments-trend-chart"
import { FleetComposition } from "@/components/dashboard/fleet-composition"
import { CustomersByType } from "@/components/dashboard/customers-by-type"
// ... estado local de filtros, manejo de errores con toast, layout grid
```

**Layout de grid:**

```
┌─────────────────────────────────────────────────┐
│  [Dashboard Filters Toolbar]                     │
├──────────┬──────────┬──────────┬─────────────────┤
│ KPI Card  │ KPI Card │ KPI Card │ KPI Card        │  ← row 1: 4 cols lg, 2 sm, 1 default
├─────────────────────┬───────────────────────────┤
│ DonutChart          │ AreaChart                  │  ← row 2: 2 cols lg, 1 sm
│ Envíos por estado   │ Envíos por mes             │
├─────────────────────┼───────────────────────────┤
│ BarChart            │ DonutChart                 │  ← row 3: 2 cols lg, 1 sm
│ Composición flota   │ Clientes por tipo          │
└─────────────────────┴───────────────────────────┘
```

**Estados:**
- **Loading global:** mostrar skeletons en todas las cards y charts
- **Error:** `<Sonner toast>` con mensaje de error, mantener UI con "--" en KPIs y charts vacíos
- **Empty:** cada chart maneja su propio empty state internamente

**Filtros:**
- Estado local `filters: DashboardFilters` con defaults: `{ dateFrom: "", dateTo: "", status: "" }`
- Pasar a `useDashboard(filters)`
- Pasar a `<DashboardFilters>` con onChange que actualiza estado local y dispara refetch

## Hooks/Queries

### `useDashboard(filters: DashboardFilters)`

| Query | Query Key | Endpoint | Dependencia |
|-------|-----------|----------|-------------|
| shipments | `["dashboard", "shipments", filters]` | `GET /shipments/?page=1&page_size=100` | filters (para status) |
| customers | `["dashboard", "customers"]` | `GET /customers/` | none (filtro fecha es client-side) |
| transport | `["dashboard", "transport"]` | `GET /transport/` | none |
| drivers | `["dashboard", "drivers"]` | `GET /drivers/` | none |

Todas las queries se ejecutan en paralelo. Usar 4 `useQuery` individuales.

**Agregaciones:** 5 `useMemo` (kpis, shipmentsByStatus, shipmentsByMonth, fleetComposition, customersByType).

**Filtrado client-side por fecha:**
```typescript
const filteredShipments = useMemo(() => {
  if (!shipments.data?.results) return []
  let list = shipments.data.results
  if (filters.dateFrom) {
    const from = new Date(filters.dateFrom)
    list = list.filter(s => new Date(s.created_at) >= from)
  }
  if (filters.dateTo) {
    const to = new Date(filters.dateTo)
    to.setHours(23, 59, 59, 999)
    list = list.filter(s => new Date(s.created_at) <= to)
  }
  return list
}, [shipments.data, filters.dateFrom, filters.dateTo])
```

## Estados de UI

| Estado | Componente | Comportamiento |
|--------|------------|----------------|
| Loading | kpi-cards | Skeleton en cada valor numérico |
| Loading | shipments-status-chart | Skeleton rectángulo 250px |
| Loading | shipments-trend-chart | Skeleton rectángulo 250px |
| Loading | fleet-composition | Skeleton rectángulo 250px |
| Loading | customers-by-type | Skeleton rectángulo 250px |
| Empty | shipments-status-chart | Texto "No hay envíos registrados" |
| Empty | shipments-trend-chart | Texto "No hay datos de envíos por mes" |
| Empty | fleet-composition | Texto "No hay vehículos registrados" |
| Empty | customers-by-type | Texto "No hay clientes registrados" |
| Error (global) | page | Sonner toast con mensaje de error |
| Error (individual KPI) | kpi-cards | Mostrar "--" en lugar del valor |

## Dependencias

- Auth (layout protegido, axios interceptor con Bearer token)
- `@tremor/react` v3.18.7 (ya instalado) — DonutChart, BarChart, AreaChart
- TanStack Query v5 (ya instalado) — useQuery, useMemo
- shadcn/ui: Card, Skeleton (ya instalados)
- lucide-react (ya instalado) — Users, Truck, Bus, IdCard icons
- `@/lib/axios` — cliente HTTP configurado
- `@/lib/utils` — función `cn()`
- sonner (ya instalado) — toasts de error

## Tareas

- [x] Crear `types/dashboard.ts` — interfaces KpiData, ChartDataItem, ShipmentTrendItem, FleetItem, DashboardFilters
- [x] Crear `hooks/use-dashboard.ts` — hook con 4 useQuery paralelos + 5 useMemo de agregación
- [x] Crear `components/dashboard/kpi-cards.tsx` — 4 cards con iconos, skeletons, loading/error states
- [x] Crear `components/dashboard/shipments-status-chart.tsx` — DonutChart con colores por status
- [x] Crear `components/dashboard/shipments-trend-chart.tsx` — AreaChart de envíos agrupados por mes
- [x] Crear `components/dashboard/fleet-composition.tsx` — BarChart horizontal de tipos de vehículo
- [x] Crear `components/dashboard/customers-by-type.tsx` — DonutChart de COMPANY vs INDIVIDUAL
- [x] Crear `components/dashboard/dashboard-filters.tsx` — Toolbar con date inputs + status select
- [x] Modificar `app/dashboard/page.tsx` — layout grid con filtros + KPIs + 4 charts
- [x] Verificar build con `npm run build`
