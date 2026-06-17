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
import type { Group } from "@/types/users"

interface GroupsDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  group: Group | null
  onConfirm: () => void
  isPending: boolean
}

export function GroupsDeleteDialog({
  open,
  onOpenChange,
  group,
  onConfirm,
  isPending,
}: GroupsDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Eliminar rol</DialogTitle>
        <DialogDescription>
          ¿Estás seguro de eliminar el rol <strong>{group?.name}</strong>?
          <br />
          Los usuarios que tengan este rol perderán los permisos asociados.
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
