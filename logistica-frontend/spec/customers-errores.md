# Errores de validación — Módulo Customers

## 1. Sorting client-side no funciona (customers-table.tsx:86-106)

**Spec:** `"Sorting client-side (no envía al backend)"` + columna `name` debe ser ordenable.

**Realidad:** `getSortedRowModel()` está incluido pero faltan:
- `state.sorting` + `onSortingChange` en `useReactTable`
- Click handlers en `TableHead` via `header.column.getToggleSortingHandler()`
- Sort indicators (flechas) en column headers

**Impacto:** El usuario no puede ordenar haciendo clic en los encabezados.

---

## 2. Errores de validación 400 no se muestran inline (customers-form.tsx:98-104)

**Spec:** `"Si hay error de validación del backend (400), mostrar errores debajo de cada campo"`

**Realidad:** Solo se muestra `toast.error(message)` con el primer error. No hay estado local para errores por campo ni se renderizan debajo de cada `Input`/`Select`.

**Impacto:** El usuario no ve qué campo específico tiene error de validación.
