import { test as setup, expect } from "@playwright/test"
import { resolve } from "path"

const AUTH_FILE = resolve("playwright/.auth/user.json")
const API_BASE = "http://localhost:3000"
const EMAIL = process.env.E2E_EMAIL ?? "test@example.com"
const PASSWORD = process.env.E2E_PASSWORD ?? "Test1234!"
const NAME = process.env.E2E_NAME ?? "Test"
const LASTNAME = process.env.E2E_LASTNAME ?? "User"

setup("authenticate via API and seed localStorage", async ({ request }) => {
  // Ensure directory exists
  const { mkdir, writeFile } = await import("fs/promises")
  const dir = resolve("playwright/.auth")
  await mkdir(dir, { recursive: true }).catch(() => {})

  // Register test user (ignore 409 if already exists)
  const registerResp = await request.post(`${API_BASE}/users/register`, {
    data: { name: NAME, lastname: LASTNAME, email: EMAIL, password: PASSWORD },
  })
  if (registerResp.status() !== 201 && registerResp.status() !== 409) {
    throw new Error(
      `Registration failed (${registerResp.status()}): ${await registerResp.text()}`,
    )
  }

  // Login to get token
  const loginResp = await request.post(`${API_BASE}/users/login`, {
    data: { email: EMAIL, password: PASSWORD },
  })
  expect(loginResp.ok()).toBeTruthy()

  const { token, user } = await loginResp.json()

  const { chromium } = await import("@playwright/test")
  const browser = await chromium.launch()
  const context = await browser.newContext({ baseURL: "http://localhost:5173" })
  const page = await context.newPage()

  await page.goto("/login")
  await page.evaluate(
    ({ token, user }) => {
      localStorage.setItem("token", token)
      localStorage.setItem("user", JSON.stringify(user))
    },
    { token, user },
  )

  await page.context().storageState({ path: AUTH_FILE })
  await browser.close()
})
