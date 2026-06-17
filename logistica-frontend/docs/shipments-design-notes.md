# Shipments — Design Notes (pre-spec)

## Driver Select

El form de Shipments debe cargar conductores activos via `GET /drivers/?is_active=true`.
El Select debe mostrar `user_full_name` como label.

**Problema reportado:** "No deja colocar el conductor cuando existe un conductor."
Posible causa: el select filtraba por transport u otro criterio restrictivo.

**Fix:** Usar query sin filtro extra además de `is_active=true`. Usar patrón `SelectValue` con render function:

```tsx
<SelectValue>
  {(value) => {
    if (!value) return null
    const d = drivers.find(x => String(x.id) === value)
    return d ? d.user_full_name : value
  }}
</SelectValue>
```

## Cost Calculation

El modelo Shipment tiene:
- `base_cost` (DecimalField, default=0) — costo base del envío
- `calculated_cost` (DecimalField, default=0) — costo total calculado

El backend calcula `calculated_cost` automáticamente como:
`calculated_cost = base_cost + sum(item.subtotal for item in items)`

Donde `item.subtotal = quantity * unit_price_at_time`.

Se debe mostrar en la UI:
- El detalle del cálculo (base_cost + items list)
- El total (calculated_cost) como campo de solo lectura
- Un tooltip o label que explique: "Costo calculado = costo base + suma de subtotales de items"
