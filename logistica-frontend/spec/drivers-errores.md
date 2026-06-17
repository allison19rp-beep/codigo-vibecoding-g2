# Errores — Validación Drivers vs `spec/drivers.md`

## 1. `drivers-delete-dialog.tsx` usa `<Dialog>` en lugar de `<AlertDialog>`

- **Spec:** línea ~185 — "shadcn `<AlertDialog>`"
- **Código:** importa y usa `<Dialog>` de `@/components/ui/dialog`
- **Impacto:** El componente `AlertDialog` (disponible en `components/ui/alert-dialog.tsx`) es semanticamente distinto: bloquea interacción con el fondo y previene cierre accidental, comportamiento esperado para una confirmación destructiva.
- **Archivo:** `components/drivers-delete-dialog.tsx:6-11`

## 2. `types/drivers.ts`: interfaz llamada `DriverFilters` en vez de `DriversFilters`

- **Spec:** línea ~108 — `interface DriversFilters { ... }`
- **Código:** `export interface DriverFilters { ... }`
- **Impacto:** Inconsistencia de nomenclatura con el spec. No es un error funcional pero dificulta el rastreo spec → código.

## 3. Inconsistencia: hard delete (`api.delete`) vs mensaje "desactivar"

- **Spec:** "DELETE real, no soft delete" (línea 8) — toast "Conductor eliminado correctamente" (línea 192)
- **Código:** `hooks/use-drivers.ts:64` hace `api.delete` (hard delete), pero `page.tsx:73` muestra toast "Conductor desactivado correctamente" y el diálogo dice "desactivar" / "quedará inactivo"
- **Riesgo:** Si el backend implementa DELETE real, el registro se pierde aunque la UI promete que solo se desactiva. Si el backend cambió a soft delete, el spec está desactualizado.

---

## Checks especiales del usuario (todos OK ✅)

| # | Check | Resultado |
|---|-------|-----------|
| 1 | Mensaje DELETE dice "desactivar" no "eliminar" | ✅ OK |
| 2 | `is_active` Badge: verde "Activo" / gris "Inactivo" | ✅ OK |
| 3 | Transport Select carga desde API via `useTransportList` | ✅ OK |
| 4 | Filtros: search debounce 300ms + is_active Select Sí/No/Todos | ✅ OK |
| 5 | Columnas: full_name, license_number, phone, email, is_active, actions | ✅ OK |
