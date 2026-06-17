"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import type { Product, ProductFormData, PaginatedResponse, ProductFilters } from "@/types/products"
import type { Supplier } from "@/types/suppliers"
import type { Warehouse } from "@/types/warehouses"

export function useProducts(filters: ProductFilters) {
  return useQuery<PaginatedResponse<Product>>({
    queryKey: ["products", filters],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Product>>("/products/", {
        params: filters,
      })
      return data
    },
  })
}

export function useProduct(id: number | null) {
  return useQuery<Product>({
    queryKey: ["products", id],
    queryFn: async () => {
      const { data } = await api.get<Product>(`/products/${id}/`)
      return data
    },
    enabled: !!id,
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (formData: ProductFormData) => {
      const { data } = await api.post("/products/", formData)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
    },
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data: formData }: { id: number; data: Partial<ProductFormData> }) => {
      const { data } = await api.patch(`/products/${id}/`, formData)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/products/${id}/`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
    },
  })
}

export function useSuppliersList() {
  return useQuery<PaginatedResponse<Supplier>>({
    queryKey: ["suppliers", "all"],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Supplier>>("/suppliers/")
      return data
    },
  })
}

export function useWarehousesList() {
  return useQuery<PaginatedResponse<Warehouse>>({
    queryKey: ["warehouses", "all"],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Warehouse>>("/warehouses/")
      return data
    },
  })
}
