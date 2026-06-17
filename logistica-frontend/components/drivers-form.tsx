"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { CalendarIcon, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
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
import { useCreateDriver, useUpdateDriver, useTransportList } from "@/hooks/use-drivers"
import type { Driver } from "@/types/drivers"

interface DriversFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  driver?: Driver | null
  onSuccess?: () => void
}

interface FieldErrors {
  user_full_name?: string
  user_email?: string
  license_number?: string
  license_expiry?: string
  phone?: string
  transport?: string
  is_active?: string
}

export function DriversForm({
  open,
  onOpenChange,
  driver,
  onSuccess,
}: DriversFormProps) {
  const createDriver = useCreateDriver()
  const updateDriver = useUpdateDriver()
  const isPending = createDriver.isPending || updateDriver.isPending
  const { data: transportData, isLoading: transportLoading } = useTransportList()

  const [userFullName, setUserFullName] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [licenseNumber, setLicenseNumber] = useState("")
  const [licenseExpiry, setLicenseExpiry] = useState("")
  const [phone, setPhone] = useState("")
  const [transportId, setTransportId] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  useEffect(() => {
    if (driver) {
      setUserFullName(driver.user_full_name)
      setUserEmail(driver.user_email)
      setLicenseNumber(driver.license_number)
      setLicenseExpiry(driver.license_expiry)
      setPhone(driver.phone)
      setTransportId(driver.transport ? String(driver.transport) : "")
      setIsActive(driver.is_active)
    } else {
      setUserFullName("")
      setUserEmail("")
      setLicenseNumber("")
      setLicenseExpiry("")
      setPhone("")
      setTransportId("")
      setIsActive(true)
    }
    setFieldErrors({})
  }, [driver, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFieldErrors({})

    const formData = {
      user_full_name: userFullName,
      user_email: userEmail,
      license_number: licenseNumber,
      license_expiry: licenseExpiry,
      phone,
      transport: transportId ? parseInt(transportId, 10) : null,
      is_active: isActive,
    }

    try {
      if (driver) {
        await updateDriver.mutateAsync({ id: driver.id, data: formData })
        toast.success("Conductor actualizado correctamente")
      } else {
        await createDriver.mutateAsync(formData)
        toast.success("Conductor creado correctamente")
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
      toast.error("Error al guardar el conductor")
    }
  }

  const transports = transportData?.results ?? []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>{driver ? "Editar conductor" : "Nuevo conductor"}</DialogTitle>
        <DialogDescription>
          {driver
            ? "Modifica los datos del conductor"
            : "Ingresa los datos del nuevo conductor"}
        </DialogDescription>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="user_full_name">Nombre completo</Label>
            <Input
              id="user_full_name"
              value={userFullName}
              onChange={(e) => setUserFullName(e.target.value)}
              required
            />
            {fieldErrors.user_full_name && (
              <p className="text-xs text-destructive">{fieldErrors.user_full_name}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="user_email">Email</Label>
            <Input
              id="user_email"
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              required
            />
            {fieldErrors.user_email && (
              <p className="text-xs text-destructive">{fieldErrors.user_email}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="license_number">Número de licencia</Label>
            <Input
              id="license_number"
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
              required
            />
            {fieldErrors.license_number && (
              <p className="text-xs text-destructive">{fieldErrors.license_number}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="license_expiry">Vencimiento de licencia</Label>
            <Popover>
              <PopoverTrigger className="w-full" render={<Button variant="outline" className="justify-start text-left font-normal" />}>
                <CalendarIcon className="mr-2 size-4" />
                {licenseExpiry ? format(new Date(licenseExpiry + "T00:00:00"), "dd/MM/yyyy") : "Seleccionar fecha"}
              </PopoverTrigger>
              <PopoverContent>
                <Calendar
                  mode="single"
                  selected={licenseExpiry ? new Date(licenseExpiry + "T00:00:00") : undefined}
                  onSelect={(date) => {
                    if (date) {
                      setLicenseExpiry(format(date, "yyyy-MM-dd"))
                    }
                  }}
                  disabled={{ before: new Date("2000-01-01") }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {fieldErrors.license_expiry && (
              <p className="text-xs text-destructive">{fieldErrors.license_expiry}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            {fieldErrors.phone && (
              <p className="text-xs text-destructive">{fieldErrors.phone}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="transport">Vehículo</Label>
            <Select
              value={transportId}
              onValueChange={(v) => setTransportId(v ?? "")}
              disabled={transportLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={transportLoading ? "Cargando..." : "Sin vehículo"}>
                  {(value: string | null) => {
                    if (!value) return null
                    const t = transports.find((x) => String(x.id) === value)
                    return t ? `${t.plate_number} - ${t.brand} ${t.model}` : value
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

          <div className="flex items-center gap-3">
            <Switch
              id="is_active"
              checked={isActive}
              onCheckedChange={(checked) => setIsActive(checked)}
            />
            <Label htmlFor="is_active" className="cursor-pointer">
              {isActive ? "Activo" : "Inactivo"}
            </Label>
            {fieldErrors.is_active && (
              <p className="text-xs text-destructive">{fieldErrors.is_active}</p>
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
