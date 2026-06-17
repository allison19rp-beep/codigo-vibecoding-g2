export interface Product {
  id: number
  supplier: number
  supplier_name: string
  warehouse: number
  warehouse_name: string
  name: string
  sku: string
  description: string | null
  category: string
  weight_kg: string
  width_cm: string
  height_cm: string
  depth_cm: string
  unit_price: string
  stock_quantity: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ProductFormData {
  name: string
  sku: string
  description?: string
  category: string
  supplier: number
  warehouse: number
  unit_price: string
  stock_quantity: number
  weight_kg: string
  width_cm: string
  height_cm: string
  depth_cm: string
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface ProductFilters {
  page: number
  search?: string
  category?: string
  supplier?: string
  warehouse?: string
  unit_price_gte?: string
  unit_price_lte?: string
  stock_quantity_gte?: string
  ordering?: string
}
