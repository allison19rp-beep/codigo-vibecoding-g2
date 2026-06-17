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
import { useCreateShipment, useUpdateShipment } from "@/hooks/use-shipments"
import { useWarehouseList } from "@/hooks/use-warehouses"
import type { Shipment, ShipmentStatus } from "@/types/shipments"
import type { Customer } from "@/types/customers"
import type { Driver } from "@/types/drivers"
import type { Transport } from "@/types/transport"
import type { Route } from "@/types/routes"
import { useQuery } from "@tanstack/react-query"
import api from "@/lib/axios"
import type { PaginatedResponse } from "@/types/shipments"

interface ShipmentsFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  shipment?: Shipment | null
  onSuccess?: () => void
}

interface FieldErrors {
  customer?: string
  driver?: string
  transport?: string
  route?: string
  origin_warehouse?: string
  destination_address?: string
  destination_city?: string
  destination_country?: string
  status?: string
  estimated_delivery_date?: string
  weight_total_kg?: string
  base_cost?: string
  notes?: string
}

const statusOptions: { value: ShipmentStatus; label: string }[] = [
  { value: "PENDING", label: "Pendiente" },
  { value: "CONFIRMED", label: "Confirmado" },
  { value: "IN_TRANSIT", label: "En tránsito" },
  { value: "DELIVERED", label: "Entregado" },
  { value: "CANCELLED", label: "Cancelado" },
  { value: "RETURNED", label: "Devuelto" },
]

function useCustomersList() {
  return useQuery<PaginatedResponse<Customer>>({
    queryKey: ["customers", "all"],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Customer>>("/customers/")
      return data
    },
  })
}

function useDriversActive() {
  return useQuery<PaginatedResponse<Driver>>({
    queryKey: ["drivers", "active"],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Driver>>("/drivers/", {
        params: { is_active: true },
      })
      return data
    },
  })
}

function useTransportAvailable() {
  return useQuery<PaginatedResponse<Transport>>({
    queryKey: ["transport", "available"],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Transport>>("/transport/", {
        params: { is_available: true },
      })
      return data
    },
  })
}

function useRoutesList() {
  return useQuery<PaginatedResponse<Route>>({
    queryKey: ["routes", "all"],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Route>>("/routes/")
      return data
    },
  })
}

export function ShipmentsForm({
  open,
  onOpenChange,
  shipment,
  onSuccess,
}: ShipmentsFormProps) {
  const createShipment = useCreateShipment()
  const updateShipment = useUpdateShipment()
  const isPending = createShipment.isPending || updateShipment.isPending

  const { data: customersData, isLoading: customersLoading } = useCustomersList()
  const { data: driversData, isLoading: driversLoading } = useDriversActive()
  const { data: transportData, isLoading: transportLoading } = useTransportAvailable()
  const { data: routesData, isLoading: routesLoading } = useRoutesList()
  const { data: warehousesData, isLoading: warehousesLoading } = useWarehouseList()

  const [customer, setCustomer] = useState("")
  const [driver, setDriver] = useState("")
  const [transport, setTransport] = useState("")
  const [route, setRoute] = useState("")
  const [originWarehouse, setOriginWarehouse] = useState("")
  const [destinationAddress, setDestinationAddress] = useState("")
  const [destinationCity, setDestinationCity] = useState("")
  const [destinationCountry, setDestinationCountry] = useState("Colombia")
  const [status, setStatus] = useState<ShipmentStatus>("PENDING")
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState("")
  const [weightTotalKg, setWeightTotalKg] = useState("")
  const [baseCost, setBaseCost] = useState("")
  const [notes, setNotes] = useState("")
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  useEffect(() => {
    if (shipment) {
      setCustomer(String(shipment.customer))
      setDriver(shipment.driver ? String(shipment.driver) : "")
      setTransport(shipment.transport ? String(shipment.transport) : "")
      setRoute(shipment.route ? String(shipment.route) : "")
      setOriginWarehouse(String(shipment.origin_warehouse))
      setDestinationAddress(shipment.destination_address)
      setDestinationCity(shipment.destination_city)
      setDestinationCountry(shipment.destination_country)
      setStatus(shipment.status)
      setEstimatedDeliveryDate(shipment.estimated_delivery_date ?? "")
      setWeightTotalKg(shipment.weight_total_kg)
      setBaseCost(shipment.base_cost)
      setNotes(shipment.notes ?? "")
    } else {
      setCustomer("")
      setDriver("")
      setTransport("")
      setRoute("")
      setOriginWarehouse("")
      setDestinationAddress("")
      setDestinationCity("")
      setDestinationCountry("Colombia")
      setStatus("PENDING")
      setEstimatedDeliveryDate("")
      setWeightTotalKg("")
      setBaseCost("")
      setNotes("")
    }
    setFieldErrors({})
  }, [shipment, open])

  const customers = customersData?.results ?? []
  const drivers = driversData?.results ?? []
  const transports = transportData?.results ?? []
  const routes = routesData?.results ?? []
  const warehouses = warehousesData?.results ?? []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFieldErrors({})

    if (!originWarehouse) {
      setFieldErrors({ origin_warehouse: "Debes seleccionar una bodega de origen" })
      return
    }

    if (!customer) {
      setFieldErrors({ customer: "Debes seleccionar un cliente" })
      return
    }

    const formData = {
      customer: parseInt(customer, 10),
      driver: driver ? parseInt(driver, 10) : null,
      transport: transport ? parseInt(transport, 10) : null,
      route: route ? parseInt(route, 10) : null,
      origin_warehouse: parseInt(originWarehouse, 10),
      destination_address: destinationAddress,
      destination_city: destinationCity,
      destination_country: destinationCountry || undefined,
      status,
      estimated_delivery_date: estimatedDeliveryDate || null,
      weight_total_kg: weightTotalKg,
      base_cost: baseCost,
      notes: notes || undefined,
    }

    try {
      if (shipment) {
        await updateShipment.mutateAsync({ id: shipment.id, data: formData })
        toast.success("Envío actualizado correctamente")
      } else {
        await createShipment.mutateAsync(formData)
        toast.success("Envío creado correctamente")
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
      toast.error("Error al guardar el envío")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogTitle>{shipment ? "Editar envío" : "Nuevo envío"}</DialogTitle>
        <DialogDescription>
          {shipment
            ? "Modifica los datos del envío"
            : "Ingresa los datos del nuevo envío"}
        </DialogDescription>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="customer">Cliente</Label>
              <Select
                value={customer}
                onValueChange={(v) => setCustomer(v ?? "")}
                disabled={customersLoading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={customersLoading ? "Cargando..." : "Selecciona un cliente"}>
                    {(value: string | null) => {
                      if (!value) return null
                      const c = customers.find((x) => String(x.id) === value)
                      return c ? c.name : value
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldErrors.customer && (
                <p className="text-xs text-destructive">{fieldErrors.customer}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">Estado</Label>
              <Select
                value={status}
                onValueChange={(v) => setStatus((v ?? "PENDING") as ShipmentStatus)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldErrors.status && (
                <p className="text-xs text-destructive">{fieldErrors.status}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="origin_warehouse">Bodega de origen</Label>
              <Select
                value={originWarehouse}
                onValueChange={(v) => setOriginWarehouse(v ?? "")}
                disabled={warehousesLoading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={warehousesLoading ? "Cargando..." : "Selecciona una bodega"}>
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
              <Label htmlFor="driver">Conductor</Label>
              <Select
                value={driver}
                onValueChange={(v) => setDriver(v ?? "")}
                disabled={driversLoading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={driversLoading ? "Cargando..." : "Opcional"}>
                    {(value: string | null) => {
                      if (!value) return null
                      const d = drivers.find((x) => String(x.id) === value)
                      return d ? d.user_full_name : value
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {drivers.map((d) => (
                    <SelectItem key={d.id} value={String(d.id)}>
                      {d.user_full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldErrors.driver && (
                <p className="text-xs text-destructive">{fieldErrors.driver}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="transport">Transporte</Label>
              <Select
                value={transport}
                onValueChange={(v) => setTransport(v ?? "")}
                disabled={transportLoading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={transportLoading ? "Cargando..." : "Opcional"}>
                    {(value: string | null) => {
                      if (!value) return null
                      const t = transports.find((x) => String(x.id) === value)
                      return t ? `${t.plate_number} - ${t.brand}` : value
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {transports.map((t) => (
                    <SelectItem key={t.id} value={String(t.id)}>
                      {t.plate_number} - {t.brand} {t.model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldErrors.transport && (
                <p className="text-xs text-destructive">{fieldErrors.transport}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="route">Ruta</Label>
              <Select
                value={route}
                onValueChange={(v) => setRoute(v ?? "")}
                disabled={routesLoading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={routesLoading ? "Cargando..." : "Opcional"}>
                    {(value: string | null) => {
                      if (!value) return null
                      const r = routes.find((x) => String(x.id) === value)
                      return r ? r.name : value
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {routes.map((r) => (
                    <SelectItem key={r.id} value={String(r.id)}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldErrors.route && (
                <p className="text-xs text-destructive">{fieldErrors.route}</p>
              )}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="destination_address">Dirección de destino</Label>
            <Input
              id="destination_address"
              value={destinationAddress}
              onChange={(e) => setDestinationAddress(e.target.value)}
              required
            />
            {fieldErrors.destination_address && (
              <p className="text-xs text-destructive">{fieldErrors.destination_address}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="destination_city">Ciudad de destino</Label>
              <Input
                id="destination_city"
                value={destinationCity}
                onChange={(e) => setDestinationCity(e.target.value)}
                required
              />
              {fieldErrors.destination_city && (
                <p className="text-xs text-destructive">{fieldErrors.destination_city}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="destination_country">País de destino</Label>
              <Input
                id="destination_country"
                value={destinationCountry}
                onChange={(e) => setDestinationCountry(e.target.value)}
              />
              {fieldErrors.destination_country && (
                <p className="text-xs text-destructive">{fieldErrors.destination_country}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="estimated_delivery_date">Fecha estimada de entrega</Label>
              <Input
                id="estimated_delivery_date"
                type="date"
                value={estimatedDeliveryDate}
                onChange={(e) => setEstimatedDeliveryDate(e.target.value)}
              />
              {fieldErrors.estimated_delivery_date && (
                <p className="text-xs text-destructive">{fieldErrors.estimated_delivery_date}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="weight_total_kg">Peso total (kg)</Label>
              <Input
                id="weight_total_kg"
                type="number"
                step="0.001"
                value={weightTotalKg}
                onChange={(e) => setWeightTotalKg(e.target.value)}
                required
              />
              {fieldErrors.weight_total_kg && (
                <p className="text-xs text-destructive">{fieldErrors.weight_total_kg}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="base_cost">Costo base</Label>
              <Input
                id="base_cost"
                type="number"
                step="0.01"
                value={baseCost}
                onChange={(e) => setBaseCost(e.target.value)}
                required
              />
              {fieldErrors.base_cost && (
                <p className="text-xs text-destructive">{fieldErrors.base_cost}</p>
              )}
            </div>

            {shipment && (
              <div className="grid gap-2">
                <Label htmlFor="calculated_cost">Costo calculado</Label>
                <Input
                  id="calculated_cost"
                  value={shipment.calculated_cost}
                  readOnly
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Costo base + subtotales de items
                </p>
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Notas</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            {fieldErrors.notes && (
              <p className="text-xs text-destructive">{fieldErrors.notes}</p>
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
