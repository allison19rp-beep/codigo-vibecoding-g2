"use client"

import { useQuery } from "@tanstack/react-query"
import api from "@/lib/axios"

export interface CurrentUser {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  is_staff: boolean
  is_superuser: boolean
  is_active: boolean
  date_joined: string
  groups: { id: number; name: string }[]
}

export function useCurrentUser() {
  return useQuery<CurrentUser>({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data } = await api.get<CurrentUser>("/auth/me/")
      return data
    },
    staleTime: 1000 * 60 * 5,
  })
}
