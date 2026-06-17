export interface RouteStop {
  id: number
  route: number
  stop_order: number
  address: string
  city: string
  latitude: string | null
  longitude: string | null
  estimated_offset_hours: string
}

export interface Route {
  id: number
  origin_warehouse: number
  origin_warehouse_name: string
  name: string
  estimated_duration_hours: string
  estimated_distance_km: string
  is_active: boolean
  created_at: string
  updated_at: string
  stops?: RouteStop[]
}

export interface RouteFormData {
  origin_warehouse: number | ""
  name: string
  estimated_duration_hours: string
  estimated_distance_km: string
}

export interface RouteFilters {
  page: number
  search?: string
  origin_warehouse?: string
  ordering?: string
}

export interface RouteStopFormData {
  stop_order: number
  address: string
  city: string
  latitude?: string
  longitude?: string
  estimated_offset_hours: string
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}
