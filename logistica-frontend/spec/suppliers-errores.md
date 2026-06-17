# Errores — Módulo Suppliers

## Error 1 — `components/suppliers-delete-dialog.tsx` usa `Dialog` en vez de `AlertDialog`

**Spec:** dice `shadcn <AlertDialog>`

**Realidad:** importa `Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter` desde `@/components/ui/dialog`. Además, `alert-dialog.tsx` no existe en `components/ui/`.

**Fix:** instalar shadcn AlertDialog (`npx shadcn@latest add alert-dialog`) y migrar el componente a `<AlertDialog>`, `<AlertDialogTrigger>`, `<AlertDialogContent>`, `<AlertDialogHeader>`, `<AlertDialogTitle>`, `<AlertDialogDescription>`, `<AlertDialogFooter>`, `<AlertDialogCancel>`, `<AlertDialogAction>`.

---

## Error 2 — `components/suppliers-delete-dialog.tsx` prop `supplier` es nullable

**Spec:** `supplier: Supplier` (no-null)

**Realidad:** `supplier: Supplier | null`

**Fix:** cambiar tipo a `Supplier` o marcar como required en runtime.
