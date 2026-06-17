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
import { TransportTable } from "@/components/transport-table"
import { TransportForm } from "@/components/transport-form"
import { TransportDeleteDialog } from "@/components/transport-delete-dialog"
import { useTransportList, useDeleteTransport } from "@/hooks/use-transport"
import type { Transport, TransportType } from "@/types/transport"
import { ResponsiveFilters } from "@/components/responsive-filters"

export default function TransportPage() {
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [transportType, setTransportType] = useState<string>("all")
  const [isAvailable, setIsAvailable] = useState<string>("all")
  const [capacityKgGte, setCapacityKgGte] = useState("")
  const [capacityKgLte, setCapacityKgLte] = useState("")
  const [page, setPage] = useState(1)
  const [formOpen, setFormOpen] = useState(false)
  const [editingTransport, setEditingTransport] = useState<Transport | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingTransport, setDeletingTransport] = useState<Transport | null>(null)

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
      transport_type: transportType !== "all" ? (transportType as TransportType) : undefined,
      is_available: isAvailable !== "all" ? (isAvailable === "true" ? true : false) : undefined,
      capacity_kg_gte: capacityKgGte || undefined,
      capacity_kg_lte: capacityKgLte || undefined,
    }),
    [page, debouncedSearch, transportType, isAvailable, capacityKgGte, capacityKgLte],
  )

  const { data, isLoading, isError } = useTransportList(filters)
  const deleteTransport = useDeleteTransport()

  useEffect(() => {
    if (isError) {
      toast.error("Error al cargar los vehículos")
    }
  }, [isError])

  const totalPages = data ? Math.ceil(data.count / 20) : 0

  const handleEdit = useCallback((transport: Transport) => {
    setEditingTransport(transport)
    setFormOpen(true)
  }, [])

  const handleDelete = useCallback((transport: Transport) => {
    setDeletingTransport(transport)
    setDeleteOpen(true)
  }, [])

  const handleConfirmDelete = async () => {
    if (!deletingTransport) return
    try {
      await deleteTransport.mutateAsync(deletingTransport.id)
      toast.success("Vehículo eliminado correctamente")
      setDeleteOpen(false)
      setDeletingTransport(null)
    } catch {
      toast.error("Error al eliminar el vehículo")
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold sm:text-2xl">Vehículos</h1>
        <Button onClick={() => setFormOpen(true)} className="w-full sm:w-auto">
          <Plus className="size-4" />
          Nuevo vehículo
        </Button>
      </div>

      <ResponsiveFilters>
        <Select
          value={transportType}
          onValueChange={(v) => {
            setTransportType(v ?? "all")
            setPage(1)
          }}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            <SelectItem value="TRUCK">Camión</SelectItem>
            <SelectItem value="VAN">Van</SelectItem>
            <SelectItem value="MOTORCYCLE">Motocicleta</SelectItem>
            <SelectItem value="CARGO_BIKE">Bicicleta de carga</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={isAvailable}
          onValueChange={(v) => {
            setIsAvailable(v ?? "all")
            setPage(1)
          }}
        >
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="true">Disponible</SelectItem>
            <SelectItem value="false">No disponible</SelectItem>
          </SelectContent>
        </Select>

        <Input
          type="number"
          placeholder="Capacidad mín (kg)"
          value={capacityKgGte}
          onChange={(e) => {
            setCapacityKgGte(e.target.value)
            setPage(1)
          }}
          className="w-full sm:w-36"
        />

        <Input
          type="number"
          placeholder="Capacidad máx (kg)"
          value={capacityKgLte}
          onChange={(e) => {
            setCapacityKgLte(e.target.value)
            setPage(1)
          }}
          className="w-full sm:w-36"
        />

        <div className="relative w-full sm:w-auto sm:min-w-56">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por placa, marca o modelo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8"
          />
        </div>
      </ResponsiveFilters>

      <TransportTable
        data={data?.results ?? []}
        totalPages={totalPages}
        page={page}
        onPageChange={setPage}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      <TransportForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setEditingTransport(null)
        }}
        transport={editingTransport}
      />

      <TransportDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        transport={deletingTransport}
        onConfirm={handleConfirmDelete}
        isPending={deleteTransport.isPending}
      />
    </div>
  )
}
