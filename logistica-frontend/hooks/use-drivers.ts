"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import type { Driver, DriverFormData, PaginatedResponse, DriverFilters } from "@/types/drivers"
import type { Transport } from "@/types/transport"

export function useDrivers(filters: DriverFilters) {
  return useQuery<PaginatedResponse<Driver>>({
    queryKey: ["drivers", filters],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Driver>>("/drivers/", {
        params: filters,
      })
      return data
    },
  })
}

export function useDriver(id: number | null) {
  return useQuery<Driver>({
    queryKey: ["drivers", id],
    queryFn: async () => {
      const { data } = await api.get<Driver>(`/drivers/${id}/`)
      return data
    },
    enabled: !!id,
  })
}

export function useCreateDriver() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (formData: DriverFormData) => {
      const { data } = await api.post("/drivers/", formData)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] })
    },
  })
}

export function useUpdateDriver() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data: formData }: { id: number; data: Partial<DriverFormData> }) => {
      const { data } = await api.patch(`/drivers/${id}/`, formData)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] })
    },
  })
}

export function useDeleteDriver() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/drivers/${id}/`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] })
    },
  })
}

export function useTransportList() {
  return useQuery<PaginatedResponse<Transport>>({
    queryKey: ["transport", "all"],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Transport>>("/transport/")
      return data
    },
  })
}
