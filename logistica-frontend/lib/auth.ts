const ACCESS_KEY = "access_token"
const REFRESH_KEY = "refresh_token"

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(ACCESS_KEY)
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(REFRESH_KEY)
}

export function setTokens(tokens: { access?: string; refresh?: string }): void {
  if (typeof window === "undefined") return
  if (tokens.access !== undefined) {
    localStorage.setItem(ACCESS_KEY, tokens.access)
  }
  if (tokens.refresh !== undefined) {
    localStorage.setItem(REFRESH_KEY, tokens.refresh)
  }
}

export function clearTokens(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
}

export function isAuthenticated(): boolean {
  return !!getAccessToken()
}
