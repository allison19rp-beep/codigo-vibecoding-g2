"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { useCreateRoute, useUpdateRoute } from "@/hooks/use-routes"
import { useWarehouseList } from "@/hooks/use-warehouses"
import type { Route } from "@/types/routes"

interface RoutesFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  route?: Route | null
  onSuccess?: () => void
}

interface FieldErrors {
  name?: string
  origin_warehouse?: string
  estimated_duration_hours?: string
  estimated_distance_km?: string
}

export function RoutesForm({
  open,
  onOpenChange,
  route,
  onSuccess,
}: RoutesFormProps) {
  const createRoute = useCreateRoute()
  const updateRoute = useUpdateRoute()
  const isPending = createRoute.isPending || updateRoute.isPending
  const { data: warehouseData, isLoading: warehouseLoading } = useWarehouseList()

  const [name, setName] = useState("")
  const [originWarehouse, setOriginWarehouse] = useState("")
  const [estimatedDurationHours, setEstimatedDurationHours] = useState("")
  const [estimatedDistanceKm, setEstimatedDistanceKm] = useState("")
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  useEffect(() => {
    if (route) {
      setName(route.name)
      setOriginWarehouse(String(route.origin_warehouse))
      setEstimatedDurationHours(route.estimated_duration_hours)
      setEstimatedDistanceKm(route.estimated_distance_km)
    } else {
      setName("")
      setOriginWarehouse("")
      setEstimatedDurationHours("")
      setEstimatedDistanceKm("")
    }
    setFieldErrors({})
  }, [route, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFieldErrors({})

    if (!originWarehouse) {
      setFieldErrors({ origin_warehouse: "Debes seleccionar una bodega de origen" })
      return
    }

    const formData = {
      name,
      origin_warehouse: parseInt(originWarehouse, 10),
      estimated_duration_hours: estimatedDurationHours,
      estimated_distance_km: estimatedDistanceKm,
    }

    try {
      if (route) {
        await updateRoute.mutateAsync({ id: route.id, data: formData })
        toast.success("Ruta actualizada correctamente")
      } else {
        await createRoute.mutateAsync(formData)
        toast.success("Ruta creada correctamente")
      }
      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      const data = error?.response?.data
      if (data && typeof data === "object") {
        const errors: FieldErrors = {}
        for (const key of Object.keys(data)) {
          const val = data[key]
          if (Array.isArray(val)) {
            errors[key as keyof FieldErrors] = val.join(", ")
          }
        }
        if (Object.keys(errors).length > 0) {
          setFieldErrors(errors)
          return
        }
      }
      toast.error("Error al guardar la ruta")
    }
  }

  const warehouses = warehouseData?.results ?? []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>{route ? "Editar ruta" : "Nueva ruta"}</DialogTitle>
        <DialogDescription>
          {route
            ? "Modifica los datos de la ruta"
            : "Ingresa los datos de la nueva ruta"}
        </DialogDescription>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            {fieldErrors.name && (
              <p className="text-xs text-destructive">{fieldErrors.name}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="origin_warehouse">Bodega de origen</Label>
            <Select
              value={originWarehouse}
              onValueChange={(v) => setOriginWarehouse(v ?? "")}
              disabled={warehouseLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={warehouseLoading ? "Cargando..." : "Selecciona una bodega"}>
                  {(value: string | null) => {
                    if (!value) return null
                    const w = warehouses.find((x) => String(x.id) === value)
                    return w ? `${w.name} - ${w.city}` : value
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {warehouses.map((w) => (
                  <SelectItem key={w.id} value={String(w.id)}>
                    {w.name} - {w.city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.origin_warehouse && (
              <p className="text-xs text-destructive">{fieldErrors.origin_warehouse}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="estimated_duration_hours">Duración estimada (horas)</Label>
            <Input
              id="estimated_duration_hours"
              type="number"
              step="0.01"
              value={estimatedDurationHours}
              onChange={(e) => setEstimatedDurationHours(e.target.value)}
              required
              placeholder="4.50"
            />
            {fieldErrors.estimated_duration_hours && (
              <p className="text-xs text-destructive">{fieldErrors.estimated_duration_hours}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="estimated_distance_km">Distancia estimada (km)</Label>
            <Input
              id="estimated_distance_km"
              type="number"
              step="0.01"
              value={estimatedDistanceKm}
              onChange={(e) => setEstimatedDistanceKm(e.target.value)}
              required
              placeholder="120.00"
            />
            {fieldErrors.estimated_distance_km && (
              <p className="text-xs text-destructive">{fieldErrors.estimated_distance_km}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
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
