"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import type { Transport, TransportFormData, PaginatedResponse, TransportFilters } from "@/types/transport"

export function useTransportList(filters: TransportFilters) {
  return useQuery<PaginatedResponse<Transport>>({
    queryKey: ["transport", filters],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Transport>>("/transport/", {
        params: filters,
      })
      return data
    },
  })
}

export function useTransport(id: number | null) {
  return useQuery<Transport>({
    queryKey: ["transport", id],
    queryFn: async () => {
      const { data } = await api.get<Transport>(`/transport/${id}/`)
      return data
    },
    enabled: !!id,
  })
}

export function useCreateTransport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (formData: TransportFormData) => {
      const { data } = await api.post("/transport/", formData)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transport"] })
    },
  })
}

export function useUpdateTransport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data: formData }: { id: number; data: Partial<TransportFormData> }) => {
      const { data } = await api.patch(`/transport/${id}/`, formData)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transport"] })
    },
  })
}

export function useDeleteTransport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/transport/${id}/`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transport"] })
    },
  })
}
