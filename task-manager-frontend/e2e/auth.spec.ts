import { test, expect } from "@playwright/test"

const EMAIL = process.env.E2E_EMAIL ?? "test@example.com"
const PASSWORD = process.env.E2E_PASSWORD ?? "Test1234!"

test.describe("Login", () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test("valid credentials redirects to / and shows Header", async ({ page }) => {
    await page.goto("/login")
    await page.getByPlaceholder("tu@email.com").fill(EMAIL)
    await page.getByPlaceholder("••••••••").fill(PASSWORD)
    await page.getByRole("button", { name: "Iniciar sesión" }).click()

    await page.waitForURL("/", { timeout: 10_000 })
    await expect(page.getByText(/Hola,/)).toBeVisible()
    await expect(page.getByText("Cerrar sesión")).toBeVisible()
  })

  test("invalid credentials stays on /login after 401 redirect", async ({ page }) => {
    await page.goto("/login")
    await page.getByPlaceholder("tu@email.com").fill("wrong@email.com")
    await page.getByPlaceholder("••••••••").fill("wrongpass")
    await page.getByRole("button", { name: "Iniciar sesión" }).click()

    // The 401 interceptor in api.ts hard-redirects to /login via window.location.href,
    // so no error message persists but the user stays on the login page
    await expect(page.getByRole("button", { name: "Iniciar sesión" })).toBeVisible({ timeout: 10_000 })
    await expect(page).toHaveURL("/login")
  })

  test("no token redirects to /login when visiting protected route", async ({ page }) => {
    await page.goto("/")
    await page.waitForURL("/login")
  })
})

test.describe("Active session", () => {
  test("logout clears tokens and redirects to /login", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByText(/Hola,/)).toBeVisible()

    await page.getByRole("button", { name: "Cerrar sesión" }).click()
    await page.waitForURL("/login")

    // Protected route should redirect again
    await page.goto("/")
    await page.waitForURL("/login")
  })
})
