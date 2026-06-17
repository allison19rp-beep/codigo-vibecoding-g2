"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
import { useCreateProduct, useUpdateProduct, useSuppliersList, useWarehousesList } from "@/hooks/use-products"
import type { Product } from "@/types/products"

interface ProductsFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: Product | null
  onSuccess?: () => void
}

interface FieldErrors {
  name?: string
  sku?: string
  description?: string
  category?: string
  supplier?: string
  warehouse?: string
  unit_price?: string
  stock_quantity?: string
  weight_kg?: string
  width_cm?: string
  height_cm?: string
  depth_cm?: string
}

export function ProductsForm({
  open,
  onOpenChange,
  product,
  onSuccess,
}: ProductsFormProps) {
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()
  const isPending = createProduct.isPending || updateProduct.isPending
  const { data: suppliersData, isLoading: suppliersLoading } = useSuppliersList()
  const { data: warehousesData, isLoading: warehousesLoading } = useWarehousesList()

  const [name, setName] = useState("")
  const [sku, setSku] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [supplier, setSupplier] = useState("")
  const [warehouse, setWarehouse] = useState("")
  const [unitPrice, setUnitPrice] = useState("")
  const [stockQuantity, setStockQuantity] = useState("")
  const [weightKg, setWeightKg] = useState("")
  const [widthCm, setWidthCm] = useState("")
  const [heightCm, setHeightCm] = useState("")
  const [depthCm, setDepthCm] = useState("")
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  useEffect(() => {
    if (product) {
      setName(product.name)
      setSku(product.sku)
      setDescription(product.description ?? "")
      setCategory(product.category)
      setSupplier(String(product.supplier))
      setWarehouse(String(product.warehouse))
      setUnitPrice(product.unit_price)
      setStockQuantity(String(product.stock_quantity))
      setWeightKg(product.weight_kg)
      setWidthCm(product.width_cm)
      setHeightCm(product.height_cm)
      setDepthCm(product.depth_cm)
    } else {
      setName("")
      setSku("")
      setDescription("")
      setCategory("")
      setSupplier("")
      setWarehouse("")
      setUnitPrice("")
      setStockQuantity("")
      setWeightKg("")
      setWidthCm("")
      setHeightCm("")
      setDepthCm("")
    }
    setFieldErrors({})
  }, [product, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFieldErrors({})

    const formData = {
      name,
      sku,
      description: description || undefined,
      category,
      supplier: parseInt(supplier, 10),
      warehouse: parseInt(warehouse, 10),
      unit_price: unitPrice,
      stock_quantity: parseInt(stockQuantity, 10) || 0,
      weight_kg: weightKg,
      width_cm: widthCm,
      height_cm: heightCm,
      depth_cm: depthCm,
    }

    try {
      if (product) {
        await updateProduct.mutateAsync({ id: product.id, data: formData })
        toast.success("Producto actualizado correctamente")
      } else {
        await createProduct.mutateAsync(formData)
        toast.success("Producto creado correctamente")
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
      toast.error("Error al guardar el producto")
    }
  }

  const suppliers = suppliersData?.results ?? []
  const warehouses = warehousesData?.results ?? []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogTitle>{product ? "Editar producto" : "Nuevo producto"}</DialogTitle>
        <DialogDescription>
          {product
            ? "Modifica los datos del producto"
            : "Ingresa los datos del nuevo producto"}
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
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              required
            />
            {fieldErrors.sku && (
              <p className="text-xs text-destructive">{fieldErrors.sku}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            {fieldErrors.description && (
              <p className="text-xs text-destructive">{fieldErrors.description}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="category">Categoría</Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            />
            {fieldErrors.category && (
              <p className="text-xs text-destructive">{fieldErrors.category}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="supplier">Proveedor</Label>
            <Select
              value={supplier}
              onValueChange={(v) => setSupplier(v ?? "")}
              disabled={suppliersLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={suppliersLoading ? "Cargando..." : "Seleccionar proveedor"}>
                  {(value: string | null) => {
                    if (!value) return null
                    const s = suppliers.find((x) => String(x.id) === value)
                    return s ? s.name : value
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {suppliers.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.supplier && (
              <p className="text-xs text-destructive">{fieldErrors.supplier}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="warehouse">Almacén</Label>
            <Select
              value={warehouse}
              onValueChange={(v) => setWarehouse(v ?? "")}
              disabled={warehousesLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={warehousesLoading ? "Cargando..." : "Seleccionar almacén"}>
                  {(value: string | null) => {
                    if (!value) return null
                    const w = warehouses.find((x) => String(x.id) === value)
                    return w ? w.name : value
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {warehouses.map((w) => (
                  <SelectItem key={w.id} value={String(w.id)}>
                    {w.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.warehouse && (
              <p className="text-xs text-destructive">{fieldErrors.warehouse}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="unit_price">Precio unitario</Label>
            <Input
              id="unit_price"
              type="number"
              step="0.01"
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
              required
            />
            {fieldErrors.unit_price && (
              <p className="text-xs text-destructive">{fieldErrors.unit_price}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="stock_quantity">Cantidad en stock</Label>
            <Input
              id="stock_quantity"
              type="number"
              step="1"
              value={stockQuantity}
              onChange={(e) => setStockQuantity(e.target.value)}
              required
            />
            {fieldErrors.stock_quantity && (
              <p className="text-xs text-destructive">{fieldErrors.stock_quantity}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="weight_kg">Peso (kg)</Label>
              <Input
                id="weight_kg"
                type="number"
                step="0.001"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                required
              />
              {fieldErrors.weight_kg && (
                <p className="text-xs text-destructive">{fieldErrors.weight_kg}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="width_cm">Ancho (cm)</Label>
              <Input
                id="width_cm"
                type="number"
                step="0.01"
                value={widthCm}
                onChange={(e) => setWidthCm(e.target.value)}
                required
              />
              {fieldErrors.width_cm && (
                <p className="text-xs text-destructive">{fieldErrors.width_cm}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="height_cm">Alto (cm)</Label>
              <Input
                id="height_cm"
                type="number"
                step="0.01"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                required
              />
              {fieldErrors.height_cm && (
                <p className="text-xs text-destructive">{fieldErrors.height_cm}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="depth_cm">Profundidad (cm)</Label>
              <Input
                id="depth_cm"
                type="number"
                step="0.01"
                value={depthCm}
                onChange={(e) => setDepthCm(e.target.value)}
                required
              />
              {fieldErrors.depth_cm && (
                <p className="text-xs text-destructive">{fieldErrors.depth_cm}</p>
              )}
            </div>
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
