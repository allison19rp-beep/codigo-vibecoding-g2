"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
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
import { useCreateWarehouse, useUpdateWarehouse } from "@/hooks/use-warehouses"
import type { Warehouse } from "@/types/warehouses"

interface WarehousesFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  warehouse?: Warehouse | null
  onSuccess?: () => void
}

interface FieldErrors {
  name?: string
  address?: string
  city?: string
  country?: string
  latitude?: string
  longitude?: string
  capacity_m3?: string
}

export function WarehousesForm({
  open,
  onOpenChange,
  warehouse,
  onSuccess,
}: WarehousesFormProps) {
  const createWarehouse = useCreateWarehouse()
  const updateWarehouse = useUpdateWarehouse()
  const isPending = createWarehouse.isPending || updateWarehouse.isPending

  const [name, setName] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [country, setCountry] = useState("Colombia")
  const [latitude, setLatitude] = useState("")
  const [longitude, setLongitude] = useState("")
  const [capacityM3, setCapacityM3] = useState("")
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  useEffect(() => {
    if (warehouse) {
      setName(warehouse.name)
      setAddress(warehouse.address)
      setCity(warehouse.city)
      setCountry(warehouse.country)
      setLatitude(warehouse.latitude ?? "")
      setLongitude(warehouse.longitude ?? "")
      setCapacityM3(warehouse.capacity_m3)
    } else {
      setName("")
      setAddress("")
      setCity("")
      setCountry("Colombia")
      setLatitude("")
      setLongitude("")
      setCapacityM3("")
    }
    setFieldErrors({})
  }, [warehouse, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFieldErrors({})

    const formData = {
      name,
      address,
      city,
      country: country || undefined,
      latitude: latitude || undefined,
      longitude: longitude || undefined,
      capacity_m3: capacityM3,
    }

    try {
      if (warehouse) {
        await updateWarehouse.mutateAsync({ id: warehouse.id, data: formData })
        toast.success("Bodega actualizada correctamente")
      } else {
        await createWarehouse.mutateAsync(formData)
        toast.success("Bodega creada correctamente")
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
      toast.error("Error al guardar la bodega")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>{warehouse ? "Editar bodega" : "Nueva bodega"}</DialogTitle>
        <DialogDescription>
          {warehouse
            ? "Modifica los datos de la bodega"
            : "Ingresa los datos de la nueva bodega"}
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
            <Label htmlFor="address">Dirección</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
            {fieldErrors.address && (
              <p className="text-xs text-destructive">{fieldErrors.address}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="city">Ciudad</Label>
            <Input
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
            {fieldErrors.city && (
              <p className="text-xs text-destructive">{fieldErrors.city}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="country">País</Label>
            <Input
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />
            {fieldErrors.country && (
              <p className="text-xs text-destructive">{fieldErrors.country}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="latitude">Latitud</Label>
            <Input
              id="latitude"
              type="text"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              placeholder="4.711000"
            />
            {fieldErrors.latitude && (
              <p className="text-xs text-destructive">{fieldErrors.latitude}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="longitude">Longitud</Label>
            <Input
              id="longitude"
              type="text"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              placeholder="-74.072000"
            />
            {fieldErrors.longitude && (
              <p className="text-xs text-destructive">{fieldErrors.longitude}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="capacity_m3">Capacidad (m³)</Label>
            <Input
              id="capacity_m3"
              type="number"
              step="0.01"
              value={capacityM3}
              onChange={(e) => setCapacityM3(e.target.value)}
              required
              placeholder="Capacidad en m³"
            />
            {fieldErrors.capacity_m3 && (
              <p className="text-xs text-destructive">{fieldErrors.capacity_m3}</p>
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
