"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Plus, Search } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UsersTable } from "@/components/users-table"
import { UsersForm } from "@/components/users-form"
import { UsersDeleteDialog } from "@/components/users-delete-dialog"
import { useUsers, useDeleteUser } from "@/hooks/use-users"
import type { User } from "@/types/users"
import { ResponsiveFilters } from "@/components/responsive-filters"

export default function UsersPage() {
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [page, setPage] = useState(1)
  const [formOpen, setFormOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingUser, setDeletingUser] = useState<User | null>(null)

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
    }),
    [page, debouncedSearch],
  )

  const { data, isLoading, isError } = useUsers(filters)
  const deleteUser = useDeleteUser()

  useEffect(() => {
    if (isError) {
      toast.error("Error al cargar los usuarios")
    }
  }, [isError])

  const totalPages = data ? Math.ceil(data.count / 20) : 0

  const handleEdit = useCallback((user: User) => {
    setEditingUser(user)
    setFormOpen(true)
  }, [])

  const handleDelete = useCallback((user: User) => {
    setDeletingUser(user)
    setDeleteOpen(true)
  }, [])

  const handleConfirmDelete = async () => {
    if (!deletingUser) return
    try {
      await deleteUser.mutateAsync(deletingUser.id)
      toast.success("Usuario eliminado correctamente")
      setDeleteOpen(false)
      setDeletingUser(null)
    } catch {
      toast.error("Error al eliminar el usuario")
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold sm:text-2xl">Usuarios</h1>
        <Button onClick={() => setFormOpen(true)} className="w-full sm:w-auto">
          <Plus className="size-4" />
          Nuevo usuario
        </Button>
      </div>

      <ResponsiveFilters>
        <div className="relative w-full sm:w-auto sm:min-w-56">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar usuarios..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8"
          />
        </div>
      </ResponsiveFilters>

      <UsersTable
        data={data?.results ?? []}
        totalPages={totalPages}
        page={page}
        onPageChange={setPage}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      <UsersForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setEditingUser(null)
        }}
        user={editingUser}
      />

      <UsersDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        user={deletingUser}
        onConfirm={handleConfirmDelete}
        isPending={deleteUser.isPending}
      />
    </div>
  )
}
