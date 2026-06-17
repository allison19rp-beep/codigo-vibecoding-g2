"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Plus, Search } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { GroupsTable } from "@/components/groups-table"
import { GroupsForm } from "@/components/groups-form"
import { GroupsDeleteDialog } from "@/components/groups-delete-dialog"
import { useGroups, useDeleteGroup } from "@/hooks/use-groups"
import type { Group } from "@/types/users"
import { ResponsiveFilters } from "@/components/responsive-filters"

export default function GroupsPage() {
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [page, setPage] = useState(1)
  const [formOpen, setFormOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<Group | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingGroup, setDeletingGroup] = useState<Group | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const filters = useMemo(
    () => ({ page, search: debouncedSearch || undefined }),
    [page, debouncedSearch],
  )

  const { data, isLoading, isError } = useGroups(filters)
  const deleteGroup = useDeleteGroup()

  useEffect(() => {
    if (isError) toast.error("Error al cargar los roles")
  }, [isError])

  const totalPages = data ? Math.ceil(data.count / 20) : 0

  const handleEdit = useCallback((group: Group) => {
    setEditingGroup(group)
    setFormOpen(true)
  }, [])

  const handleDelete = useCallback((group: Group) => {
    setDeletingGroup(group)
    setDeleteOpen(true)
  }, [])

  const handleConfirmDelete = async () => {
    if (!deletingGroup) return
    try {
      await deleteGroup.mutateAsync(deletingGroup.id)
      toast.success("Rol eliminado correctamente")
      setDeleteOpen(false)
      setDeletingGroup(null)
    } catch {
      toast.error("Error al eliminar el rol")
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold sm:text-2xl">Roles y permisos</h1>
        <Button onClick={() => setFormOpen(true)} className="w-full sm:w-auto">
          <Plus className="size-4" />
          Nuevo rol
        </Button>
      </div>

      <ResponsiveFilters>
        <div className="relative w-full sm:w-auto sm:min-w-56">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar roles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8"
          />
        </div>
      </ResponsiveFilters>

      <GroupsTable
        data={data?.results ?? []}
        totalPages={totalPages}
        page={page}
        onPageChange={setPage}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      <GroupsForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setEditingGroup(null)
        }}
        group={editingGroup}
      />

      <GroupsDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        group={deletingGroup}
        onConfirm={handleConfirmDelete}
        isPending={deleteGroup.isPending}
      />
    </div>
  )
}
