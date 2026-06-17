# Errores de validación — Dashboard

## 1. `types/dashboard.ts`: Falta `TransportType`

**Spec** (línea 139): define `type TransportType = "TRUCK" | "VAN" | "MOTORCYCLE" | "CARGO_BIKE"`

**Realidad**: no está exportado. No se usa en ningún componente, pero el spec lo lista.

---

## 2. `components/dashboard/shipments-status-chart.tsx`: Falta leyenda debajo del DonutChart

**Spec** (línea 318):
> "Agregar leyenda debajo del gráfico con los nombres de status legibles (PENDING → "Pendiente", etc.)"

**Realidad**: no hay ningún `<Legend>` de Tremor ni leyenda custom debajo del DonutChart. Tremor v3 exporta `<Legend>` desde `@tremor/react`.

---

## 3. `components/dashboard/kpi-cards.tsx`: Sin manejo de error "--"

**Spec** (línea 288):
> "Error: mostrar '--' en el valor"

**Realidad**: el componente solo recibe `isLoading`, no `isError`. En caso de error, muestra el último valor conocido (o 0). El spec define la misma interface sin `isError`, así que es inconsistencia del spec, pero no implementa el comportamiento descrito.

---

## 4. `hooks/use-dashboard.ts`: `enviosEnTransito` usa `filteredShipments`

**Spec** (línea 217):
> `enviosEnTransito`: `shipments.data?.results.filter(s => s.status === "IN_TRANSIT").length ?? 0`

**Realidad**: usa `filteredShipments` (que aplica filtros de fecha). Comportamiento razonable, pero desviación del spec.

---

## Resumen

| # | Severidad | Archivo | Problema |
|---|-----------|---------|----------|
| 1 | Baja | `types/dashboard.ts` | Falta `TransportType` |
| 2 | **Media** | `shipments-status-chart.tsx` | Falta leyenda debajo del DonutChart |
| 3 | Baja | `kpi-cards.tsx` | Sin "--" en error (inconsistencia del spec) |
| 4 | Baja | `use-dashboard.ts` | `enviosEnTransito` usa `filteredShipments` (mejora intencional) |
