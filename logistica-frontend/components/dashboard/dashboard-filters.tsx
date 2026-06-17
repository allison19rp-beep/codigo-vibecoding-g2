"use client"

import { useState } from "react"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import type { DashboardFilters as Filters, ShipmentStatus } from "@/types/dashboard"

interface DashboardFiltersProps {
  filters: Filters
  onFiltersChange: (filters: Filters) => void
}

export function DashboardFilters({ filters, onFiltersChange }: DashboardFiltersProps) {
  const [dateFrom, setDateFrom] = useState(filters.dateFrom)
  const [dateTo, setDateTo] = useState(filters.dateTo)
  const [status, setStatus] = useState<string>(filters.status)

  const handleApply = () => {
    onFiltersChange({
      dateFrom,
      dateTo,
      status: status as ShipmentStatus | "",
    })
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:flex-wrap">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-muted-foreground">Desde</label>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm sm:w-auto"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-muted-foreground">Hasta</label>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm sm:w-auto"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-muted-foreground">Estado</label>
        <Select value={status} onValueChange={(v) => setStatus(v ?? "")}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos</SelectItem>
            <SelectItem value="PENDING">Pendiente</SelectItem>
            <SelectItem value="CONFIRMED">Confirmado</SelectItem>
            <SelectItem value="IN_TRANSIT">En tránsito</SelectItem>
            <SelectItem value="DELIVERED">Entregado</SelectItem>
            <SelectItem value="CANCELLED">Cancelado</SelectItem>
            <SelectItem value="RETURNED">Devuelto</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button onClick={handleApply} className="w-full sm:w-auto">Aplicar filtros</Button>
    </div>
  )
}
