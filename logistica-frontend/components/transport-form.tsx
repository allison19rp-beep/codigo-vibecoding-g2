"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
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
import { useCreateTransport, useUpdateTransport } from "@/hooks/use-transport"
import type { Transport, TransportType } from "@/types/transport"

interface TransportFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transport?: Transport | null
  onSuccess?: () => void
}

interface FieldErrors {
  plate_number?: string
  transport_type?: string
  brand?: string
  model?: string
  year?: string
  capacity_kg?: string
  capacity_m3?: string
  is_available?: string
}

export function TransportForm({
  open,
  onOpenChange,
  transport,
  onSuccess,
}: TransportFormProps) {
  const createTransport = useCreateTransport()
  const updateTransport = useUpdateTransport()
  const isPending = createTransport.isPending || updateTransport.isPending

  const [plateNumber, setPlateNumber] = useState("")
  const [transportType, setTransportType] = useState<TransportType>("TRUCK")
  const [brand, setBrand] = useState("")
  const [model, setModel] = useState("")
  const [year, setYear] = useState("")
  const [capacityKg, setCapacityKg] = useState("")
  const [capacityM3, setCapacityM3] = useState("")
  const [isAvailable, setIsAvailable] = useState(true)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  useEffect(() => {
    if (transport) {
      setPlateNumber(transport.plate_number)
      setTransportType(transport.transport_type)
      setBrand(transport.brand)
      setModel(transport.model)
      setYear(String(transport.year))
      setCapacityKg(transport.capacity_kg)
      setCapacityM3(transport.capacity_m3)
      setIsAvailable(transport.is_available)
    } else {
      setPlateNumber("")
      setTransportType("TRUCK")
      setBrand("")
      setModel("")
      setYear("")
      setCapacityKg("")
      setCapacityM3("")
      setIsAvailable(true)
    }
    setFieldErrors({})
  }, [transport, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFieldErrors({})

    const formData = {
      plate_number: plateNumber,
      transport_type: transportType,
      brand,
      model,
      year: parseInt(year, 10),
      capacity_kg: capacityKg,
      capacity_m3: capacityM3,
      is_available: isAvailable,
    }

    try {
      if (transport) {
        await updateTransport.mutateAsync({ id: transport.id, data: formData })
        toast.success("Vehículo actualizado correctamente")
      } else {
        await createTransport.mutateAsync(formData)
        toast.success("Vehículo creado correctamente")
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
      toast.error("Error al guardar el vehículo")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>{transport ? "Editar vehículo" : "Nuevo vehículo"}</DialogTitle>
        <DialogDescription>
          {transport
            ? "Modifica los datos del vehículo"
            : "Ingresa los datos del nuevo vehículo"}
        </DialogDescription>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="plate_number">Placa</Label>
            <Input
              id="plate_number"
              value={plateNumber}
              onChange={(e) => setPlateNumber(e.target.value)}
              required
            />
            {fieldErrors.plate_number && (
              <p className="text-xs text-destructive">{fieldErrors.plate_number}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="transport_type">Tipo de vehículo</Label>
            <Select
              value={transportType}
              onValueChange={(v) => setTransportType((v ?? "TRUCK") as TransportType)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TRUCK">Camión</SelectItem>
                <SelectItem value="VAN">Van</SelectItem>
                <SelectItem value="MOTORCYCLE">Motocicleta</SelectItem>
                <SelectItem value="CARGO_BIKE">Bicicleta de carga</SelectItem>
              </SelectContent>
            </Select>
            {fieldErrors.transport_type && (
              <p className="text-xs text-destructive">{fieldErrors.transport_type}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="brand">Marca</Label>
            <Input
              id="brand"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              required
            />
            {fieldErrors.brand && (
              <p className="text-xs text-destructive">{fieldErrors.brand}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="model">Modelo</Label>
            <Input
              id="model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              required
            />
            {fieldErrors.model && (
              <p className="text-xs text-destructive">{fieldErrors.model}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="year">Año</Label>
            <Input
              id="year"
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              required
              min={1900}
              max={new Date().getFullYear()}
            />
            {fieldErrors.year && (
              <p className="text-xs text-destructive">{fieldErrors.year}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="capacity_kg">Capacidad (kg)</Label>
            <Input
              id="capacity_kg"
              type="number"
              step="0.01"
              value={capacityKg}
              onChange={(e) => setCapacityKg(e.target.value)}
              required
            />
            {fieldErrors.capacity_kg && (
              <p className="text-xs text-destructive">{fieldErrors.capacity_kg}</p>
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
            />
            {fieldErrors.capacity_m3 && (
              <p className="text-xs text-destructive">{fieldErrors.capacity_m3}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Switch
              id="is_available"
              checked={isAvailable}
              onCheckedChange={(checked) => setIsAvailable(checked)}
            />
            <Label htmlFor="is_available" className="cursor-pointer">
              {isAvailable ? "Disponible" : "No disponible"}
            </Label>
            {fieldErrors.is_available && (
              <p className="text-xs text-destructive">{fieldErrors.is_available}</p>
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
