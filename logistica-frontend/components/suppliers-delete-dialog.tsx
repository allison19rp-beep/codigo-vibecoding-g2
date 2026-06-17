"use client"

import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import type { Supplier } from "@/types/suppliers"

interface SuppliersDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  supplier: Supplier | null
  onConfirm: () => void
  isPending: boolean
}

export function SuppliersDeleteDialog({
  open,
  onOpenChange,
  supplier,
  onConfirm,
  isPending,
}: SuppliersDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Eliminar proveedor</DialogTitle>
        <DialogDescription>
          ¿Estás seguro de eliminar a <strong>{supplier?.name}</strong>?
          <br />
          Esta acción desactivará el proveedor. No se eliminarán sus datos.
        </DialogDescription>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={isPending}
            onClick={onConfirm}
          >
            {isPending && <Loader2 className="size-4 animate-spin" />}
            Eliminar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
