"use client"

import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"
import type { Transport } from "@/types/transport"

interface TransportDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transport: Transport | null
  onConfirm: () => void
  isPending: boolean
}

export function TransportDeleteDialog({
  open,
  onOpenChange,
  transport,
  onConfirm,
  isPending,
}: TransportDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogTitle>Eliminar vehículo</AlertDialogTitle>
        <AlertDialogDescription>
          ¿Estás seguro de eliminar el vehículo <strong>{transport?.plate_number}</strong>?
          <br />
          Esta acción eliminará permanentemente el vehículo. No se puede deshacer.
        </AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            type="button"
            variant="destructive"
            disabled={isPending}
            onClick={onConfirm}
          >
            {isPending && <Loader2 className="size-4 animate-spin" />}
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
