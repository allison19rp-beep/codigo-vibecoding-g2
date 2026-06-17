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
import { RoutesTable } from "@/components/routes-table"
import { RoutesForm } from "@/components/routes-form"
import { RoutesDeleteDialog } from "@/components/routes-delete-dialog"
import { useRoutes, useDeleteRoute } from "@/hooks/use-routes"
import { useWarehouseList } from "@/hooks/use-warehouses"
import type { Route } from "@/types/routes"
import { ResponsiveFilters } from "@/components/responsive-filters"

export default function RoutesPage() {
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [originWarehouse, setOriginWarehouse] = useState("")
  const [page, setPage] = useState(1)
  const [formOpen, setFormOpen] = useState(false)
  const [editingRoute, setEditingRoute] = useState<Route | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingRoute, setDeletingRoute] = useState<Route | null>(null)

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
      origin_warehouse: originWarehouse || undefined,
    }),
    [page, debouncedSearch, originWarehouse],
  )

  const { data, isLoading, isError } = useRoutes(filters)
  const deleteRoute = useDeleteRoute()
  const { data: warehouseData } = useWarehouseList()

  useEffect(() => {
    if (isError) {
      toast.error("Error al cargar las rutas")
    }
  }, [isError])

  const totalPages = data ? Math.ceil(data.count / 20) : 0

  const handleEdit = useCallback((route: Route) => {
    setEditingRoute(route)
    setFormOpen(true)
  }, [])

  const handleDelete = useCallback((route: Route) => {
    setDeletingRoute(route)
    setDeleteOpen(true)
  }, [])

  const handleConfirmDelete = async () => {
    if (!deletingRoute) return
    try {
      await deleteRoute.mutateAsync(deletingRoute.id)
      toast.success("Ruta desactivada correctamente")
      setDeleteOpen(false)
      setDeletingRoute(null)
    } catch {
      toast.error("Error al desactivar la ruta")
    }
  }

  const warehouses = warehouseData?.results ?? []

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold sm:text-2xl">Rutas</h1>
        <Button onClick={() => setFormOpen(true)} className="w-full sm:w-auto">
          <Plus className="size-4" />
          Nueva ruta
        </Button>
      </div>

      <ResponsiveFilters>
        <Select
          value={originWarehouse}
          onValueChange={(v) => {
            setOriginWarehouse(v ?? "")
            setPage(1)
          }}
        >
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder="Todos los almacenes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos los almacenes</SelectItem>
            {warehouses.map((w) => (
              <SelectItem key={w.id} value={String(w.id)}>
                {w.name} - {w.city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative w-full sm:w-auto sm:min-w-56">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar rutas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8"
          />
        </div>
      </ResponsiveFilters>

      <RoutesTable
        data={data?.results ?? []}
        totalPages={totalPages}
        page={page}
        onPageChange={setPage}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      <RoutesForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setEditingRoute(null)
        }}
        route={editingRoute}
      />

      <RoutesDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        route={deletingRoute}
        onConfirm={handleConfirmDelete}
        isPending={deleteRoute.isPending}
      />
    </div>
  )
}
