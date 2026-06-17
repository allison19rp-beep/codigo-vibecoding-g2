"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import type { Route, RouteFormData, RouteStop, RouteStopFormData, PaginatedResponse, RouteFilters } from "@/types/routes"

export function useRoutes(filters: RouteFilters) {
  return useQuery<PaginatedResponse<Route>>({
    queryKey: ["routes", filters],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Route>>("/routes/", {
        params: filters,
      })
      return data
    },
  })
}

export function useRoute(id: number | null) {
  return useQuery<Route>({
    queryKey: ["routes", id],
    queryFn: async () => {
      const { data } = await api.get<Route>(`/routes/${id}/`)
      return data
    },
    enabled: !!id,
  })
}

export function useCreateRoute() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (formData: RouteFormData) => {
      const { data } = await api.post("/routes/", formData)
      return data as Route
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routes"] })
    },
  })
}

export function useUpdateRoute() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data: formData }: { id: number; data: Partial<RouteFormData> }) => {
      const { data } = await api.patch(`/routes/${id}/`, formData)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routes"] })
    },
  })
}

export function useDeleteRoute() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/routes/${id}/`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routes"] })
    },
  })
}

export function useRouteStops(routeId: number | null) {
  return useQuery<RouteStop[]>({
    queryKey: ["route-stops", routeId],
    queryFn: async () => {
      const { data } = await api.get<RouteStop[]>(`/routes/${routeId}/stops/`)
      return data
    },
    enabled: !!routeId,
  })
}

export function useCreateRouteStop(routeId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (formData: RouteStopFormData) => {
      const { data } = await api.post(`/routes/${routeId}/stops/`, formData)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["route-stops", routeId] })
    },
  })
}
