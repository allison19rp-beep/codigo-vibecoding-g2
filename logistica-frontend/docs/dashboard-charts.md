# Dashboard — Propuesta de Gráficos

## Stack
- **Tremor** v3.18.7 (`@tremor/react`) — componentes de gráficos basados en Recharts
- **TanStack Query** — data fetching con caching automático
- **Axios** — cliente HTTP

## Charts disponibles en Tremor
| Componente | Uso |
|---|---|
| `AreaChart` | Series temporales (volumen de envíos por mes) |
| `BarChart` | Comparaciones (composición de flota, productos por categoría) |
| `DonutChart` | Distribuciones (shipments por status, customers por tipo) |
| `LineChart` | Tendencias (similar a AreaChart, variante con líneas) |
| `ScatterChart` | Correlaciones (costo vs peso de envíos) |
| `FunnelChart` | Embudos (progreso de shipments PENDING → DELIVERED) |

---

## 1. KPIs — Resumen ejecutivo (4 cards)

| KPI | Endpoint | Filtro |
|-----|----------|--------|
| Clientes activos | `GET /customers/` | `?is_active=true` |
| Envíos en tránsito | `GET /shipments/` | `?status=IN_TRANSIT` |
| Transporte disponible | `GET /transport/` | `?is_available=true` |
| Conductores activos | `GET /drivers/` | `?is_active=true` |

**Visualización:** 4 cards con shadcn `<Card>`, número grande + label + icono.

**Filtros:** Global de fecha (opcional — filtra por `created_at` del registro).

---

## 2. Envíos por Estado (DonutChart)

**Propósito:** Ver la distribución de todos los envíos según su estado actual.

**Endpoint:** `GET /shipments/?page=1&page_size=100`

**Agregación client-side:** Agrupar `results` por `status`.

```
PENDING     →  12  (15%)
CONFIRMED   →   8  (10%)
IN_TRANSIT  →  25  (31%)
DELIVERED   →  30  (38%)
CANCELLED   →   3  (4%)
RETURNED    →   2  (2%)
```

**Filtros:**
- Rango de fechas (created_at desde / hasta) — client-side
- Cliente (customer_id) — si el endpoint lo soporta

---

## 3. Envíos por Mes (AreaChart o BarChart)

**Propósito:** Visualizar la tendencia de envíos creados en el tiempo.

**Endpoint:** `GET /shipments/?ordering=created_at`

**Agregación client-side:** Agrupar `results` por mes de `created_at`.

```
Ene 2026 → 15 envíos
Feb 2026 → 22 envíos
Mar 2026 → 18 envíos
...

```

**Filtros:**
- Rango de fechas
- Status (ej: solo DELIVERED)

---

## 4. Composición de Flota (BarChart o DonutChart)

**Propósito:** Ver cuántos vehículos hay de cada tipo.

**Endpoint:** `GET /transport/`

**Agregación client-side:** Agrupar `results` por `transport_type`.

```
TRUCK       → 8
VAN         → 12
MOTORCYCLE  → 5
CARGO_BIKE  → 3
```

**Filtros:**
- Disponibilidad (`is_available`)
- Rango de capacidad

---

## 5. Clientes por Tipo (DonutChart)

**Propósito:** Proporción de empresas vs individuos.

**Endpoint:** `GET /customers/`

**Agregación client-side:** Agrupar `results` por `customer_type`.

```
COMPANY    → 45  (60%)
INDIVIDUAL → 30  (40%)
```

**Filtros:**
- Ciudad
- Rango de fechas (created_at)

---

## 6. Productos: Stock Bajo (Horizontal BarChart)

**Propósito:** Identificar productos con stock crítico.

**Endpoint:** `GET /products/?ordering=stock_quantity`

**Visualización:** Top 10 productos con menor stock.

**Filtros:**
- Categoría
- Almacén (warehouse_id)

---

## 7. Embudo de Envíos (FunnelChart)

**Propósito:** Ver la conversión de envíos a través del pipeline logístico.

**Agregación client-side:** Contar shipments por status en orden secuencial.

```
PENDING    → 40
CONFIRMED  → 32  (80% conversion)
IN_TRANSIT → 25  (62%)
DELIVERED  → 20  (50%)
```

**Filtros:** Rango de fechas, cliente, conductor.

---

## 8. Activos Totales (BarChart agrupado)

**Propósito:** Comparar recursos activos vs inactivos.

**Endpoints:**
- `GET /customers/` → activos vs inactivos
- `GET /drivers/` → activos vs inactivos
- `GET /warehouses/` → activos vs inactivos
- `GET /routes/` → activos vs inactivos

**Visualización:** BarChart agrupado con 2 barras por módulo (Activo / Inactivo).

---

## Filtros Globales del Dashboard

| Filtro | Tipo | Aplica a |
|--------|------|----------|
| Rango de fechas | DatePicker (desde / hasta) | Envíos, Clientes (creados en el período) |
| Status | Select múltiple | Envíos |
| Tipo de cliente | Select | Clientes |
| Tipo de transporte | Select | Transporte |

---

## Implementación Técnica

### Estructura de archivos propuesta

```
hooks/
  use-dashboard.ts          → hook principal que agrupa todos los queries del dashboard

components/dashboard/
  kpi-cards.tsx              → 4 cards de resumen
  shipments-status-chart.tsx → DonutChart de envíos por estado
  shipments-trend-chart.tsx  → AreaChart de envíos por mes
  fleet-composition.tsx      → BarChart de tipo de vehículos
  customers-by-type.tsx      → DonutChart de clientes por tipo
  low-stock-products.tsx     → BarChart de productos con bajo stock
  shipment-funnel.tsx        → FunnelChart de pipeline de envíos
  active-resources.tsx       → BarChart agrupado activos/inactivos
  dashboard-filters.tsx      → Toolbar de filtros globales

app/dashboard/
  page.tsx                   → Dashboard completo con filtros + grids de charts
```

### Data flow
1. `dashboard-filters.tsx` mantiene estado de filtros (fecha desde/hasta, status, etc.)
2. `use-dashboard.ts` recibe filtros como parámetros
3. Cada query se ejecuta con TanStack Query y se agrega client-side
4. Los charts se renderizan con los datos ya agregados

### Nota sobre agregación client-side
Actualmente el backend no expone endpoints de agregación/estadísticas. Para el MVP se hará agregación en el frontend (datasets pequeños esperados). Para producción, se recomienda agregar endpoints `@action` en Django REST Framework:

```
GET /api/v1/shipments/stats/by_status/
GET /api/v1/shipments/stats/by_month/?year=2026
GET /api/v1/dashboard/summary/
```

### Ejemplo de hook con agregación

```typescript
// hooks/use-dashboard.ts
export function useDashboardStats(filters: DashboardFilters) {
  const shipments = useQuery({
    queryKey: ["dashboard", "shipments", filters],
    queryFn: () => api.get("/shipments/").then(r => r.data.results),
  })

  const customers = useQuery({
    queryKey: ["dashboard", "customers", filters],
    queryFn: () => api.get("/customers/").then(r => r.data.results),
  })

  // ... más queries ...

  // Agregaciones
  const shipmentsByStatus = useMemo(() => {
    if (!shipments.data) return []
    const grouped = groupBy(shipments.data, "status")
    return Object.entries(grouped).map(([status, items]) => ({
      name: status,
      value: items.length,
    }))
  }, [shipments.data])

  // ... más agregaciones ...

  return {
    kpis,
    shipmentsByStatus,
    shipmentsByMonth,
    fleetComposition,
    customersByType,
    // ...
  }
}
```

## Prioridades

| Prioridad | Chart | Esfuerzo | Impacto |
|-----------|-------|----------|---------|
| P1 | KPIs cards | Bajo | Alto |
| P1 | Envíos por estado (Donut) | Bajo | Alto |
| P1 | Envíos por mes (Area) | Medio | Alto |
| P2 | Composición de flota (Bar) | Bajo | Medio |
| P2 | Clientes por tipo (Donut) | Bajo | Medio |
| P3 | Stock bajo (Bar) | Medio | Bajo |
| P3 | Embudo de envíos (Funnel) | Medio | Medio |
| P3 | Activos vs Inactivos (Bar) | Bajo | Bajo |
