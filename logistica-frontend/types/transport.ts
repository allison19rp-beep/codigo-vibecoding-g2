export type TransportType = "TRUCK" | "VAN" | "MOTORCYCLE" | "CARGO_BIKE"

export interface Transport {
  id: number
  plate_number: string
  transport_type: TransportType
  brand: string
  model: string
  year: number
  capacity_kg: string
  capacity_m3: string
  is_available: boolean
  created_at: string
  updated_at: string
}

export interface TransportFormData {
  plate_number: string
  transport_type: TransportType
  brand: string
  model: string
  year: number
  capacity_kg: string
  capacity_m3: string
  is_available: boolean
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface TransportFilters {
  page: number
  search?: string
  transport_type?: TransportType | ""
  is_available?: boolean | ""
  capacity_kg_gte?: string
  capacity_kg_lte?: string
  capacity_m3_gte?: string
  capacity_m3_lte?: string
  ordering?: string
}
