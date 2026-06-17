"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import type { Group, GroupFormData, Permission, PaginatedResponse, GroupsFilters } from "@/types/users"

export function useGroups(filters: GroupsFilters) {
  return useQuery<PaginatedResponse<Group>>({
    queryKey: ["groups", filters],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Group>>("/auth/groups/", {
        params: filters,
      })
      return data
    },
  })
}

export function useGroup(id: number | null) {
  return useQuery<Group>({
    queryKey: ["groups", id],
    queryFn: async () => {
      const { data } = await api.get<Group>(`/auth/groups/${id}/`)
      return data
    },
    enabled: !!id,
  })
}

export function useCreateGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (formData: GroupFormData) => {
      const { data } = await api.post("/auth/groups/", formData)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] })
    },
  })
}

export function useUpdateGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data: formData }: { id: number; data: Partial<GroupFormData> }) => {
      const { data } = await api.patch(`/auth/groups/${id}/`, formData)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] })
    },
  })
}

export function useDeleteGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/auth/groups/${id}/`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] })
    },
  })
}

export function useAllGroups() {
  return useQuery<Group[]>({
    queryKey: ["groups", "all"],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Group>>("/auth/groups/", {
        params: { page_size: 100 },
      })
      return data.results
    },
  })
}

export function usePermissions() {
  return useQuery<Permission[]>({
    queryKey: ["permissions"],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Permission>>("/auth/permissions/")
      return data.results
    },
  })
}
