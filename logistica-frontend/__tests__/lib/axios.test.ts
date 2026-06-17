import { describe, expect, it, beforeEach } from "vitest"
import { http, HttpResponse } from "msw"
import { server } from "@/test/msw/server"
import api from "@/lib/axios"

beforeEach(() => {
  localStorage.clear()
})

describe("request interceptor", () => {
  it("adds Authorization header when token exists", async () => {
    localStorage.setItem("access_token", "test-token")

    let authHeader: string | null = null
    server.use(
      http.get("http://localhost:8000/api/v1/test", ({ request }) => {
        authHeader = request.headers.get("Authorization")
        return HttpResponse.json({ ok: true })
      }),
    )

    await api.get("/test")
    expect(authHeader).toBe("Bearer test-token")
  })

  it("does not add Authorization header without token", async () => {
    let authHeader: string | null = "UNSET"
    server.use(
      http.get("http://localhost:8000/api/v1/test", ({ request }) => {
        authHeader = request.headers.get("Authorization")
        return HttpResponse.json({ ok: true })
      }),
    )

    await api.get("/test")
    expect(authHeader).toBeNull()
  })
})

describe("response interceptor", () => {
  it("retries request after successful token refresh", async () => {
    localStorage.setItem("access_token", "expired")
    localStorage.setItem("refresh_token", "valid-refresh")

    let callCount = 0
    let retryAuth: string | null = null

    server.use(
      http.get("http://localhost:8000/api/v1/protected", ({ request }) => {
        callCount++
        if (callCount === 1) return HttpResponse.json({}, { status: 401 })
        retryAuth = request.headers.get("Authorization")
        return HttpResponse.json({ ok: true })
      }),
      http.post("http://localhost:8000/api/v1/auth/token/refresh/", () => {
        return HttpResponse.json({ access: "new-token" })
      }),
    )

    const res = await api.get("/protected")
    expect(res.data).toEqual({ ok: true })
    expect(retryAuth).toBe("Bearer new-token")
    expect(localStorage.getItem("access_token")).toBe("new-token")
    expect(callCount).toBe(2)
  })

  it("clears tokens when no refresh token exists", async () => {
    localStorage.setItem("access_token", "expired")

    server.use(
      http.get("http://localhost:8000/api/v1/protected", () => {
        return HttpResponse.json({ detail: "Unauthorized" }, { status: 401 })
      }),
    )

    await expect(api.get("/protected")).rejects.toThrow()
    expect(localStorage.getItem("access_token")).toBeNull()
    expect(localStorage.getItem("refresh_token")).toBeNull()
  })

  it("clears tokens when refresh also fails", async () => {
    localStorage.setItem("access_token", "expired")
    localStorage.setItem("refresh_token", "bad-refresh")

    server.use(
      http.get("http://localhost:8000/api/v1/protected", () => {
        return HttpResponse.json({ detail: "Unauthorized" }, { status: 401 })
      }),
      http.post("http://localhost:8000/api/v1/auth/token/refresh/", () => {
        return HttpResponse.json({ detail: "Invalid token" }, { status: 401 })
      }),
    )

    await expect(api.get("/protected")).rejects.toThrow()
    expect(localStorage.getItem("access_token")).toBeNull()
    expect(localStorage.getItem("refresh_token")).toBeNull()
  })

  it("does not retry refresh on second consecutive 401 (_retry guard)", async () => {
    localStorage.setItem("access_token", "expired")
    localStorage.setItem("refresh_token", "valid-refresh")

    let refreshCalls = 0

    server.use(
      http.get("http://localhost:8000/api/v1/protected", () => {
        return HttpResponse.json({ detail: "Unauthorized" }, { status: 401 })
      }),
      http.post("http://localhost:8000/api/v1/auth/token/refresh/", () => {
        refreshCalls++
        return HttpResponse.json({ access: "still-bad" })
      }),
    )

    await expect(api.get("/protected")).rejects.toThrow()
    expect(refreshCalls).toBe(1)
    expect(localStorage.getItem("access_token")).toBe("still-bad")
  })
})
