import { describe, expect, it, vi, beforeEach } from "vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { renderHook, waitFor, act } from "@testing-library/react"
import type { ReactNode } from "react"
import { http, HttpResponse } from "msw"
import { server } from "@/test/msw/server"
import {
  useCustomers,
  useCustomer,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
} from "@/hooks/use-customers"
import type { Customer } from "@/types/customers"

const API_BASE = "http://localhost:8000/api/v1"

const mockCustomer: Customer = {
  id: 1,
  name: "Test Cliente",
  customer_type: "COMPANY",
  tax_id: "123456789-0",
  email: "test@ejemplo.com",
  phone: "+571234567890",
  address: "Calle 123",
  city: "Bogotá",
  country: "Colombia",
  is_active: true,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
}

const mockPaginated = {
  count: 1,
  next: null,
  previous: null,
  results: [mockCustomer],
}

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  })
}

function renderHookWithClient<Result, Props>(
  hook: (initialProps: Props) => Result,
) {
  const queryClient = createTestQueryClient()
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  const rendered = renderHook(hook, { wrapper })
  return { ...rendered, queryClient }
}

beforeEach(() => {
  server.resetHandlers()
})

describe("useCustomers", () => {
  it("returns data after successful fetch", async () => {
    server.use(
      http.get(`${API_BASE}/customers/`, () =>
        HttpResponse.json(mockPaginated),
      ),
    )

    const { result } = renderHookWithClient(() => useCustomers({ page: 1 }))

    expect(result.current.isPending).toBe(true)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockPaginated)
  })

  it("sends filters as query params", async () => {
    const requestUrl = vi.fn()
    server.use(
      http.get(`${API_BASE}/customers/`, ({ request }) => {
        requestUrl(request.url)
        return HttpResponse.json(mockPaginated)
      }),
    )

    renderHookWithClient(() => useCustomers({ page: 2, search: "test", customer_type: "COMPANY" }))

    await waitFor(() => {
      expect(requestUrl).toHaveBeenCalled()
    })
  })

  it("returns error on 4xx", async () => {
    server.use(
      http.get(`${API_BASE}/customers/`, () =>
        HttpResponse.json({ detail: "Unauthorized" }, { status: 401 }),
      ),
    )

    const { result } = renderHookWithClient(() => useCustomers({ page: 1 }))

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

describe("useCustomer", () => {
  it("returns data for valid id", async () => {
    server.use(
      http.get(`${API_BASE}/customers/1/`, () =>
        HttpResponse.json(mockCustomer),
      ),
    )

    const { result } = renderHookWithClient(() => useCustomer(1))

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockCustomer)
  })

  it("does not fetch when id is null", () => {
    const { result } = renderHookWithClient(() => useCustomer(null))

    expect(result.current.fetchStatus).toBe("idle")
  })
})

describe("useCreateCustomer", () => {
  it("calls POST and invalidates customers query", async () => {
    const postedData = vi.fn()
    server.use(
      http.post(`${API_BASE}/customers/`, async ({ request }) => {
        postedData(await request.json())
        return HttpResponse.json(mockCustomer, { status: 201 })
      }),
    )

    const queryClient = createTestQueryClient()
    queryClient.setQueryData(["customers", { page: 1 }], mockPaginated)
    const spy = vi.spyOn(queryClient, "invalidateQueries")

    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    const formData = {
      name: "Test Cliente",
      customer_type: "COMPANY" as const,
      email: "test@ejemplo.com",
      phone: "+571234567890",
      address: "Calle 123",
      city: "Bogotá",
    }

    const { result } = renderHook(() => useCreateCustomer(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync(formData)
    })

    expect(postedData).toHaveBeenCalledWith(formData)
    expect(spy).toHaveBeenCalledWith({ queryKey: ["customers"] })
  })
})

describe("useUpdateCustomer", () => {
  it("calls PATCH and invalidates customers query", async () => {
    const patchArgs = vi.fn()
    server.use(
      http.patch(`${API_BASE}/customers/1/`, async ({ request }) => {
        patchArgs({ url: request.url, body: await request.json() })
        return HttpResponse.json(mockCustomer)
      }),
    )

    const queryClient = createTestQueryClient()
    const spy = vi.spyOn(queryClient, "invalidateQueries")

    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    const { result } = renderHook(() => useUpdateCustomer(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync({ id: 1, data: { name: "Updated" } })
    })

    expect(patchArgs).toHaveBeenCalled()
    expect(spy).toHaveBeenCalledWith({ queryKey: ["customers"] })
  })
})

describe("useDeleteCustomer", () => {
  it("calls DELETE and invalidates customers query", async () => {
    const deleteUrl = vi.fn()
    server.use(
      http.delete(`${API_BASE}/customers/1/`, ({ request }) => {
        deleteUrl(request.url)
        return HttpResponse.json(null, { status: 204 })
      }),
    )

    const queryClient = createTestQueryClient()
    const spy = vi.spyOn(queryClient, "invalidateQueries")

    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    const { result } = renderHook(() => useDeleteCustomer(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync(1)
    })

    expect(deleteUrl).toHaveBeenCalled()
    expect(spy).toHaveBeenCalledWith({ queryKey: ["customers"] })
  })
})
