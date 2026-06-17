"use client"

import { useState, useEffect, useMemo } from "react"
import { Loader2, ChevronDown, ChevronRight } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { useCreateGroup, useUpdateGroup, usePermissions } from "@/hooks/use-groups"
import type { Group, Permission } from "@/types/users"

interface GroupsFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  group?: Group | null
  onSuccess?: () => void
}

const APP_LABEL_LABELS: Record<string, string> = {
  admin: "Administración",
  auth: "Autenticación",
  contenttypes: "Tipos de contenido",
  sessions: "Sesiones",
  warehouses: "Almacenes",
  suppliers: "Proveedores",
  customers: "Clientes",
  transport: "Transporte",
  products: "Productos",
  routes: "Rutas",
  drivers: "Conductores",
  shipments: "Envíos",
  authentication: "Autenticación",
}

function getAppLabel(appLabel: string): string {
  return APP_LABEL_LABELS[appLabel] ?? appLabel
}

export function GroupsForm({ open, onOpenChange, group, onSuccess }: GroupsFormProps) {
  const createGroup = useCreateGroup()
  const updateGroup = useUpdateGroup()
  const { data: permissions } = usePermissions()
  const isPending = createGroup.isPending || updateGroup.isPending

  const [name, setName] = useState("")
  const [selectedPerms, setSelectedPerms] = useState<number[]>([])
  const [collapsedApps, setCollapsedApps] = useState<Set<string>>(new Set())
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (group) {
      setName(group.name)
      setSelectedPerms(group.permissions)
    } else {
      setName("")
      setSelectedPerms([])
    }
    setFieldErrors({})
    setCollapsedApps(new Set())
  }, [group, open])

  const groupedPermissions = useMemo(() => {
    if (!permissions) return {}
    const grouped: Record<string, Permission[]> = {}
    const order = [
      "warehouses", "suppliers", "customers", "transport",
      "products", "routes", "drivers", "shipments", "auth", "admin",
    ]
    for (const perm of permissions) {
      if (!grouped[perm.app_label]) grouped[perm.app_label] = []
      grouped[perm.app_label].push(perm)
    }
    const sorted: Record<string, Permission[]> = {}
    for (const key of order) {
      if (grouped[key]) sorted[key] = grouped[key]
    }
    for (const key of Object.keys(grouped)) {
      if (!sorted[key]) sorted[key] = grouped[key]
    }
    return sorted
  }, [permissions])

  function togglePermission(permId: number) {
    setSelectedPerms((prev) =>
      prev.includes(permId) ? prev.filter((id) => id !== permId) : [...prev, permId],
    )
  }

  function toggleApp(appLabel: string) {
    setCollapsedApps((prev) => {
      const next = new Set(prev)
      if (next.has(appLabel)) next.delete(appLabel)
      else next.add(appLabel)
      return next
    })
  }

  function selectAllInApp(appLabel: string) {
    const appPerms = groupedPermissions[appLabel] ?? []
    const appIds = appPerms.map((p) => p.id)
    setSelectedPerms((prev) => {
      const newSet = new Set(prev)
      for (const id of appIds) newSet.add(id)
      return Array.from(newSet)
    })
  }

  function deselectAllInApp(appLabel: string) {
    const appPerms = groupedPermissions[appLabel] ?? []
    const appIds = new Set(appPerms.map((p) => p.id))
    setSelectedPerms((prev) => prev.filter((id) => !appIds.has(id)))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFieldErrors({})

    if (!name.trim()) {
      setFieldErrors({ name: "El nombre es requerido" })
      return
    }

    const formData = { name: name.trim(), permissions: selectedPerms }

    try {
      if (group) {
        await updateGroup.mutateAsync({ id: group.id, data: formData })
        toast.success("Rol actualizado correctamente")
      } else {
        await createGroup.mutateAsync(formData)
        toast.success("Rol creado correctamente")
      }
      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      const data = error?.response?.data
      if (data && typeof data === "object") {
        const errors: Record<string, string> = {}
        for (const key of Object.keys(data)) {
          const val = data[key]
          if (Array.isArray(val)) errors[key] = val.join(", ")
        }
        if (Object.keys(errors).length > 0) {
          setFieldErrors(errors)
          return
        }
      }
      toast.error("Error al guardar el rol")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogTitle>{group ? "Editar rol" : "Nuevo rol"}</DialogTitle>
        <DialogDescription>
          {group ? "Modifica los datos del rol" : "Define un nuevo rol con sus permisos"}
        </DialogDescription>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 overflow-hidden flex-1">
          <div className="grid gap-2">
            <Label htmlFor="name">Nombre del rol *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Gestor de almacenes"
              required
            />
            {fieldErrors.name && <p className="text-xs text-destructive">{fieldErrors.name}</p>}
          </div>

          <div className="grid gap-2 flex-1 overflow-hidden">
            <div className="flex items-center justify-between">
              <Label>Permisos</Label>
              <span className="text-xs text-muted-foreground">
                {selectedPerms.length} seleccionados
              </span>
            </div>
            <div className="overflow-y-auto rounded-lg border p-2 space-y-1 max-h-[50vh]">
              {!permissions && (
                <p className="text-sm text-muted-foreground py-4 text-center">Cargando permisos...</p>
              )}
              {permissions && Object.keys(groupedPermissions).length === 0 && (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No hay permisos disponibles
                </p>
              )}
              {Object.entries(groupedPermissions).map(([appLabel, perms]) => {
                const isCollapsed = collapsedApps.has(appLabel)
                const selectedCount = perms.filter((p) => selectedPerms.includes(p.id)).length
                return (
                  <div key={appLabel} className="rounded border">
                    <button
                      type="button"
                      onClick={() => toggleApp(appLabel)}
                      className="flex w-full items-center justify-between px-3 py-2 text-sm font-medium hover:bg-accent rounded cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        {isCollapsed ? <ChevronRight className="size-4" /> : <ChevronDown className="size-4" />}
                        {getAppLabel(appLabel)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {selectedCount}/{perms.length}
                      </span>
                    </button>
                    {!isCollapsed && (
                      <div className="border-t px-3 py-1.5 space-y-0.5">
                        <div className="flex gap-2 pb-1">
                          <button
                            type="button"
                            onClick={() => selectAllInApp(appLabel)}
                            className="text-xs text-primary hover:underline cursor-pointer"
                          >
                            Seleccionar todos
                          </button>
                          <button
                            type="button"
                            onClick={() => deselectAllInApp(appLabel)}
                            className="text-xs text-muted-foreground hover:underline cursor-pointer"
                          >
                            Deseleccionar todos
                          </button>
                        </div>
                        {perms.map((perm) => (
                          <label
                            key={perm.id}
                            className="flex items-center gap-2 rounded px-2 py-1 text-sm hover:bg-accent cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selectedPerms.includes(perm.id)}
                              onChange={() => togglePermission(perm.id)}
                              className="size-4"
                            />
                            <div className="flex flex-col">
                              <span>{perm.name}</span>
                              <span className="text-xs text-muted-foreground">{perm.codename}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="size-4 animate-spin" />}
              Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
