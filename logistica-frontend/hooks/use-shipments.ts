"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import type { Shipment, ShipmentFormData, PaginatedResponse, ShipmentFilters } from "@/types/shipments"

export function useShipments(filters: ShipmentFilters) {
  return useQuery<PaginatedResponse<Shipment>>({
    queryKey: ["shipments", filters],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Shipment>>("/shipments/", {
        params: filters,
      })
      return data
    },
  })
}

export function useShipment(id: number | null) {
  return useQuery<Shipment>({
    queryKey: ["shipments", id],
    queryFn: async () => {
      const { data } = await api.get<Shipment>(`/shipments/${id}/`)
      return data
    },
    enabled: !!id,
  })
}

export function useCreateShipment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (formData: ShipmentFormData) => {
      const { data } = await api.post("/shipments/", formData)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipments"] })
    },
  })
}

export function useUpdateShipment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data: formData }: { id: number; data: Partial<ShipmentFormData> }) => {
      const { data } = await api.patch(`/shipments/${id}/`, formData)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipments"] })
    },
  })
}

export function useDeleteShipment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/shipments/${id}/`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipments"] })
    },
  })
}
