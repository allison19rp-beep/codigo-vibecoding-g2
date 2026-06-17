import { describe, expect, it } from "vitest"
import {
  formatCustomerType,
  getCustomerTypeVariant,
  formatIsActive,
  getIsActiveVariant,
} from "@/lib/columns/customers"

describe("formatCustomerType", () => {
  it('returns "Empresa" for COMPANY', () => {
    expect(formatCustomerType("COMPANY")).toBe("Empresa")
  })

  it('returns "Individual" for INDIVIDUAL', () => {
    expect(formatCustomerType("INDIVIDUAL")).toBe("Individual")
  })
})

describe("getCustomerTypeVariant", () => {
  it('returns "default" for COMPANY', () => {
    expect(getCustomerTypeVariant("COMPANY")).toBe("default")
  })

  it('returns "secondary" for INDIVIDUAL', () => {
    expect(getCustomerTypeVariant("INDIVIDUAL")).toBe("secondary")
  })
})

describe("formatIsActive", () => {
  it('returns "Activo" for true', () => {
    expect(formatIsActive(true)).toBe("Activo")
  })

  it('returns "Inactivo" for false', () => {
    expect(formatIsActive(false)).toBe("Inactivo")
  })
})

describe("getIsActiveVariant", () => {
  it('returns "success" for true', () => {
    expect(getIsActiveVariant(true)).toBe("success")
  })

  it('returns "secondary" for false', () => {
    expect(getIsActiveVariant(false)).toBe("secondary")
  })
})
