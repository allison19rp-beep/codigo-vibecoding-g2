"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { useDashboard } from "@/hooks/use-dashboard"
import { DashboardFilters } from "@/components/dashboard/dashboard-filters"
import { KpiCards } from "@/components/dashboard/kpi-cards"
import { ShipmentsStatusChart } from "@/components/dashboard/shipments-status-chart"
import { ShipmentsTrendChart } from "@/components/dashboard/shipments-trend-chart"
import { FleetComposition } from "@/components/dashboard/fleet-composition"
import { CustomersByType } from "@/components/dashboard/customers-by-type"
import type { DashboardFilters as Filters } from "@/types/dashboard"

export default function DashboardPage() {
  const [filters, setFilters] = useState<Filters>({
    dateFrom: "",
    dateTo: "",
    status: "",
  })

  const {
    kpis,
    shipmentsByStatus,
    shipmentsByMonth,
    fleetComposition,
    customersByType,
    isLoading,
    isError,
  } = useDashboard(filters)

  useEffect(() => {
    if (isError) {
      toast.error("Error al cargar datos del dashboard")
    }
  }, [isError])

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold sm:text-2xl">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Resumen general del sistema</p>
      </div>
      <DashboardFilters filters={filters} onFiltersChange={setFilters} />
      <KpiCards data={kpis} isLoading={isLoading} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
        <ShipmentsStatusChart data={shipmentsByStatus} isLoading={isLoading} />
        <ShipmentsTrendChart data={shipmentsByMonth} isLoading={isLoading} />
        <FleetComposition data={fleetComposition} isLoading={isLoading} />
        <CustomersByType data={customersByType} isLoading={isLoading} />
      </div>
    </div>
  )
}
