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
import { useCreateSupplier, useUpdateSupplier } from "@/hooks/use-suppliers"
import type { Supplier } from "@/types/suppliers"

interface SuppliersFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  supplier?: Supplier | null
  onSuccess?: () => void
}

interface FieldErrors {
  name?: string
  tax_id?: string
  contact_name?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  country?: string
}

export function SuppliersForm({
  open,
  onOpenChange,
  supplier,
  onSuccess,
}: SuppliersFormProps) {
  const createSupplier = useCreateSupplier()
  const updateSupplier = useUpdateSupplier()
  const isPending = createSupplier.isPending || updateSupplier.isPending

  const [name, setName] = useState("")
  const [taxId, setTaxId] = useState("")
  const [contactName, setContactName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [country, setCountry] = useState("Colombia")
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  useEffect(() => {
    if (supplier) {
      setName(supplier.name)
      setTaxId(supplier.tax_id ?? "")
      setContactName(supplier.contact_name)
      setEmail(supplier.email)
      setPhone(supplier.phone)
      setAddress(supplier.address)
      setCity(supplier.city)
      setCountry(supplier.country)
    } else {
      setName("")
      setTaxId("")
      setContactName("")
      setEmail("")
      setPhone("")
      setAddress("")
      setCity("")
      setCountry("Colombia")
    }
    setFieldErrors({})
  }, [supplier, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFieldErrors({})

    const formData = {
      name,
      tax_id: taxId || undefined,
      contact_name: contactName,
      email,
      phone,
      address,
      city,
      country: country || undefined,
    }

    try {
      if (supplier) {
        await updateSupplier.mutateAsync({ id: supplier.id, data: formData })
        toast.success("Proveedor actualizado correctamente")
      } else {
        await createSupplier.mutateAsync(formData)
        toast.success("Proveedor creado correctamente")
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
      toast.error("Error al guardar el proveedor")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>{supplier ? "Editar proveedor" : "Nuevo proveedor"}</DialogTitle>
        <DialogDescription>
          {supplier
            ? "Modifica los datos del proveedor"
            : "Ingresa los datos del nuevo proveedor"}
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
            <Label htmlFor="tax_id">RUC / NIT</Label>
            <Input
              id="tax_id"
              value={taxId}
              onChange={(e) => setTaxId(e.target.value)}
              placeholder="RUC/NIT"
            />
            {fieldErrors.tax_id && (
              <p className="text-xs text-destructive">{fieldErrors.tax_id}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="contact_name">Nombre de contacto</Label>
            <Input
              id="contact_name"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              required
            />
            {fieldErrors.contact_name && (
              <p className="text-xs text-destructive">{fieldErrors.contact_name}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {fieldErrors.email && (
              <p className="text-xs text-destructive">{fieldErrors.email}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            {fieldErrors.phone && (
              <p className="text-xs text-destructive">{fieldErrors.phone}</p>
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
