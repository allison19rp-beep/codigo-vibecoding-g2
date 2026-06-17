"use client"

import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import api from "@/lib/axios"
import type { DashboardFilters, KpiData, ChartDataItem, ShipmentTrendItem, FleetItem } from "@/types/dashboard"
import type { PaginatedResponse } from "@/types/customers"

interface ShipmentResult {
  id: number
  status: string
  created_at: string
}

interface CustomerResult {
  id: number
  is_active: boolean
  customer_type: string
}

interface TransportResult {
  id: number
  transport_type: string
  is_available: boolean
}

interface DriverResult {
  id: number
  is_active: boolean
}

export function useDashboard(filters: DashboardFilters) {
  const shipmentsQuery = useQuery<PaginatedResponse<ShipmentResult>>({
    queryKey: ["dashboard", "shipments", filters],
    queryFn: async () => {
      const params: Record<string, unknown> = { page: 1, page_size: 100 }
      if (filters.status) {
        params.status = filters.status
      }
      const { data } = await api.get<PaginatedResponse<ShipmentResult>>("/shipments/", { params })
      return data
    },
  })

  const customersQuery = useQuery<PaginatedResponse<CustomerResult>>({
    queryKey: ["dashboard", "customers"],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<CustomerResult>>("/customers/")
      return data
    },
  })

  const transportQuery = useQuery<PaginatedResponse<TransportResult>>({
    queryKey: ["dashboard", "transport"],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<TransportResult>>("/transport/")
      return data
    },
  })

  const driversQuery = useQuery<PaginatedResponse<DriverResult>>({
    queryKey: ["dashboard", "drivers"],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<DriverResult>>("/drivers/")
      return data
    },
  })

  const filteredShipments = useMemo(() => {
    if (!shipmentsQuery.data?.results) return [] as ShipmentResult[]
    let list = shipmentsQuery.data.results
    if (filters.dateFrom) {
      const from = new Date(filters.dateFrom)
      list = list.filter(s => new Date(s.created_at) >= from)
    }
    if (filters.dateTo) {
      const to = new Date(filters.dateTo)
      to.setHours(23, 59, 59, 999)
      list = list.filter(s => new Date(s.created_at) <= to)
    }
    return list
  }, [shipmentsQuery.data, filters.dateFrom, filters.dateTo])

  const kpis = useMemo<KpiData>(() => ({
    clientesActivos: customersQuery.data?.results.filter(c => c.is_active).length ?? 0,
    enviosEnTransito: filteredShipments.filter(s => s.status === "IN_TRANSIT").length,
    transporteDisponible: transportQuery.data?.results.filter(t => t.is_available).length ?? 0,
    conductoresActivos: driversQuery.data?.results.filter(d => d.is_active).length ?? 0,
  }), [customersQuery.data, filteredShipments, transportQuery.data, driversQuery.data])

  const shipmentsByStatus = useMemo<ChartDataItem[]>(() => {
    const statusOrder = ["PENDING", "CONFIRMED", "IN_TRANSIT", "DELIVERED", "CANCELLED", "RETURNED"]
    const counts: Record<string, number> = {}
    for (const s of filteredShipments) {
      counts[s.status] = (counts[s.status] ?? 0) + 1
    }
    return statusOrder.map(status => ({
      name: status,
      value: counts[status] ?? 0,
    }))
  }, [filteredShipments])

  const shipmentsByMonth = useMemo<ShipmentTrendItem[]>(() => {
    const counts: Record<string, number> = {}
    for (const s of filteredShipments) {
      const month = s.created_at.slice(0, 7)
      counts[month] = (counts[month] ?? 0) + 1
    }
    return Object.entries(counts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, envios]) => ({ date, envios }))
  }, [filteredShipments])

  const fleetComposition = useMemo<FleetItem[]>(() => {
    const counts: Record<string, number> = {}
    for (const t of transportQuery.data?.results ?? []) {
      counts[t.transport_type] = (counts[t.transport_type] ?? 0) + 1
    }
    return Object.entries(counts).map(([name, cantidad]) => ({ name, cantidad }))
  }, [transportQuery.data])

  const customersByType = useMemo<ChartDataItem[]>(() => {
    const counts: Record<string, number> = {}
    for (const c of customersQuery.data?.results ?? []) {
      counts[c.customer_type] = (counts[c.customer_type] ?? 0) + 1
    }
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [customersQuery.data])

  return {
    kpis,
    shipmentsByStatus,
    shipmentsByMonth,
    fleetComposition,
    customersByType,
    isLoading: shipmentsQuery.isLoading || customersQuery.isLoading || transportQuery.isLoading || driversQuery.isLoading,
    isError: shipmentsQuery.isError || customersQuery.isError || transportQuery.isError || driversQuery.isError,
    error: shipmentsQuery.error ?? customersQuery.error ?? transportQuery.error ?? driversQuery.error ?? null,
    refetch: () => {
      shipmentsQuery.refetch()
      customersQuery.refetch()
      transportQuery.refetch()
      driversQuery.refetch()
    },
  }
}
