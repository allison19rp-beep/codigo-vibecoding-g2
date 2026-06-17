# Errores — Módulo Products

## 1. `types/products.ts` — Tipos incorrectos en `ProductFilters`

**Archivo:** `types/products.ts:48-53`

| Campo | Spec | Implementación |
|-------|------|----------------|
| `supplier` | `number \| ""` | `string` |
| `warehouse` | `number \| ""` | `string` |
| `stock_quantity_gte` | `number \| ""` | `string` |
| `ordering` | *no definido* | `string` (extra) |

**Impacto:** Los filtros se envían como query params (strings), por lo que funciona. Pero el contrato de tipos del spec se incumple.

**Fix:** 
```typescript
supplier?: number | ""
warehouse?: number | ""
stock_quantity_gte?: number | ""
// eliminar ordering
```

---

## 2. `components/products-form.tsx` — Usa `<textarea>` nativo en vez de `Textarea` de shadcn

**Archivo:** `components/products-form.tsx:194`

La spec define que `textarea` de shadcn ya está instalado (ver Dependencias). El formulario usa `<textarea>` HTML nativo en vez de importar `Textarea` desde `@/components/ui/textarea`.

Adicionalmente, el componente `@/components/ui/textarea` **no existe** en el proyecto, lo que contradice la spec que dice "ya instalado".

**Fix:** Crear `@/components/ui/textarea.tsx` con el componente shadcn Textarea e importarlo en `products-form.tsx`:
```typescript
import { Textarea } from "@/components/ui/textarea"
// ...
<Textarea id="description" value={description} onChange={...} />
```

---

## 3. `app/products/page.tsx` — Placeholder del search incorrecto

**Archivo:** `app/products/page.tsx:194`

| Origen | Placeholder |
|--------|-------------|
| Spec | `"Buscar por nombre, SKU, categoría..."` |
| Implementación | `"Buscar productos..."` |

**Fix:** Cambiar placeholder a `"Buscar por nombre, SKU, categoría..."`.

---

## Resumen

| # | Archivo | Línea | Severidad | Descripción |
|---|---------|-------|-----------|-------------|
| 1 | `types/products.ts` | 48-53 | Media | Tipos `ProductFilters` no coinciden con spec |
| 2 | `components/products-form.tsx` | 194 | Baja | `<textarea>` nativo en vez de shadcn Textarea |
| 3 | `app/products/page.tsx` | 194 | Baja | Placeholder de search incorrecto |
