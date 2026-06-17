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
import type { User } from "@/types/users"

interface UsersDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User | null
  onConfirm: () => void
  isPending: boolean
}

export function UsersDeleteDialog({
  open,
  onOpenChange,
  user,
  onConfirm,
  isPending,
}: UsersDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Eliminar usuario</DialogTitle>
        <DialogDescription>
          ¿Estás seguro de eliminar a <strong>{user?.username}</strong>?
          <br />
          Esta acción eliminará permanentemente el usuario y no se puede deshacer.
        </DialogDescription>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" variant="destructive" disabled={isPending} onClick={onConfirm}>
            {isPending && <Loader2 className="size-4 animate-spin" />}
            Eliminar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
