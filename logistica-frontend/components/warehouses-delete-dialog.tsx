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
import type { Warehouse } from "@/types/warehouses"

interface WarehousesDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  warehouse: Warehouse | null
  onConfirm: () => void
  isPending: boolean
}

export function WarehousesDeleteDialog({
  open,
  onOpenChange,
  warehouse,
  onConfirm,
  isPending,
}: WarehousesDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Eliminar bodega</DialogTitle>
        <DialogDescription>
          ¿Estás seguro de eliminar <strong>{warehouse?.name}</strong>?
          <br />
          Esta acción desactivará la bodega. No se eliminarán sus datos.
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
