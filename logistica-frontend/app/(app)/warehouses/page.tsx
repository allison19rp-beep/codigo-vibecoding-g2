"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Plus, Search } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { WarehousesTable } from "@/components/warehouses-table"
import { WarehousesForm } from "@/components/warehouses-form"
import { WarehousesDeleteDialog } from "@/components/warehouses-delete-dialog"
import { useWarehouses, useDeleteWarehouse } from "@/hooks/use-warehouses"
import type { Warehouse } from "@/types/warehouses"
import { ResponsiveFilters } from "@/components/responsive-filters"

export default function WarehousesPage() {
  const [city, setCity] = useState("")
  const [capacityGte, setCapacityGte] = useState("")
  const [capacityLte, setCapacityLte] = useState("")
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [page, setPage] = useState(1)
  const [formOpen, setFormOpen] = useState(false)
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingWarehouse, setDeletingWarehouse] = useState<Warehouse | null>(null)

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
      city: city || undefined,
      capacity_m3_gte: capacityGte || undefined,
      capacity_m3_lte: capacityLte || undefined,
    }),
    [page, debouncedSearch, city, capacityGte, capacityLte],
  )

  const { data, isLoading, isError } = useWarehouses(filters)
  const deleteWarehouse = useDeleteWarehouse()

  useEffect(() => {
    if (isError) {
      toast.error("Error al cargar las bodegas")
    }
  }, [isError])

  const totalPages = data ? Math.ceil(data.count / 20) : 0

  const handleEdit = useCallback((warehouse: Warehouse) => {
    setEditingWarehouse(warehouse)
    setFormOpen(true)
  }, [])

  const handleDelete = useCallback((warehouse: Warehouse) => {
    setDeletingWarehouse(warehouse)
    setDeleteOpen(true)
  }, [])

  const handleConfirmDelete = async () => {
    if (!deletingWarehouse) return
    try {
      await deleteWarehouse.mutateAsync(deletingWarehouse.id)
      toast.success("Bodega eliminada correctamente")
      setDeleteOpen(false)
      setDeletingWarehouse(null)
    } catch {
      toast.error("Error al eliminar la bodega")
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold sm:text-2xl">Bodegas</h1>
        <Button onClick={() => setFormOpen(true)} className="w-full sm:w-auto">
          <Plus className="size-4" />
          Nueva bodega
        </Button>
      </div>

      <ResponsiveFilters>
        <Input
          placeholder="Filtrar por ciudad"
          value={city}
          onChange={(e) => {
            setCity(e.target.value)
            setPage(1)
          }}
          className="w-full sm:w-48"
        />

        <Input
          type="number"
          placeholder="Cap. min (m³)"
          value={capacityGte}
          onChange={(e) => {
            setCapacityGte(e.target.value)
            setPage(1)
          }}
          className="w-full sm:w-36"
        />

        <Input
          type="number"
          placeholder="Cap. max (m³)"
          value={capacityLte}
          onChange={(e) => {
            setCapacityLte(e.target.value)
            setPage(1)
          }}
          className="w-full sm:w-36"
        />

        <div className="relative w-full sm:w-auto sm:min-w-56">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar bodegas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8"
          />
        </div>
      </ResponsiveFilters>

      <WarehousesTable
        data={data?.results ?? []}
        totalPages={totalPages}
        page={page}
        onPageChange={setPage}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      <WarehousesForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setEditingWarehouse(null)
        }}
        warehouse={editingWarehouse}
      />

      <WarehousesDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        warehouse={deletingWarehouse}
        onConfirm={handleConfirmDelete}
        isPending={deleteWarehouse.isPending}
      />
    </div>
  )
}
