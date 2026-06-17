# Routes — Errores de validación

## Error 1: Falta Sección de Paradas en `routes-form.tsx`

**Archivo:** `components/routes-form.tsx`

**Spec referencia:** líneas 239-253

**Problema:** El formulario no implementa la Sección 2 "Paradas" (route_stops). Según el spec:
- Tabla con columnas: `stop_order`, `address`, `city`, `estimated_offset_hours`, `actions`
- Botón "Agregar parada" que añade fila vacía editable
- Inputs inline para address, city, estimated_offset_hours, latitude, longitude
- Cargar paradas existentes via `useRouteStops(route.id)` en modo edición
- Crear paradas via `useCreateRouteStop(routeId)` después de crear la ruta
- Estado loading para stops (spinner)

**Impacto:** La gestión de paradas no está disponible. Funcionalidad incompleta.

---

## Error 2: Props de `RoutesForm` no coinciden con spec

**Archivo:** `components/routes-form.tsx`

**Spec referencia:** línea 232

**Problema:** El spec define la prop `warehouses: Warehouse[]` para pasar la lista de warehouses desde el page. La implementación actual no recibe `warehouses` como prop sino que fetchea internamente via `useWarehouseList()`.

**Impacto:** Menor. Funcionalmente equivalente. Sin embargo, el componente tiene acoplamiento directo al hook en lugar de recibir datos por prop como dicta el spec.
