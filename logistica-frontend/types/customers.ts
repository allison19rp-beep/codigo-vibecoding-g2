export type CustomerType = "COMPANY" | "INDIVIDUAL"

export interface Customer {
  id: number
  name: string
  customer_type: CustomerType
  tax_id: string | null
  email: string
  phone: string
  address: string
  city: string
  country: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CustomerFormData {
  name: string
  customer_type: CustomerType
  tax_id?: string
  email: string
  phone: string
  address: string
  city: string
  country?: string
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface CustomersFilters {
  page: number
  search?: string
  customer_type?: CustomerType
  city?: string
  ordering?: string
}
