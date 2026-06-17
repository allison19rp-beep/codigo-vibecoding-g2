export interface Supplier {
  id: number
  name: string
  tax_id: string | null
  contact_name: string
  email: string
  phone: string
  address: string
  city: string
  country: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SupplierFormData {
  name: string
  tax_id?: string
  contact_name: string
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

export interface SupplierFilters {
  page: number
  search?: string
  city?: string
  ordering?: string
}
