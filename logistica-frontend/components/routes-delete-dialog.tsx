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
import type { Route } from "@/types/routes"

interface RoutesDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  route: Route | null
  onConfirm: () => void
  isPending: boolean
}

export function RoutesDeleteDialog({
  open,
  onOpenChange,
  route,
  onConfirm,
  isPending,
}: RoutesDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Desactivar ruta</DialogTitle>
        <DialogDescription>
          ¿Estás seguro de desactivar la ruta <strong>{route?.name}</strong>?
          <br />
          La ruta quedará inactiva y no aparecerá en las listas.
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
