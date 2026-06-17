import { test as setup, request } from "@playwright/test"
import { resolve } from "path"

const AUTH_FILE = resolve("playwright/.auth/user.json")
const API_BASE = "http://localhost:8000/api/v1/"
const USERNAME = process.env.E2E_USERNAME ?? "testuser"
const PASSWORD = process.env.E2E_PASSWORD ?? "TestPass123!"

setup("authenticate via API and seed localStorage", async () => {
  const api = await request.newContext({ baseURL: API_BASE })
  const resp = await api.post("auth/token/", {
    data: { username: USERNAME, password: PASSWORD },
  })

  if (!resp.ok()) {
    throw new Error(
      `Auth setup failed (${resp.status()}): ${await resp.text()}\n` +
        `Verify backend is running and user ${USERNAME} exists.`,
    )
  }

  const { access, refresh } = await resp.json()
  await api.dispose()

  const { chromium } = await import("@playwright/test")
  const browser = await chromium.launch({ channel: "chrome" })
  const context = await browser.newContext({ baseURL: "http://localhost:3000" })
  const page = await context.newPage()

  await page.goto("/login")
  await page.evaluate(
    ({ access, refresh }) => {
      localStorage.setItem("access_token", access)
      localStorage.setItem("refresh_token", refresh)
    },
    { access, refresh },
  )

  await page.context().storageState({ path: AUTH_FILE })
  await browser.close()
})
