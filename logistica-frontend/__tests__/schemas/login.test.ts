import { describe, expect, it } from "vitest"
import { loginSchema } from "@/schemas/login"

describe("loginSchema", () => {
  it("rejects empty username", () => {
    const result = loginSchema.safeParse({ username: "", password: "secret" })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain("El usuario es requerido")
    }
  })

  it("rejects empty password", () => {
    const result = loginSchema.safeParse({ username: "admin", password: "" })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain("La contraseña es requerida")
    }
  })

  it("accepts valid credentials", () => {
    const result = loginSchema.safeParse({ username: "admin", password: "secret" })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual({ username: "admin", password: "secret" })
    }
  })
})
