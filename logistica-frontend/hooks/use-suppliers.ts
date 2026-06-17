"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import type { Supplier, SupplierFormData, PaginatedResponse, SupplierFilters } from "@/types/suppliers"

export function useSuppliers(filters: SupplierFilters) {
  return useQuery<PaginatedResponse<Supplier>>({
    queryKey: ["suppliers", filters],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Supplier>>("/suppliers/", {
        params: filters,
      })
      return data
    },
  })
}

export function useSupplier(id: number | null) {
  return useQuery<Supplier>({
    queryKey: ["suppliers", id],
    queryFn: async () => {
      const { data } = await api.get<Supplier>(`/suppliers/${id}/`)
      return data
    },
    enabled: !!id,
  })
}

export function useCreateSupplier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (formData: SupplierFormData) => {
      const { data } = await api.post("/suppliers/", formData)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] })
    },
  })
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data: formData }: { id: number; data: Partial<SupplierFormData> }) => {
      const { data } = await api.patch(`/suppliers/${id}/`, formData)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] })
    },
  })
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/suppliers/${id}/`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] })
    },
  })
}
