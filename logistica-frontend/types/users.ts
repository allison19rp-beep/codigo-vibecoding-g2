export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  is_staff: boolean
  is_superuser: boolean
  is_active: boolean
  date_joined: string
  groups: number[]
}

export interface UserFormData {
  username: string
  email: string
  password?: string
  first_name?: string
  last_name?: string
  is_staff?: boolean
  is_superuser?: boolean
  is_active?: boolean
  groups?: number[]
}

export interface Group {
  id: number
  name: string
  permissions: number[]
}

export interface GroupFormData {
  name: string
  permissions?: number[]
}

export interface Permission {
  id: number
  name: string
  codename: string
  content_type: number
  app_label: string
  model: string
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface UsersFilters {
  page: number
  search?: string
  ordering?: string
}

export interface GroupsFilters {
  page: number
  search?: string
  ordering?: string
}
