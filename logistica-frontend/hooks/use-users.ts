"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import type { User, UserFormData, PaginatedResponse, UsersFilters } from "@/types/users"

export function useUsers(filters: UsersFilters) {
  return useQuery<PaginatedResponse<User>>({
    queryKey: ["users", filters],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<User>>("/auth/users/", {
        params: filters,
      })
      return data
    },
  })
}

export function useUser(id: number | null) {
  return useQuery<User>({
    queryKey: ["users", id],
    queryFn: async () => {
      const { data } = await api.get<User>(`/auth/users/${id}/`)
      return data
    },
    enabled: !!id,
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (formData: UserFormData) => {
      const { data } = await api.post("/auth/users/", formData)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data: formData }: { id: number; data: Partial<UserFormData> }) => {
      const { data } = await api.patch(`/auth/users/${id}/`, formData)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/auth/users/${id}/`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })
}
