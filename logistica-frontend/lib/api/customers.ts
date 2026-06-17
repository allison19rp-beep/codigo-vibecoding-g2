import api from "@/lib/axios"
import type { Customer, CustomerFormData, PaginatedResponse, CustomersFilters } from "@/types/customers"

export function getCustomersApi(filters: CustomersFilters) {
  return api.get<PaginatedResponse<Customer>>("/customers/", { params: filters })
}

export function getCustomerApi(id: number) {
  return api.get<Customer>(`/customers/${id}/`)
}

export function createCustomerApi(data: CustomerFormData) {
  return api.post<Customer>("/customers/", data)
}

export function updateCustomerApi(id: number, data: Partial<CustomerFormData>) {
  return api.patch<Customer>(`/customers/${id}/`, data)
}

export function deleteCustomerApi(id: number) {
  return api.delete(`/customers/${id}/`)
}
