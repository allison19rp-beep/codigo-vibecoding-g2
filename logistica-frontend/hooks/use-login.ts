"use client"

import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import api from "@/lib/axios"
import { useAuth } from "@/hooks/use-auth"

interface LoginResponse {
  access: string
  refresh: string
  is_superuser: boolean
  user_id: number
  username: string
  email: string
  first_name: string
  last_name: string
}

interface LoginError {
  response?: {
    data?: {
      detail?: string
    }
  }
}

export function useLogin() {
  return useMutation<LoginResponse, LoginError, { username: string; password: string }>({
    mutationFn: async ({ username, password }) => {
      const { data } = await api.post<LoginResponse>("/auth/token/", { username, password })
      return data
    },
    onSuccess: (data) => {
      localStorage.setItem("access_token", data.access)
      localStorage.setItem("refresh_token", data.refresh)
      localStorage.setItem("is_superuser", String(data.is_superuser ?? false))

      useAuth.setState({
        accessToken: data.access,
        refreshToken: data.refresh,
        isAuthenticated: true,
        username: data.username,
        userId: data.user_id,
        email: data.email ?? null,
        firstName: data.first_name ?? null,
        lastName: data.last_name ?? null,
        isSuperuser: data.is_superuser ?? false,
      })
    },
    onError: (error) => {
      const message = error.response?.data?.detail || "Error al iniciar sesión"
      toast.error(message)
    },
  })
}
