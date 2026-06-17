import { test, expect } from "./fixtures"

const API_BASE = "http://localhost:8000/api/v1"
const USERNAME = process.env.E2E_USERNAME ?? "testuser"
const PASSWORD = process.env.E2E_PASSWORD ?? "TestPass123!"

async function cleanupByName(warehouseName: string) {
  const authResp = await fetch(`${API_BASE}/auth/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: USERNAME, password: PASSWORD }),
  })
  if (!authResp.ok) return
  const { access } = await authResp.json() as { access: string }

  const listResp = await fetch(
    `${API_BASE}/warehouses/?search=${encodeURIComponent(warehouseName)}&page_size=50`,
    { headers: { Authorization: `Bearer ${access}` } },
  )
  if (!listResp.ok) return
  const data = await listResp.json() as { results: Array<{ id: number }> }

  for (const w of data.results) {
    await fetch(`${API_BASE}/warehouses/${w.id}/`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${access}` },
    })
  }
}

test.describe("Warehouses CRUD", () => {
  test("List loads and renders table with seeded data", async ({ page, api }) => {
    const name1 = `Bodega Central ${Date.now()}`
    const name2 = `Bodega Norte ${Date.now()}`
    const id1 = await api.seed("warehouses/", {
      name: name1, address: "Calle 123", city: "Bogotá",
      country: "Colombia", capacity_m3: "5000.00",
    })
    const id2 = await api.seed("warehouses/", {
      name: name2, address: "Av 456", city: "Medellín",
      country: "Colombia", capacity_m3: "3000.00",
    })

    await page.goto("/warehouses")
    await expect(page.getByRole("cell", { name: name1 })).toBeVisible()
    await expect(page.getByRole("cell", { name: name2 })).toBeVisible()

    await api.remove("warehouses/", id1)
    await api.remove("warehouses/", id2)
  })

  test("Create: open form, fill, save, verify in list", async ({ page }) => {
    const name = `E2E Create ${Date.now()}`

    await page.goto("/warehouses")
    await page.getByRole("button", { name: "Nueva bodega" }).click()

    await page.getByLabel("Nombre").fill(name)
    await page.getByLabel("Dirección").fill("Calle Test 123")
    await page.getByLabel("Ciudad").fill("Ciudad Test")
    await page.getByLabel("Capacidad (m³)").fill("1500")

    await page.getByRole("button", { name: "Guardar" }).click()
    await expect(page.getByText(name)).toBeVisible()

    await cleanupByName(name)
  })

  test("Validation: empty form shows backend errors", async ({ page }) => {
    await page.goto("/warehouses")
    await page.getByRole("button", { name: "Nueva bodega" }).click()
    await page.waitForSelector("#name", { state: "visible" })

    await page.evaluate(() => {
      document.querySelectorAll("#name, #address, #city, #capacity_m3").forEach(
        (el) => el.removeAttribute("required"),
      )
    })

    await page.getByRole("button", { name: "Guardar" }).click()

    await expect(page.getByText("This field may not be blank.").first()).toBeVisible()
    await expect(page.getByRole("heading", { name: "Nueva bodega" })).toBeVisible()
  })

  test("Edit: seed, edit field, save, verify change", async ({ page, api }) => {
    const origName = `Bodega Edit Orig ${Date.now()}`
    const id = await api.seed("warehouses/", {
      name: origName, address: "Calle 456", city: "Barranquilla",
      country: "Colombia", capacity_m3: "2000.00",
    })
    const newName = `Bodega Edit Renamed ${Date.now()}`

    await page.goto("/warehouses")
    await expect(page.getByText(origName)).toBeVisible()

    const row = page.getByRole("row").filter({ hasText: origName })
    await row.getByRole("button").first().click()

    await page.getByLabel("Nombre").clear()
    await page.getByLabel("Nombre").fill(newName)
    await page.getByRole("button", { name: "Guardar" }).click()

    await expect(page.getByText(newName)).toBeVisible()
    await expect(page.getByText(origName)).not.toBeVisible()

    await api.remove("warehouses/", id)
  })

  test("Delete: seed, delete with confirmation, verify gone", async ({ page, api }) => {
    const name = `Bodega To Delete ${Date.now()}`
    const id = await api.seed("warehouses/", {
      name, address: "Carrera 789", city: "Cali",
      country: "Colombia", capacity_m3: "1000.00",
    })

    await page.goto("/warehouses")
    await expect(page.getByText(name)).toBeVisible()

    const row = page.getByRole("row").filter({ hasText: name })
    await row.getByRole("button").last().click()

    await page.getByRole("button", { name: "Eliminar" }).click()
    await expect(page.getByText(name)).not.toBeVisible()
  })

  test("Search: seed 3, filter by text, verify filtered", async ({ page, api }) => {
    const prefix = `Almacen ${Date.now()}`
    const name1 = `${prefix} Alpha`
    const name2 = `${prefix} Beta`
    const name3 = `Deposito ${Date.now()} Gamma`
    const id1 = await api.seed("warehouses/", {
      name: name1, address: "Calle A 111", city: "Bogotá",
      country: "Colombia", capacity_m3: "1000.00",
    })
    const id2 = await api.seed("warehouses/", {
      name: name2, address: "Calle B 222", city: "Medellín",
      country: "Colombia", capacity_m3: "2000.00",
    })
    const id3 = await api.seed("warehouses/", {
      name: name3, address: "Calle G 333", city: "Cali",
      country: "Colombia", capacity_m3: "3000.00",
    })

    await page.goto("/warehouses")
    await expect(page.getByText(name1)).toBeVisible()
    await expect(page.getByText(name2)).toBeVisible()
    await expect(page.getByText(name3)).toBeVisible()

    await page.getByPlaceholder("Buscar bodegas...").fill(prefix)
    await page.waitForResponse(
      (resp) => resp.url().includes("/warehouses/") && resp.status() === 200,
    )

    await expect(page.getByText(name1)).toBeVisible()
    await expect(page.getByText(name2)).toBeVisible()
    await expect(page.getByText(name3)).not.toBeVisible()

    await api.remove("warehouses/", id1)
    await api.remove("warehouses/", id2)
    await api.remove("warehouses/", id3)
  })
})
