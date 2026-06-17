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
import type { Transport } from "@/types/transport"

interface TransportTableProps {
  data: Transport[]
  totalPages: number
  page: number
  onPageChange: (page: number) => void
  onEdit: (transport: Transport) => void
  onDelete: (transport: Transport) => void
  isLoading: boolean
}

const columnHelper = createColumnHelper<Transport>()

const transportTypeColors: Record<string, string> = {
  TRUCK: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  VAN: "bg-green-100 text-green-800 hover:bg-green-100",
  MOTORCYCLE: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  CARGO_BIKE: "bg-purple-100 text-purple-800 hover:bg-purple-100",
}

const transportTypeLabels: Record<string, string> = {
  TRUCK: "Camión",
  VAN: "Van",
  MOTORCYCLE: "Motocicleta",
  CARGO_BIKE: "Bicicleta de carga",
}

export function TransportTable({
  data,
  totalPages,
  page,
  onPageChange,
  onEdit,
  onDelete,
  isLoading,
}: TransportTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const columns = useMemo(
    () => [
      columnHelper.accessor("plate_number", {
        header: "Placa",
      }),
      columnHelper.accessor("transport_type", {
        header: "Tipo",
        cell: ({ getValue }) => {
          const value = getValue()
          return (
            <Badge className={transportTypeColors[value] ?? ""}>
              {transportTypeLabels[value] ?? value}
            </Badge>
          )
        },
      }),
      columnHelper.accessor("brand", {
        header: "Marca",
      }),
      columnHelper.accessor("model", {
        header: "Modelo",
      }),
      columnHelper.accessor("year", {
        header: "Año",
      }),
      columnHelper.accessor("capacity_kg", {
        header: "Capacidad (kg)",
      }),
      columnHelper.accessor("is_available", {
        header: "Disponible",
        cell: ({ getValue }) => {
          const value = getValue()
          return (
            <Badge
              className={
                value
                  ? "bg-green-100 text-green-800 hover:bg-green-100"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-100"
              }
            >
              {value ? "Disponible" : "No disponible"}
            </Badge>
          )
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
        <p className="text-sm text-muted-foreground">No se encontraron vehículos</p>
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
