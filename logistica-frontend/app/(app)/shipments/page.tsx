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
import { ShipmentsTable } from "@/components/shipments-table"
import { ShipmentsForm } from "@/components/shipments-form"
import { ShipmentsDeleteDialog } from "@/components/shipments-delete-dialog"
import { useShipments, useDeleteShipment } from "@/hooks/use-shipments"
import { useWarehouseList } from "@/hooks/use-warehouses"
import type { Shipment, ShipmentStatus } from "@/types/shipments"
import { ResponsiveFilters } from "@/components/responsive-filters"

const statusOptions = [
  { value: "", label: "Todos los estados" },
  { value: "PENDING", label: "Pendiente" },
  { value: "CONFIRMED", label: "Confirmado" },
  { value: "IN_TRANSIT", label: "En tránsito" },
  { value: "DELIVERED", label: "Entregado" },
  { value: "CANCELLED", label: "Cancelado" },
  { value: "RETURNED", label: "Devuelto" },
] as const

export default function ShipmentsPage() {
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [status, setStatus] = useState("")
  const [originWarehouse, setOriginWarehouse] = useState("")
  const [page, setPage] = useState(1)
  const [formOpen, setFormOpen] = useState(false)
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingShipment, setDeletingShipment] = useState<Shipment | null>(null)

  const { data: warehousesData } = useWarehouseList()

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
      status: (status ? status : undefined) as ShipmentStatus | undefined,
      origin_warehouse: originWarehouse || undefined,
    }),
    [page, debouncedSearch, status, originWarehouse],
  )

  const { data, isLoading, isError } = useShipments(filters)
  const deleteShipment = useDeleteShipment()

  useEffect(() => {
    if (isError) {
      toast.error("Error al cargar los envíos")
    }
  }, [isError])

  const totalPages = data ? Math.ceil(data.count / 20) : 0

  const handleEdit = useCallback((shipment: Shipment) => {
    setEditingShipment(shipment)
    setFormOpen(true)
  }, [])

  const handleDelete = useCallback((shipment: Shipment) => {
    setDeletingShipment(shipment)
    setDeleteOpen(true)
  }, [])

  const handleConfirmDelete = async () => {
    if (!deletingShipment) return
    try {
      await deleteShipment.mutateAsync(deletingShipment.id)
      toast.success("Envío eliminado correctamente")
      setDeleteOpen(false)
      setDeletingShipment(null)
    } catch {
      toast.error("Error al eliminar el envío")
    }
  }

  const warehouses = warehousesData?.results ?? []

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold sm:text-2xl">Envíos</h1>
        <Button onClick={() => setFormOpen(true)} className="w-full sm:w-auto">
          <Plus className="size-4" />
          Nuevo envío
        </Button>
      </div>

      <ResponsiveFilters>
        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v ?? "")
            setPage(1)
          }}
        >
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={originWarehouse}
          onValueChange={(v) => {
            setOriginWarehouse(v ?? "")
            setPage(1)
          }}
        >
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder="Bodega de origen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todas las bodegas</SelectItem>
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
            placeholder="Buscar por tracking, cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8"
          />
        </div>
      </ResponsiveFilters>

      <ShipmentsTable
        data={data?.results ?? []}
        totalPages={totalPages}
        page={page}
        onPageChange={setPage}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      <ShipmentsForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setEditingShipment(null)
        }}
        shipment={editingShipment}
      />

      <ShipmentsDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        shipment={deletingShipment}
        onConfirm={handleConfirmDelete}
        isPending={deleteShipment.isPending}
      />
    </div>
  )
}
