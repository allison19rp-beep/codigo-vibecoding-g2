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
import { useCreateCustomer, useUpdateCustomer } from "@/hooks/use-customers"
import type { Customer, CustomerType } from "@/types/customers"

interface CustomersFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer?: Customer | null
  onSuccess?: () => void
}

interface FieldErrors {
  name?: string
  customer_type?: string
  tax_id?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  country?: string
}

export function CustomersForm({
  open,
  onOpenChange,
  customer,
  onSuccess,
}: CustomersFormProps) {
  const createCustomer = useCreateCustomer()
  const updateCustomer = useUpdateCustomer()
  const isPending = createCustomer.isPending || updateCustomer.isPending

  const [name, setName] = useState("")
  const [customerType, setCustomerType] = useState<CustomerType>("COMPANY")
  const [taxId, setTaxId] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [country, setCountry] = useState("Colombia")
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  useEffect(() => {
    if (customer) {
      setName(customer.name)
      setCustomerType(customer.customer_type)
      setTaxId(customer.tax_id ?? "")
      setEmail(customer.email)
      setPhone(customer.phone)
      setAddress(customer.address)
      setCity(customer.city)
      setCountry(customer.country)
    } else {
      setName("")
      setCustomerType("COMPANY")
      setTaxId("")
      setEmail("")
      setPhone("")
      setAddress("")
      setCity("")
      setCountry("Colombia")
    }
    setFieldErrors({})
  }, [customer, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFieldErrors({})

    const formData = {
      name,
      customer_type: customerType,
      tax_id: taxId || undefined,
      email,
      phone,
      address,
      city,
      country: country || undefined,
    }

    try {
      if (customer) {
        await updateCustomer.mutateAsync({ id: customer.id, data: formData })
        toast.success("Cliente actualizado correctamente")
      } else {
        await createCustomer.mutateAsync(formData)
        toast.success("Cliente creado correctamente")
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
      toast.error("Error al guardar el cliente")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>{customer ? "Editar cliente" : "Nuevo cliente"}</DialogTitle>
        <DialogDescription>
          {customer
            ? "Modifica los datos del cliente"
            : "Ingresa los datos del nuevo cliente"}
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
            <Label htmlFor="customer_type">Tipo de cliente</Label>
            <Select
              value={customerType}
              onValueChange={(v) => setCustomerType((v ?? "COMPANY") as CustomerType)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="COMPANY">Empresa</SelectItem>
                <SelectItem value="INDIVIDUAL">Individual</SelectItem>
              </SelectContent>
            </Select>
            {fieldErrors.customer_type && (
              <p className="text-xs text-destructive">{fieldErrors.customer_type}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="tax_id">NIT / Identificación</Label>
            <Input
              id="tax_id"
              value={taxId}
              onChange={(e) => setTaxId(e.target.value)}
            />
            {fieldErrors.tax_id && (
              <p className="text-xs text-destructive">{fieldErrors.tax_id}</p>
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
