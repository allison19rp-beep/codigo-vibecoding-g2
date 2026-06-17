import { test, expect } from "@playwright/test"

const USERNAME = process.env.E2E_USERNAME ?? "testuser"
const PASSWORD = process.env.E2E_PASSWORD ?? "TestPass123!"

test.describe("Login", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login")
    await page.evaluate(() => {
      localStorage.removeItem("access_token")
      localStorage.removeItem("refresh_token")
    })
  })

  test("valid credentials redirects to /dashboard", async ({ page }) => {
    await page.reload()
    await page.fill("#username", USERNAME)
    await page.fill("#password", PASSWORD)
    await page.click("button[type=submit]")

    await page.waitForURL("/dashboard", { timeout: 10_000 })
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible()
  })

  test("invalid credentials shows error toast", async ({ page }) => {
    await page.reload()
    await page.fill("#username", "wronguser")
    await page.fill("#password", "wrongpass")
    await page.click("button[type=submit]")

    await expect(page.getByRole("alert")).toBeVisible({ timeout: 8_000 })
    await expect(page).toHaveURL("/login")
  })
})
