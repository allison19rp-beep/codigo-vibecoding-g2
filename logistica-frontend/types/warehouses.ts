export interface Warehouse {
  id: number
  name: string
  address: string
  city: string
  country: string
  latitude: string | null
  longitude: string | null
  capacity_m3: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface WarehouseFormData {
  name: string
  address: string
  city: string
  country?: string
  latitude?: string
  longitude?: string
  capacity_m3: string
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface WarehouseFilters {
  page: number
  search?: string
  city?: string
  capacity_m3_gte?: string
  capacity_m3_lte?: string
  ordering?: string
}
