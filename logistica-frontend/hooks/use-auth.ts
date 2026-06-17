"use client"

import { create } from "zustand"
import api from "@/lib/axios"

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  username: string | null
  userId: number | null
  email: string | null
  firstName: string | null
  lastName: string | null
  isSuperuser: boolean

  login: (username: string, password: string) => Promise<void>
  logout: () => void
  hydrate: () => void
}

function decodeToken(token: string): { username: string | null; userId: number | null } {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    return {
      username: payload.username ?? payload.sub ?? null,
      userId: payload.user_id ?? null,
    }
  } catch {
    return { username: null, userId: null }
  }
}

export const useAuth = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  username: null,
  userId: null,
  email: null,
  firstName: null,
  lastName: null,
  isSuperuser: false,

  login: async (username: string, password: string) => {
    const { data } = await api.post("/auth/token/", { username, password })

    localStorage.setItem("access_token", data.access)
    localStorage.setItem("refresh_token", data.refresh)
    localStorage.setItem("is_superuser", String(data.is_superuser ?? false))

    const decoded = decodeToken(data.access)

    set({
      accessToken: data.access,
      refreshToken: data.refresh,
      isAuthenticated: true,
      username: decoded.username,
      userId: decoded.userId,
      email: data.email ?? null,
      firstName: data.first_name ?? null,
      lastName: data.last_name ?? null,
      isSuperuser: data.is_superuser ?? false,
    })
  },

  logout: () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    localStorage.removeItem("is_superuser")

    set({
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      username: null,
      userId: null,
      email: null,
      firstName: null,
      lastName: null,
      isSuperuser: false,
    })
  },

  hydrate: () => {
    const accessToken = localStorage.getItem("access_token")
    const refreshToken = localStorage.getItem("refresh_token")
    const isSuperuser = localStorage.getItem("is_superuser") === "true"

    if (accessToken && refreshToken) {
      const decoded = decodeToken(accessToken)
      set({
        accessToken,
        refreshToken,
        isAuthenticated: true,
        username: decoded.username,
        userId: decoded.userId,
        isSuperuser,
      })
    }
  },
}))
