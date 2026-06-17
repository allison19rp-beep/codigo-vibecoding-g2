import { test, expect } from "./fixtures"
import type { APIResponse } from "@playwright/test"

const API_BASE = "http://localhost:8000/api/v1"
const USERNAME = process.env.E2E_USERNAME ?? "testuser"
const PASSWORD = process.env.E2E_PASSWORD ?? "TestPass123!"

let uidCounter = Date.now()
function uid(prefix: string): string {
  return `${prefix}${++uidCounter}`
}

let warehouseId: number
let customerId: number
let supplierId: number
let productId: number
let driverId: number
let transportId: number
let routeId: number
let driverUserId: number

let warehouseLabel: string
let customerName: string

async function getToken(): Promise<string> {
  const resp = await fetch(`${API_BASE}/auth/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: USERNAME, password: PASSWORD }),
  })
  if (!resp.ok) throw new Error(`Auth failed: ${await resp.text()}`)
  const { access } = (await resp.json()) as { access: string }
  return access
}

async function cleanup(api: any, ...pairs: [string, number | undefined][]) {
  for (const [endpoint, id] of pairs) {
    if (id === undefined) continue
    try { await api.remove(endpoint, id) } catch { /* ignore */ }
  }
}

test.describe("Shipments CRUD", () => {
  test.beforeAll(async () => {
    const token = await getToken()

    async function post(endpoint: string, data: object) {
      const resp = await fetch(`${API_BASE}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      })
      if (!resp.ok) throw new Error(`seed ${endpoint}: ${await resp.text()}`)
      return resp.json()
    }

    const tag = `${uidCounter}`
    const ts = `${uidCounter}`

    const warehouse = await post("warehouses/", {
      name: `E2E WH ${tag}`, address: "Calle Test 1", city: "Bogotá",
      country: "Colombia", capacity_m3: "5000.00",
    })
    warehouseId = warehouse.id
    warehouseLabel = `E2E WH ${tag} - Bogotá`

    const customer = await post("customers/", {
      name: `E2E Customer ${tag}`, email: `cust${ts}@e2e.com`,
      phone: "555-0100", address: "Av Test 123", city: "Bogotá",
    })
    customerId = customer.id
    customerName = customer.name

    const user = await post("auth/users/", {
      username: `e2edrv${ts}`, password: "Pass123!",
      email: `drv${ts}@e2e.com`, first_name: "Ship", last_name: "Driver",
    })
    driverUserId = user.id

    const driver = await post("drivers/", {
      user: driverUserId, license_number: `LIC-SHIP-${ts}`,
      license_expiry: "2027-12-31", phone: "555-5000",
    })
    driverId = driver.id

    const transport = await post("transport/", {
      plate_number: `E2E-${ts}`, transport_type: "VAN",
      brand: "Brand", model: "Model",
      year: 2025, capacity_kg: "1000.00", capacity_m3: "10.00",
    })
    transportId = transport.id

    const supplier = await post("suppliers/", {
      name: `E2E Sup ${tag}`, contact_name: "E2E",
      email: `sup${ts}@e2e.com`, phone: "555-0200",
      address: "Av 456", city: "Medellín",
    })
    supplierId = supplier.id

    const product = await post("products/", {
      name: `E2E Prod ${tag}`, sku: `SKU-SHIP-${ts}`,
      category: "electronics", supplier: supplierId, warehouse: warehouseId,
      unit_price: "50.00", stock_quantity: 100, weight_kg: "1.000",
      width_cm: "30.00", height_cm: "10.00", depth_cm: "20.00",
    })
    productId = product.id

    const route = await post("routes/", {
      origin_warehouse: warehouseId, name: `E2E Route ${tag}`,
      estimated_duration_hours: "2.50", estimated_distance_km: "100.00",
    })
    routeId = route.id
  })

  test.afterAll(async () => {
    const token = await getToken()

    async function del(endpoint: string, id: number) {
      try {
        await fetch(`${API_BASE}/${endpoint}/${id}/`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        })
      } catch { /* ignore */ }
    }

    await del("routes", routeId)
    await del("products", productId)
    await del("suppliers", supplierId)
    await del("transport", transportId)
    await del("drivers", driverId)
    await del("auth/users", driverUserId)
    await del("customers", customerId)
    await del("warehouses", warehouseId)
  })

  test("List: seed via API, verify tracking_number and fields in table", async ({ page, api }) => {
    const city = uid("listcity")
    let shipmentId: number | undefined
    try {
      shipmentId = await api.seed("shipments/", {
        customer: customerId,
        origin_warehouse: warehouseId,
        destination_address: "Calle List 123",
        destination_city: city,
        weight_total_kg: "300.000",
        base_cost: "500.00",
      })

      await page.goto("/shipments")
      await expect(page.getByRole("cell", { name: city })).toBeVisible()
    } finally {
      await cleanup(api, ["shipments/", shipmentId])
    }
  })

  test("Create via form: fill required fields, save, verify shipment appears in table", async ({ page, api }) => {
    const city = uid("formcity")

    await page.goto("/shipments")
    await page.getByRole("button", { name: "Nuevo envío" }).click()

    const dialog = page.getByRole("dialog", { name: /Nuevo envío/ })
    await expect(dialog).toBeVisible()

    const combos = dialog.getByRole("combobox")
    await expect(combos.first()).not.toBeDisabled({ timeout: 15000 })

    await combos.nth(0).click()
    await page.getByRole("option", { name: customerName }).click()

    await combos.nth(2).click()
    await page.getByRole("option", { name: warehouseLabel }).click()

    await page.getByLabel("Dirección de destino").fill("Calle Form 456")
    await page.getByLabel("Ciudad de destino").fill(city)
    await page.getByLabel("Peso total (kg)").fill("500.000")
    await page.getByLabel("Costo base").fill("1000.00")

    await page.getByRole("button", { name: "Guardar" }).click()
    await expect(dialog).not.toBeVisible({ timeout: 10000 })

    await page.getByPlaceholder("Buscar por tracking, cliente...").fill(city)
    await page.waitForResponse(
      (resp) => resp.url().includes("/api/v1/shipments/") && resp.status() === 200,
      { timeout: 10000 },
    )

    await expect(page.getByRole("cell", { name: city })).toBeVisible()

    const trackingCell = page.getByRole("row").filter({ hasText: city }).getByRole("cell").first()
    await expect(trackingCell).toBeVisible()
    const trackingText = await trackingCell.textContent()
    expect(trackingText?.trim().length).toBeGreaterThanOrEqual(1)

    // Cleanup: find and delete the shipment we just created via API
    const token = await getToken()
    const searchResp = await fetch(
      `${API_BASE}/shipments/?search=${encodeURIComponent(city)}&page_size=50`,
      { headers: { Authorization: `Bearer ${token}` } },
    )
    if (searchResp.ok) {
      const data = (await searchResp.json()) as { results: Array<{ id: number }> }
      for (const s of data.results) {
        await fetch(`${API_BASE}/shipments/${s.id}/`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        })
      }
    }
  })

  test("Items via API: add item to shipment, list items, verify", async ({ page, api }) => {
    const city = uid("itemcity")
    let shipmentId: number | undefined
    try {
      shipmentId = await api.seed("shipments/", {
        customer: customerId,
        origin_warehouse: warehouseId,
        destination_address: "Calle Items 789",
        destination_city: city,
        weight_total_kg: "200.000",
        base_cost: "750.00",
      })

      const token = await getToken()

      const itemResp = await fetch(`${API_BASE}/shipments/${shipmentId}/items/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ product: productId, quantity: 5, unit_price_at_time: "50.00" }),
      })
      expect(itemResp.ok).toBeTruthy()
      const item = await itemResp.json()
      expect(item.product).toBe(productId)
      expect(item.quantity).toBe(5)
      expect(item.unit_price_at_time).toBe("50.00")
      expect(item.subtotal).toBe("250.00")

      const listResp = await fetch(`${API_BASE}/shipments/${shipmentId}/items/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      expect(listResp.ok).toBeTruthy()
      const items = (await listResp.json()) as Array<any>
      expect(items.length).toBe(1)
      expect(items[0].product).toBe(productId)
      expect(items[0].quantity).toBe(5)
      expect(items[0].subtotal).toBe("250.00")
    } finally {
      await cleanup(api, ["shipments/", shipmentId])
    }
  })

  test("Status transition: seed PENDING, edit to CONFIRMED via form, verify badge", async ({ page, api }) => {
    const city = uid("statcity")
    let shipmentId: number | undefined
    try {
      shipmentId = await api.seed("shipments/", {
        customer: customerId,
        origin_warehouse: warehouseId,
        destination_address: "Calle Status 111",
        destination_city: city,
        weight_total_kg: "400.000",
        base_cost: "800.00",
        status: "PENDING",
      })

      await page.goto("/shipments")

      await page.getByPlaceholder("Buscar por tracking, cliente...").fill(city)
      await page.waitForResponse(
        (resp) => resp.url().includes("/api/v1/shipments/") && resp.status() === 200,
        { timeout: 10000 },
      )

      await expect(page.getByRole("cell", { name: "Pendiente" })).toBeVisible()

      const row = page.getByRole("row").filter({ hasText: city })
      await row.getByRole("button").first().click()

      const dialog = page.getByRole("dialog", { name: /Editar envío/ })
      await expect(dialog).toBeVisible()

      const combos = dialog.getByRole("combobox")
      await combos.nth(1).click()
      await page.getByRole("option", { name: "Confirmado" }).click()

      await page.getByRole("button", { name: "Guardar" }).click()
      await expect(dialog).not.toBeVisible({ timeout: 10000 })

      // After invalidation, the list refetches automatically (search still applied)
      await expect(page.getByRole("cell", { name: "Confirmado" })).toBeVisible({ timeout: 15000 })
    } finally {
      await cleanup(api, ["shipments/", shipmentId])
    }
  })

  test("Delete: seed, delete via dialog, verify gone", async ({ page, api }) => {
    const city = uid("delcity")
    let shipmentId: number | undefined
    try {
      shipmentId = await api.seed("shipments/", {
        customer: customerId,
        origin_warehouse: warehouseId,
        destination_address: "Calle Delete 222",
        destination_city: city,
        weight_total_kg: "250.000",
        base_cost: "600.00",
      })

      await page.goto("/shipments")

      await page.getByPlaceholder("Buscar por tracking, cliente...").fill(city)
      await page.waitForResponse(
        (resp) => resp.url().includes("/api/v1/shipments/") && resp.status() === 200,
        { timeout: 10000 },
      )

      await expect(page.getByRole("cell", { name: city })).toBeVisible()

      const row = page.getByRole("row").filter({ hasText: city })
      await row.getByRole("button").last().click()

      await page.getByRole("button", { name: "Eliminar" }).click()
      await expect(page.getByRole("cell", { name: city })).not.toBeVisible()
    } finally {
      await cleanup(api, ["shipments/", shipmentId])
    }
  })
})
