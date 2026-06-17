"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import type { Customer, CustomerFormData, PaginatedResponse, CustomersFilters } from "@/types/customers"

export function useCustomers(filters: CustomersFilters) {
  return useQuery<PaginatedResponse<Customer>>({
    queryKey: ["customers", filters],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Customer>>("/customers/", {
        params: filters,
      })
      return data
    },
  })
}

export function useCustomer(id: number | null) {
  return useQuery<Customer>({
    queryKey: ["customers", id],
    queryFn: async () => {
      const { data } = await api.get<Customer>(`/customers/${id}/`)
      return data
    },
    enabled: !!id,
  })
}

export function useCreateCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (formData: CustomerFormData) => {
      const { data } = await api.post("/customers/", formData)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] })
    },
  })
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data: formData }: { id: number; data: Partial<CustomerFormData> }) => {
      const { data } = await api.patch(`/customers/${id}/`, formData)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] })
    },
  })
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/customers/${id}/`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] })
    },
  })
}
