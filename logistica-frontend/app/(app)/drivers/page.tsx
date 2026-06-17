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
import { DriversTable } from "@/components/drivers-table"
import { DriversForm } from "@/components/drivers-form"
import { DriversDeleteDialog } from "@/components/drivers-delete-dialog"
import { useDrivers, useDeleteDriver } from "@/hooks/use-drivers"
import type { Driver } from "@/types/drivers"
import { ResponsiveFilters } from "@/components/responsive-filters"

export default function DriversPage() {
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [isActive, setIsActive] = useState("")
  const [page, setPage] = useState(1)
  const [formOpen, setFormOpen] = useState(false)
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingDriver, setDeletingDriver] = useState<Driver | null>(null)

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
      is_active: (isActive ? isActive : undefined) as "true" | "false" | undefined,
    }),
    [page, debouncedSearch, isActive],
  )

  const { data, isLoading, isError } = useDrivers(filters)
  const deleteDriver = useDeleteDriver()

  useEffect(() => {
    if (isError) {
      toast.error("Error al cargar los conductores")
    }
  }, [isError])

  const totalPages = data ? Math.ceil(data.count / 20) : 0

  const handleEdit = useCallback((driver: Driver) => {
    setEditingDriver(driver)
    setFormOpen(true)
  }, [])

  const handleDelete = useCallback((driver: Driver) => {
    setDeletingDriver(driver)
    setDeleteOpen(true)
  }, [])

  const handleConfirmDelete = async () => {
    if (!deletingDriver) return
    try {
      await deleteDriver.mutateAsync(deletingDriver.id)
      toast.success("Conductor desactivado correctamente")
      setDeleteOpen(false)
      setDeletingDriver(null)
    } catch {
      toast.error("Error al desactivar el conductor")
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold sm:text-2xl">Conductores</h1>
        <Button onClick={() => setFormOpen(true)} className="w-full sm:w-auto">
          <Plus className="size-4" />
          Nuevo conductor
        </Button>
      </div>

      <ResponsiveFilters>
        <Select
          value={isActive}
          onValueChange={(v) => {
            setIsActive(v ?? "")
            setPage(1)
          }}
        >
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos</SelectItem>
            <SelectItem value="true">Sí</SelectItem>
            <SelectItem value="false">No</SelectItem>
          </SelectContent>
        </Select>

        <div className="relative w-full sm:w-auto sm:min-w-56">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar conductores..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8"
          />
        </div>
      </ResponsiveFilters>

      <DriversTable
        data={data?.results ?? []}
        totalPages={totalPages}
        page={page}
        onPageChange={setPage}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      <DriversForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setEditingDriver(null)
        }}
        driver={editingDriver}
      />

      <DriversDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        driver={deletingDriver}
        onConfirm={handleConfirmDelete}
        isPending={deleteDriver.isPending}
      />
    </div>
  )
}
