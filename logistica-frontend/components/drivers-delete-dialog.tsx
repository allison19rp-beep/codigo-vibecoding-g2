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
import type { Driver } from "@/types/drivers"

interface DriversDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  driver: Driver | null
  onConfirm: () => void
  isPending: boolean
}

export function DriversDeleteDialog({
  open,
  onOpenChange,
  driver,
  onConfirm,
  isPending,
}: DriversDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Desactivar conductor</DialogTitle>
        <DialogDescription>
          ¿Estás seguro de desactivar a <strong>{driver?.user_full_name}</strong>?
          <br />
          El conductor quedará inactivo y no aparecerá en las listas. Puedes reactivarlo editando el registro.
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
            Desactivar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
