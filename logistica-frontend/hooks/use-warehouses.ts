"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import type { Warehouse, WarehouseFormData, PaginatedResponse, WarehouseFilters } from "@/types/warehouses"

export function useWarehouses(filters: WarehouseFilters) {
  return useQuery<PaginatedResponse<Warehouse>>({
    queryKey: ["warehouses", filters],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Warehouse>>("/warehouses/", {
        params: filters,
      })
      return data
    },
  })
}

export function useWarehouse(id: number | null) {
  return useQuery<Warehouse>({
    queryKey: ["warehouses", id],
    queryFn: async () => {
      const { data } = await api.get<Warehouse>(`/warehouses/${id}/`)
      return data
    },
    enabled: !!id,
  })
}

export function useCreateWarehouse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (formData: WarehouseFormData) => {
      const { data } = await api.post("/warehouses/", formData)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] })
    },
  })
}

export function useUpdateWarehouse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data: formData }: { id: number; data: Partial<WarehouseFormData> }) => {
      const { data } = await api.patch(`/warehouses/${id}/`, formData)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] })
    },
  })
}

export function useDeleteWarehouse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/warehouses/${id}/`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] })
    },
  })
}

export function useWarehouseList() {
  return useQuery<PaginatedResponse<Warehouse>>({
    queryKey: ["warehouses", "all"],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Warehouse>>("/warehouses/", {
        params: { is_active: true, page_size: 100 },
      })
      return data
    },
  })
}
