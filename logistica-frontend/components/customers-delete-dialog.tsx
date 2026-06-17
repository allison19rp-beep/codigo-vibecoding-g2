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
import type { Customer } from "@/types/customers"

interface CustomersDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer: Customer | null
  onConfirm: () => void
  isPending: boolean
}

export function CustomersDeleteDialog({
  open,
  onOpenChange,
  customer,
  onConfirm,
  isPending,
}: CustomersDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Eliminar cliente</DialogTitle>
        <DialogDescription>
          ¿Estás seguro de eliminar a <strong>{customer?.name}</strong>?
          <br />
          Esta acción desactivará el cliente. No se eliminarán sus datos.
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
