"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Plus, Search } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SuppliersTable } from "@/components/suppliers-table"
import { SuppliersForm } from "@/components/suppliers-form"
import { SuppliersDeleteDialog } from "@/components/suppliers-delete-dialog"
import { useSuppliers, useDeleteSupplier } from "@/hooks/use-suppliers"
import type { Supplier } from "@/types/suppliers"
import { ResponsiveFilters } from "@/components/responsive-filters"

export default function SuppliersPage() {
  const [city, setCity] = useState("")
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [page, setPage] = useState(1)
  const [formOpen, setFormOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(null)

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
    }),
    [page, debouncedSearch, city],
  )

  const { data, isLoading, isError } = useSuppliers(filters)
  const deleteSupplier = useDeleteSupplier()

  useEffect(() => {
    if (isError) {
      toast.error("Error al cargar los proveedores")
    }
  }, [isError])

  const totalPages = data ? Math.ceil(data.count / 20) : 0

  const handleEdit = useCallback((supplier: Supplier) => {
    setEditingSupplier(supplier)
    setFormOpen(true)
  }, [])

  const handleDelete = useCallback((supplier: Supplier) => {
    setDeletingSupplier(supplier)
    setDeleteOpen(true)
  }, [])

  const handleConfirmDelete = async () => {
    if (!deletingSupplier) return
    try {
      await deleteSupplier.mutateAsync(deletingSupplier.id)
      toast.success("Proveedor eliminado correctamente")
      setDeleteOpen(false)
      setDeletingSupplier(null)
    } catch {
      toast.error("Error al eliminar el proveedor")
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold sm:text-2xl">Proveedores</h1>
        <Button onClick={() => setFormOpen(true)} className="w-full sm:w-auto">
          <Plus className="size-4" />
          Nuevo proveedor
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

        <div className="relative w-full sm:w-auto sm:min-w-56">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar proveedores..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8"
          />
        </div>
      </ResponsiveFilters>

      <SuppliersTable
        data={data?.results ?? []}
        totalPages={totalPages}
        page={page}
        onPageChange={setPage}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      <SuppliersForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setEditingSupplier(null)
        }}
        supplier={editingSupplier}
      />

      <SuppliersDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        supplier={deletingSupplier}
        onConfirm={handleConfirmDelete}
        isPending={deleteSupplier.isPending}
      />
    </div>
  )
}
