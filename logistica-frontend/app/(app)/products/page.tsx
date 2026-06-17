"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Plus, Search } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ProductsTable } from "@/components/products-table"
import { ProductsForm } from "@/components/products-form"
import { ProductsDeleteDialog } from "@/components/products-delete-dialog"
import { useProducts, useDeleteProduct, useSuppliersList, useWarehousesList } from "@/hooks/use-products"
import type { Product } from "@/types/products"
import { ResponsiveFilters } from "@/components/responsive-filters"

export default function ProductsPage() {
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [category, setCategory] = useState("")
  const [supplier, setSupplier] = useState("all")
  const [warehouse, setWarehouse] = useState("all")
  const [unitPriceGte, setUnitPriceGte] = useState("")
  const [unitPriceLte, setUnitPriceLte] = useState("")
  const [stockGte, setStockGte] = useState("")
  const [page, setPage] = useState(1)
  const [formOpen, setFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)

  const { data: suppliersData } = useSuppliersList()
  const { data: warehousesData } = useWarehousesList()

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const filters = useMemo(
    () => ({
      page,
      search: debouncedSearch || undefined,
      category: category || undefined,
      supplier: supplier !== "all" ? supplier : undefined,
      warehouse: warehouse !== "all" ? warehouse : undefined,
      unit_price_gte: unitPriceGte || undefined,
      unit_price_lte: unitPriceLte || undefined,
      stock_quantity_gte: stockGte || undefined,
    }),
    [page, debouncedSearch, category, supplier, warehouse, unitPriceGte, unitPriceLte, stockGte],
  )

  const { data, isLoading, isError } = useProducts(filters)
  const deleteProduct = useDeleteProduct()

  useEffect(() => {
    if (isError) {
      toast.error("Error al cargar los productos")
    }
  }, [isError])

  const totalPages = data ? Math.ceil(data.count / 20) : 0

  const handleEdit = useCallback((product: Product) => {
    setEditingProduct(product)
    setFormOpen(true)
  }, [])

  const handleDelete = useCallback((product: Product) => {
    setDeletingProduct(product)
    setDeleteOpen(true)
  }, [])

  const handleConfirmDelete = async () => {
    if (!deletingProduct) return
    try {
      await deleteProduct.mutateAsync(deletingProduct.id)
      toast.success("Producto eliminado correctamente")
      setDeleteOpen(false)
      setDeletingProduct(null)
    } catch {
      toast.error("Error al eliminar el producto")
    }
  }

  const suppliers = suppliersData?.results ?? []
  const warehouses = warehousesData?.results ?? []

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold sm:text-2xl">Productos</h1>
        <Button onClick={() => setFormOpen(true)} className="w-full sm:w-auto">
          <Plus className="size-4" />
          Nuevo producto
        </Button>
      </div>

      <ResponsiveFilters>
        <Input
          placeholder="Filtrar por categoría"
          value={category}
          onChange={(e) => {
            setCategory(e.target.value)
            setPage(1)
          }}
          className="w-full sm:w-48"
        />

        <Select
          value={supplier}
          onValueChange={(v) => {
            setSupplier(v ?? "all")
            setPage(1)
          }}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Proveedor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los proveedores</SelectItem>
            {suppliers.map((s) => (
              <SelectItem key={s.id} value={String(s.id)}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={warehouse}
          onValueChange={(v) => {
            setWarehouse(v ?? "all")
            setPage(1)
          }}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Almacén" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los almacenes</SelectItem>
            {warehouses.map((w) => (
              <SelectItem key={w.id} value={String(w.id)}>
                {w.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="number"
          placeholder="Precio desde"
          value={unitPriceGte}
          onChange={(e) => {
            setUnitPriceGte(e.target.value)
            setPage(1)
          }}
          className="w-full sm:w-32"
        />

        <Input
          type="number"
          placeholder="Precio hasta"
          value={unitPriceLte}
          onChange={(e) => {
            setUnitPriceLte(e.target.value)
            setPage(1)
          }}
          className="w-full sm:w-32"
        />

        <Input
          type="number"
          placeholder="Stock mínimo"
          value={stockGte}
          onChange={(e) => {
            setStockGte(e.target.value)
            setPage(1)
          }}
          className="w-full sm:w-32"
        />

        <div className="relative w-full sm:w-auto sm:min-w-56">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8"
          />
        </div>
      </ResponsiveFilters>

      <ProductsTable
        data={data?.results ?? []}
        totalPages={totalPages}
        page={page}
        onPageChange={setPage}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      <ProductsForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setEditingProduct(null)
        }}
        product={editingProduct}
      />

      <ProductsDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        product={deletingProduct}
        onConfirm={handleConfirmDelete}
        isPending={deleteProduct.isPending}
      />
    </div>
  )
}
