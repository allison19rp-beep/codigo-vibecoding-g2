import { describe, expect, it, beforeEach } from "vitest"
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
  isAuthenticated,
} from "@/lib/auth"

const ACCESS_KEY = "access_token"
const REFRESH_KEY = "refresh_token"

beforeEach(() => {
  localStorage.clear()
})

describe("getAccessToken / getRefreshToken", () => {
  it("returns null when nothing stored", () => {
    expect(getAccessToken()).toBeNull()
    expect(getRefreshToken()).toBeNull()
  })

  it("returns the stored value", () => {
    localStorage.setItem(ACCESS_KEY, "abc")
    localStorage.setItem(REFRESH_KEY, "xyz")
    expect(getAccessToken()).toBe("abc")
    expect(getRefreshToken()).toBe("xyz")
  })

  it("returns null when typeof window is undefined (SSR guard)", () => {
    const origWindow = globalThis.window
    ;(globalThis as any).window = undefined
    expect(getAccessToken()).toBeNull()
    expect(getRefreshToken()).toBeNull()
    globalThis.window = origWindow
  })
})

describe("setTokens", () => {
  it("saves access token only", () => {
    setTokens({ access: "new-access" })
    expect(localStorage.getItem(ACCESS_KEY)).toBe("new-access")
    expect(localStorage.getItem(REFRESH_KEY)).toBeNull()
  })

  it("saves refresh token only", () => {
    setTokens({ refresh: "new-refresh" })
    expect(localStorage.getItem(ACCESS_KEY)).toBeNull()
    expect(localStorage.getItem(REFRESH_KEY)).toBe("new-refresh")
  })

  it("saves both tokens", () => {
    setTokens({ access: "a", refresh: "r" })
    expect(localStorage.getItem(ACCESS_KEY)).toBe("a")
    expect(localStorage.getItem(REFRESH_KEY)).toBe("r")
  })

  it("does not overwrite existing access when not provided", () => {
    localStorage.setItem(ACCESS_KEY, "existing")
    setTokens({ refresh: "new-refresh" })
    expect(localStorage.getItem(ACCESS_KEY)).toBe("existing")
    expect(localStorage.getItem(REFRESH_KEY)).toBe("new-refresh")
  })

  it("does not overwrite existing refresh when not provided", () => {
    localStorage.setItem(REFRESH_KEY, "existing")
    setTokens({ access: "new-access" })
    expect(localStorage.getItem(ACCESS_KEY)).toBe("new-access")
    expect(localStorage.getItem(REFRESH_KEY)).toBe("existing")
  })

  it("is a noop when called with empty object", () => {
    localStorage.setItem(ACCESS_KEY, "keep")
    localStorage.setItem(REFRESH_KEY, "keep")
    setTokens({})
    expect(localStorage.getItem(ACCESS_KEY)).toBe("keep")
    expect(localStorage.getItem(REFRESH_KEY)).toBe("keep")
  })

  it("is SSR-safe (typeof window undefined)", () => {
    const origWindow = globalThis.window
    ;(globalThis as any).window = undefined
    expect(() => setTokens({ access: "x" })).not.toThrow()
    globalThis.window = origWindow
  })
})

describe("clearTokens", () => {
  it("removes both tokens", () => {
    localStorage.setItem(ACCESS_KEY, "a")
    localStorage.setItem(REFRESH_KEY, "r")
    clearTokens()
    expect(localStorage.getItem(ACCESS_KEY)).toBeNull()
    expect(localStorage.getItem(REFRESH_KEY)).toBeNull()
  })

  it("does not throw when nothing stored", () => {
    expect(() => clearTokens()).not.toThrow()
  })

  it("is SSR-safe (typeof window undefined)", () => {
    const origWindow = globalThis.window
    ;(globalThis as any).window = undefined
    expect(() => clearTokens()).not.toThrow()
    globalThis.window = origWindow
  })
})

describe("isAuthenticated", () => {
  it("returns true when access token exists", () => {
    localStorage.setItem(ACCESS_KEY, "valid-token")
    expect(isAuthenticated()).toBe(true)
  })

  it("returns false when access token is null", () => {
    expect(isAuthenticated()).toBe(false)
  })

  it("returns false when access token is empty string", () => {
    localStorage.setItem(ACCESS_KEY, "")
    expect(isAuthenticated()).toBe(false)
  })

  it("returns false when typeof window is undefined (SSR guard)", () => {
    const origWindow = globalThis.window
    ;(globalThis as any).window = undefined
    expect(isAuthenticated()).toBe(false)
    globalThis.window = origWindow
  })
})
