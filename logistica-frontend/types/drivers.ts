export interface Driver {
  id: number
  user_full_name: string
  user_email: string
  user_username: string
  license_number: string
  license_expiry: string
  phone: string
  transport: number | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface DriverFormData {
  user_full_name: string
  user_email: string
  license_number: string
  license_expiry: string
  phone: string
  transport?: number | null
  is_active?: boolean
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface DriverFilters {
  page: number
  search?: string
  is_active?: "true" | "false" | ""
}
