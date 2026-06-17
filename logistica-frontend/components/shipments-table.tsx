"use client"

import { useMemo, useState } from "react"
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from "@tanstack/react-table"
import { Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import type { Shipment, ShipmentStatus } from "@/types/shipments"

interface ShipmentsTableProps {
  data: Shipment[]
  totalPages: number
  page: number
  onPageChange: (page: number) => void
  onEdit: (shipment: Shipment) => void
  onDelete: (shipment: Shipment) => void
  isLoading: boolean
}

const statusLabels: Record<ShipmentStatus, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmado",
  IN_TRANSIT: "En tránsito",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
  RETURNED: "Devuelto",
}

const statusVariants: Record<ShipmentStatus, "secondary" | "default" | "outline" | "destructive"> = {
  PENDING: "secondary",
  CONFIRMED: "default",
  IN_TRANSIT: "outline",
  DELIVERED: "default",
  CANCELLED: "destructive",
  RETURNED: "secondary",
}

const columnHelper = createColumnHelper<Shipment>()

export function ShipmentsTable({
  data,
  totalPages,
  page,
  onPageChange,
  onEdit,
  onDelete,
  isLoading,
}: ShipmentsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const columns = useMemo(
    () => [
      columnHelper.accessor("tracking_number", {
        header: "Tracking",
      }),
      columnHelper.accessor("customer_name", {
        header: "Cliente",
      }),
      columnHelper.accessor("destination_city", {
        header: "Ciudad destino",
      }),
      columnHelper.accessor("status", {
        header: "Estado",
        cell: ({ getValue }) => {
          const value = getValue()
          return (
            <Badge variant={statusVariants[value] ?? "secondary"}>
              {statusLabels[value] ?? value}
            </Badge>
          )
        },
      }),
      columnHelper.accessor("calculated_cost", {
        header: "Costo total",
        cell: ({ getValue }) => {
          const value = getValue()
          const num = Number.parseFloat(value)
          return isNaN(num) ? value : `$${num.toLocaleString("es-CO", { minimumFractionDigits: 2 })}`
        },
      }),
      columnHelper.accessor("created_at", {
        header: "Creado",
        cell: ({ getValue }) => {
          const value = getValue()
          return new Date(value).toLocaleDateString("es-CO")
        },
      }),
      columnHelper.display({
        id: "actions",
        header: "Acciones",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon-sm" onClick={() => onEdit(row.original)}>
              <Pencil className="size-4" />
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={() => onDelete(row.original)}>
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </div>
        ),
      }),
    ],
    [onEdit, onDelete],
  )

  const table = useReactTable({
    data,
    columns,
    pageCount: totalPages,
    manualPagination: true,
    state: {
      sorting,
      pagination: {
        pageIndex: page - 1,
        pageSize: 20,
      },
    },
    onSortingChange: setSorting,
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const current = { pageIndex: page - 1, pageSize: 20 }
        const next = updater(current)
        onPageChange(next.pageIndex + 1)
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-muted-foreground">No se encontraron envíos</p>
      </div>
    )
  }

  return (
    <div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const canSort = header.column.getCanSort()
                return (
                  <TableHead
                    key={header.id}
                    onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                    className={canSort ? "cursor-pointer select-none" : ""}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                    {{
                      asc: " ▲",
                      desc: " ▼",
                    }[header.column.getIsSorted() as string] ?? null}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between px-2 py-4">
        <p className="text-sm text-muted-foreground">
          Página {page} de {totalPages || 1}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft className="size-4" />
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            Siguiente
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
