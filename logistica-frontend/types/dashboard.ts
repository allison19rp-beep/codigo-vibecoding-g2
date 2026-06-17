export type ShipmentStatus = "PENDING" | "CONFIRMED" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED" | "RETURNED"
export type CustomerType = "COMPANY" | "INDIVIDUAL"

export interface KpiData {
  clientesActivos: number
  enviosEnTransito: number
  transporteDisponible: number
  conductoresActivos: number
}

export interface ChartDataItem {
  name: string
  value: number
}

export interface ShipmentTrendItem {
  date: string
  envios: number
}

export interface FleetItem {
  name: string
  cantidad: number
}

export interface DashboardFilters {
  dateFrom: string
  dateTo: string
  status: ShipmentStatus | ""
}
