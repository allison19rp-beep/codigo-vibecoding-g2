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
import type { Shipment } from "@/types/shipments"

interface ShipmentsDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  shipment: Shipment | null
  onConfirm: () => void
  isPending: boolean
}

export function ShipmentsDeleteDialog({
  open,
  onOpenChange,
  shipment,
  onConfirm,
  isPending,
}: ShipmentsDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Eliminar envío</DialogTitle>
        <DialogDescription>
          ¿Estás seguro de eliminar el envío <strong>{shipment?.tracking_number}</strong>?
          <br />
          Esta acción eliminará permanentemente el envío. No se puede deshacer.
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
