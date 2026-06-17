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
import { CustomersTable } from "@/components/customers-table"
import { CustomersForm } from "@/components/customers-form"
import { CustomersDeleteDialog } from "@/components/customers-delete-dialog"
import { useCustomers, useDeleteCustomer } from "@/hooks/use-customers"
import type { Customer, CustomerType } from "@/types/customers"
import { ResponsiveFilters } from "@/components/responsive-filters"

export default function CustomersPage() {
  const [customerType, setCustomerType] = useState<string>("all")
  const [city, setCity] = useState("")
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [page, setPage] = useState(1)
  const [formOpen, setFormOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null)

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
      customer_type: customerType !== "all" ? (customerType as CustomerType) : undefined,
      city: city || undefined,
    }),
    [page, debouncedSearch, customerType, city],
  )

  const { data, isLoading, isError } = useCustomers(filters)
  const deleteCustomer = useDeleteCustomer()

  useEffect(() => {
    if (isError) {
      toast.error("Error al cargar los clientes")
    }
  }, [isError])

  const totalPages = data ? Math.ceil(data.count / 20) : 0

  const handleEdit = useCallback((customer: Customer) => {
    setEditingCustomer(customer)
    setFormOpen(true)
  }, [])

  const handleDelete = useCallback((customer: Customer) => {
    setDeletingCustomer(customer)
    setDeleteOpen(true)
  }, [])

  const handleConfirmDelete = async () => {
    if (!deletingCustomer) return
    try {
      await deleteCustomer.mutateAsync(deletingCustomer.id)
      toast.success("Cliente eliminado correctamente")
      setDeleteOpen(false)
      setDeletingCustomer(null)
    } catch {
      toast.error("Error al eliminar el cliente")
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold sm:text-2xl">Clientes</h1>
        <Button onClick={() => setFormOpen(true)} className="w-full sm:w-auto">
          <Plus className="size-4" />
          Nuevo cliente
        </Button>
      </div>

      <ResponsiveFilters>
        <Select
          value={customerType}
          onValueChange={(v) => {
            setCustomerType(v ?? "all")
            setPage(1)
          }}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="COMPANY">Empresa</SelectItem>
            <SelectItem value="INDIVIDUAL">Individual</SelectItem>
          </SelectContent>
        </Select>

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
            placeholder="Buscar clientes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8"
          />
        </div>
      </ResponsiveFilters>

      <CustomersTable
        data={data?.results ?? []}
        totalPages={totalPages}
        page={page}
        onPageChange={setPage}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      <CustomersForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setEditingCustomer(null)
        }}
        customer={editingCustomer}
      />

      <CustomersDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        customer={deletingCustomer}
        onConfirm={handleConfirmDelete}
        isPending={deleteCustomer.isPending}
      />
    </div>
  )
}
