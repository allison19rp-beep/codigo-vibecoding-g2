import { describe, expect, it } from "vitest"
import { customerSchema } from "@/schemas/customers"

const validData = {
  name: "Cliente Test",
  customer_type: "COMPANY" as const,
  email: "cliente@test.com",
  phone: "+571234567890",
  address: "Calle 123",
  city: "Bogotá",
}

describe("customerSchema", () => {
  it("accepts valid minimal data", () => {
    const result = customerSchema.safeParse(validData)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBe("Cliente Test")
      expect(result.data.customer_type).toBe("COMPANY")
    }
  })

  it("accepts data with optional fields", () => {
    const result = customerSchema.safeParse({
      ...validData,
      tax_id: "123456789-0",
      country: "Colombia",
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.tax_id).toBe("123456789-0")
      expect(result.data.country).toBe("Colombia")
    }
  })

  it("rejects empty name", () => {
    const result = customerSchema.safeParse({ ...validData, name: "" })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("El nombre es requerido")
    }
  })

  it("rejects empty email", () => {
    const result = customerSchema.safeParse({ ...validData, email: "" })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("El email es requerido")
    }
  })

  it("rejects invalid email", () => {
    const result = customerSchema.safeParse({ ...validData, email: "not-an-email" })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((i) => i.message === "Email inválido")).toBe(true)
    }
  })

  it("rejects empty phone", () => {
    const result = customerSchema.safeParse({ ...validData, phone: "" })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("El teléfono es requerido")
    }
  })

  it("rejects empty address", () => {
    const result = customerSchema.safeParse({ ...validData, address: "" })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("La dirección es requerida")
    }
  })

  it("rejects empty city", () => {
    const result = customerSchema.safeParse({ ...validData, city: "" })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("La ciudad es requerida")
    }
  })

  it("rejects invalid customer_type", () => {
    const result = customerSchema.safeParse({ ...validData, customer_type: "INVALID" })
    expect(result.success).toBe(false)
  })
})
