export type ShipmentStatus = "PENDING" | "CONFIRMED" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED" | "RETURNED"

export interface Shipment {
  id: number
  tracking_number: string
  customer: number
  customer_name: string
  driver: number | null
  driver_name: string | null
  transport: number | null
  transport_plate: string | null
  route: number | null
  route_name: string | null
  origin_warehouse: number
  origin_warehouse_name: string
  destination_address: string
  destination_city: string
  destination_country: string
  status: ShipmentStatus
  estimated_delivery_date: string | null
  actual_delivery_date: string | null
  weight_total_kg: string
  base_cost: string
  calculated_cost: string
  notes: string | null
  created_at: string
  updated_at: string
}

export interface ShipmentItem {
  id: number
  shipment: number
  product: number
  product_name: string
  quantity: number
  unit_price_at_time: string
  subtotal: string
}

export interface ShipmentFormData {
  customer: number | ""
  driver?: number | null
  transport?: number | null
  route?: number | null
  origin_warehouse: number | ""
  destination_address: string
  destination_city: string
  destination_country?: string
  status: ShipmentStatus
  estimated_delivery_date?: string | null
  actual_delivery_date?: string | null
  weight_total_kg: string
  base_cost: string
  notes?: string
}

export interface ShipmentItemFormData {
  product: number | ""
  quantity: number | ""
  unit_price_at_time: string
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface ShipmentFilters {
  page: number
  search?: string
  status?: ShipmentStatus | ""
  customer?: string
  driver?: string
  origin_warehouse?: string
  destination_city?: string
  ordering?: string
}
