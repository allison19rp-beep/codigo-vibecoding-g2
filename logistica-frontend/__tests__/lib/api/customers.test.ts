import { describe, expect, it, vi } from "vitest"
import api from "@/lib/axios"
import {
  getCustomersApi,
  getCustomerApi,
  createCustomerApi,
  updateCustomerApi,
  deleteCustomerApi,
} from "@/lib/api/customers"

vi.mock("@/lib/axios", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

const mockCustomer = {
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
} as const

describe("getCustomersApi", () => {
  it("calls GET /customers/ with filters as params", async () => {
    const mockResponse = { data: { count: 1, results: [mockCustomer] }, status: 200 }
    vi.mocked(api.get).mockResolvedValueOnce(mockResponse)

    const filters = { page: 1, search: "test", customer_type: "COMPANY" as const, city: "Bogotá" }
    const result = await getCustomersApi(filters)

    expect(api.get).toHaveBeenCalledWith("/customers/", { params: filters })
    expect(result.data.count).toBe(1)
    expect(result.data.results[0].name).toBe("Test Cliente")
  })

  it("works without optional filters", async () => {
    const mockResponse = { data: { count: 0, results: [] }, status: 200 }
    vi.mocked(api.get).mockResolvedValueOnce(mockResponse)

    await getCustomersApi({ page: 1 })

    expect(api.get).toHaveBeenCalledWith("/customers/", { params: { page: 1 } })
  })
})

describe("getCustomerApi", () => {
  it("calls GET /customers/{id}/", async () => {
    const mockResponse = { data: mockCustomer, status: 200 }
    vi.mocked(api.get).mockResolvedValueOnce(mockResponse)

    const result = await getCustomerApi(1)

    expect(api.get).toHaveBeenCalledWith("/customers/1/")
    expect(result.data.name).toBe("Test Cliente")
  })
})

describe("createCustomerApi", () => {
  it("calls POST /customers/ with form data", async () => {
    const mockResponse = { data: mockCustomer, status: 201 }
    vi.mocked(api.post).mockResolvedValueOnce(mockResponse)

    const formData = {
      name: "Test Cliente",
      customer_type: "COMPANY" as const,
      email: "test@ejemplo.com",
      phone: "+571234567890",
      address: "Calle 123",
      city: "Bogotá",
    }
    const result = await createCustomerApi(formData)

    expect(api.post).toHaveBeenCalledWith("/customers/", formData)
    expect(result.data.name).toBe("Test Cliente")
  })
})

describe("updateCustomerApi", () => {
  it("calls PATCH /customers/{id}/ with partial data", async () => {
    const updated = { ...mockCustomer, name: "Updated Name" }
    const mockResponse = { data: updated, status: 200 }
    vi.mocked(api.patch).mockResolvedValueOnce(mockResponse)

    const result = await updateCustomerApi(1, { name: "Updated Name" })

    expect(api.patch).toHaveBeenCalledWith("/customers/1/", { name: "Updated Name" })
    expect(result.data.name).toBe("Updated Name")
  })
})

describe("deleteCustomerApi", () => {
  it("calls DELETE /customers/{id}/", async () => {
    vi.mocked(api.delete).mockResolvedValueOnce({ status: 204 })

    await deleteCustomerApi(1)

    expect(api.delete).toHaveBeenCalledWith("/customers/1/")
  })

  it("propagates 4xx errors", async () => {
    const error = { response: { status: 404, data: { detail: "Not found" } } }
    vi.mocked(api.delete).mockRejectedValueOnce(error)

    await expect(deleteCustomerApi(999)).rejects.toHaveProperty("response.status", 404)
  })
})
