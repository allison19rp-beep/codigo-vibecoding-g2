import { test, expect } from "./fixtures"

const API_BASE = "http://localhost:8000/api/v1"
const USERNAME = process.env.E2E_USERNAME ?? "testuser"
const PASSWORD = process.env.E2E_PASSWORD ?? "TestPass123!"
const UNIQUE = Date.now()

let warehouseId: number
let supplierId: number
let warehouseName: string
let supplierName: string

async function getToken() {
  const resp = await fetch(`${API_BASE}/auth/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: USERNAME, password: PASSWORD }),
  })
  if (!resp.ok) throw new Error(`Auth failed: ${await resp.text()}`)
  const { access } = (await resp.json()) as { access: string }
  return access
}

async function cleanupBySKU(sku: string) {
  const token = await getToken()
  const resp = await fetch(
    `${API_BASE}/products/?search=${encodeURIComponent(sku)}&page_size=50`,
    { headers: { Authorization: `Bearer ${token}` } },
  )
  if (!resp.ok) return
  const data = (await resp.json()) as { results: Array<{ id: number }> }
  for (const p of data.results) {
    await fetch(`${API_BASE}/products/${p.id}/`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
  }
}

test.describe("Products CRUD", () => {
  test.beforeAll(async () => {
    const token = await getToken()
    warehouseName = `E2E WH ${UNIQUE}`
    supplierName = `E2E Sup ${UNIQUE}`

    const whResp = await fetch(`${API_BASE}/warehouses/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: warehouseName,
        address: "Calle 123",
        city: "Bogotá",
        country: "Colombia",
        capacity_m3: "5000.00",
      }),
    })
    if (!whResp.ok) throw new Error(`seed warehouse: ${await whResp.text()}`)
    warehouseId = (await whResp.json()).id

    const supResp = await fetch(`${API_BASE}/suppliers/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: supplierName,
        contact_name: "E2E",
        email: `sup${UNIQUE}@e2e.com`,
        phone: "555-0100",
        address: "Av 456",
        city: "Medellín",
        country: "Colombia",
      }),
    })
    if (!supResp.ok) throw new Error(`seed supplier: ${await supResp.text()}`)
    supplierId = (await supResp.json()).id
  })

  test.afterAll(async () => {
    const token = await getToken()
    await fetch(`${API_BASE}/warehouses/${warehouseId}/`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
    await fetch(`${API_BASE}/suppliers/${supplierId}/`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
  })

  test("List loads and renders table with seeded data", async ({ page, api }) => {
    const listName1 = `Product List ${Date.now()} 1`
    const listName2 = `Product List ${Date.now()} 2`
    const sku1 = `SKU-LIST-${Date.now()}-1`
    const sku2 = `SKU-LIST-${Date.now()}-2`
    const id1 = await api.seed("products/", {
      name: listName1,
      sku: sku1,
      category: "electronics",
      supplier: supplierId,
      warehouse: warehouseId,
      unit_price: "100.00",
      stock_quantity: 10,
      weight_kg: "1.500",
      width_cm: "30.00",
      height_cm: "10.00",
      depth_cm: "20.00",
    })
    const id2 = await api.seed("products/", {
      name: listName2,
      sku: sku2,
      category: "furniture",
      supplier: supplierId,
      warehouse: warehouseId,
      unit_price: "200.00",
      stock_quantity: 5,
      weight_kg: "5.000",
      width_cm: "80.00",
      height_cm: "70.00",
      depth_cm: "60.00",
    })

    await page.goto("/products")
    await expect(page.getByRole("cell", { name: listName1 })).toBeVisible()
    await expect(page.getByRole("cell", { name: listName2 })).toBeVisible()

    await api.remove("products/", id1)
    await api.remove("products/", id2)
  })

  test("Create: open form, fill with selects, save, verify in list", async ({ page }) => {
    const name = `E2E Create ${UNIQUE}`
    const sku = `SKU-CREATE-${UNIQUE}`

    await page.goto("/products")
    await page.getByRole("button", { name: "Nuevo producto" }).click()

    const dialog = page.getByRole("dialog", { name: /Nuevo producto/ })
    await expect(dialog).toBeVisible()

    // Wait for supplier/warehouse selects to finish loading
    const combos = dialog.getByRole("combobox")
    await expect(combos.first()).not.toBeDisabled({ timeout: 10000 })

    // Fill text/number fields
    await page.getByLabel("Nombre").fill(name)
    await page.getByLabel("SKU").fill(sku)
    await page.getByLabel("Categoría").fill("electronics")
    await page.getByLabel("Precio unitario").fill("99.99")
    await page.getByLabel("Cantidad en stock").fill("25")
    await page.getByLabel("Peso (kg)").fill("1.5")
    await page.getByLabel("Ancho (cm)").fill("30")
    await page.getByLabel("Alto (cm)").fill("10")
    await page.getByLabel("Profundidad (cm)").fill("20")

    // Select supplier from dropdown (first combobox)
    await combos.nth(0).click()
    await page.getByRole("option", { name: supplierName }).click()

    // Select warehouse from dropdown (second combobox)
    await combos.nth(1).click()
    await page.getByRole("option", { name: warehouseName }).click()

    await page.getByRole("button", { name: "Guardar" }).click()
    await expect(page.getByText(name)).toBeVisible()

    await cleanupBySKU(sku)
  })

  test("Validation: empty form shows backend errors", async ({ page }) => {
    await page.goto("/products")
    await page.getByRole("button", { name: "Nuevo producto" }).click()
    await page.waitForSelector("#name", { state: "visible" })

    // Bypass HTML5 required validation to hit backend validation
    await page.evaluate(() => {
      const ids = [
        "name",
        "sku",
        "category",
        "unit_price",
        "stock_quantity",
        "weight_kg",
        "width_cm",
        "height_cm",
        "depth_cm",
      ]
      ids.forEach((id) => {
        const el = document.getElementById(id)
        if (el) el.removeAttribute("required")
      })
    })

    await page.getByRole("button", { name: "Guardar" }).click()

    await expect(page.getByText("This field may not be blank.").first()).toBeVisible()
    await expect(page.getByRole("heading", { name: "Nuevo producto" })).toBeVisible()
  })

  test("Edit: seed, edit field, save, verify change", async ({ page, api }) => {
    const editOrig = `Product Edit Orig ${Date.now()}`
    const sku = `SKU-EDIT-${Date.now()}`
    const id = await api.seed("products/", {
      name: editOrig,
      sku,
      category: "electronics",
      supplier: supplierId,
      warehouse: warehouseId,
      unit_price: "150.00",
      stock_quantity: 20,
      weight_kg: "2.000",
      width_cm: "40.00",
      height_cm: "15.00",
      depth_cm: "30.00",
    })
    const newName = `Product Edit Renamed ${Date.now()}`

    await page.goto("/products")
    await expect(page.getByText(editOrig)).toBeVisible()

    const row = page.getByRole("row").filter({ hasText: editOrig })
    await row.getByRole("button").first().click()

    await page.getByLabel("Nombre").clear()
    await page.getByLabel("Nombre").fill(newName)
    await page.getByRole("button", { name: "Guardar" }).click()

    await expect(page.getByText(newName)).toBeVisible()
    await expect(page.getByText(editOrig)).not.toBeVisible()

    await api.remove("products/", id)
  })

  test("Delete: seed, delete with confirmation, verify gone", async ({ page, api }) => {
    const delName = `Product To Delete ${Date.now()}`
    const sku = `SKU-DEL-${Date.now()}`
    const id = await api.seed("products/", {
      name: delName,
      sku,
      category: "electronics",
      supplier: supplierId,
      warehouse: warehouseId,
      unit_price: "75.00",
      stock_quantity: 3,
      weight_kg: "0.500",
      width_cm: "20.00",
      height_cm: "5.00",
      depth_cm: "15.00",
    })

    await page.goto("/products")
    await expect(page.getByText(delName)).toBeVisible()

    const row = page.getByRole("row").filter({ hasText: delName })
    await row.getByRole("button").last().click()

    await page.getByRole("button", { name: "Eliminar" }).click()
    await expect(page.getByText(delName)).not.toBeVisible()
  })

  test("Search: seed 3, filter by text, verify filtered", async ({ page, api }) => {
    const searchPrefix = `Alpha ${Date.now()}`
    const searchName1 = `${searchPrefix} Product 1`
    const searchName2 = `${searchPrefix} Product 2`
    const searchName3 = `Gamma ${Date.now()} Item`
    const sku1 = `SKU-SRCH-${Date.now()}-1`
    const sku2 = `SKU-SRCH-${Date.now()}-2`
    const sku3 = `SKU-SRCH-${Date.now()}-3`
    const id1 = await api.seed("products/", {
      name: searchName1,
      sku: sku1,
      category: "laptop",
      supplier: supplierId,
      warehouse: warehouseId,
      unit_price: "500.00",
      stock_quantity: 10,
      weight_kg: "2.500",
      width_cm: "35.00",
      height_cm: "2.50",
      depth_cm: "25.00",
    })
    const id2 = await api.seed("products/", {
      name: searchName2,
      sku: sku2,
      category: "tablet",
      supplier: supplierId,
      warehouse: warehouseId,
      unit_price: "300.00",
      stock_quantity: 15,
      weight_kg: "0.800",
      width_cm: "25.00",
      height_cm: "1.00",
      depth_cm: "18.00",
    })
    const id3 = await api.seed("products/", {
      name: searchName3,
      sku: sku3,
      category: "accessory",
      supplier: supplierId,
      warehouse: warehouseId,
      unit_price: "50.00",
      stock_quantity: 100,
      weight_kg: "0.100",
      width_cm: "10.00",
      height_cm: "2.00",
      depth_cm: "5.00",
    })

    await page.goto("/products")
    await expect(page.getByText(searchName1)).toBeVisible()
    await expect(page.getByText(searchName2)).toBeVisible()
    await expect(page.getByText(searchName3)).toBeVisible()

    await page.getByPlaceholder("Buscar por nombre, SKU...").fill(searchPrefix)
    await page.waitForResponse(
      (resp) => resp.url().includes("/products/") && resp.status() === 200,
      { timeout: 10000 },
    )

    await expect(page.getByText(searchName1)).toBeVisible()
    await expect(page.getByText(searchName2)).toBeVisible()
    await expect(page.getByText(searchName3)).not.toBeVisible()

    await api.remove("products/", id1)
    await api.remove("products/", id2)
    await api.remove("products/", id3)
  })

  test("SKU unique: duplicate SKU shows backend error inline", async ({ page, api }) => {
    const sku = `SKU-DUP-${Date.now()}`

    // Create first product with this SKU
    const id = await api.seed("products/", {
      name: "Original Product",
      sku,
      category: "electronics",
      supplier: supplierId,
      warehouse: warehouseId,
      unit_price: "100.00",
      stock_quantity: 10,
      weight_kg: "1.000",
      width_cm: "20.00",
      height_cm: "5.00",
      depth_cm: "15.00",
    })

    await page.goto("/products")
    await page.getByRole("button", { name: "Nuevo producto" }).click()

    const dialog = page.getByRole("dialog", { name: /Nuevo producto/ })
    await expect(dialog).toBeVisible()

    // Wait for selects to load
    const combos = dialog.getByRole("combobox")
    await expect(combos.first()).not.toBeDisabled({ timeout: 10000 })

    // Fill form with same SKU
    await page.getByLabel("Nombre").fill("Duplicate Product")
    await page.getByLabel("SKU").fill(sku)
    await page.getByLabel("Categoría").fill("electronics")
    await page.getByLabel("Precio unitario").fill("50.00")
    await page.getByLabel("Cantidad en stock").fill("5")
    await page.getByLabel("Peso (kg)").fill("0.500")
    await page.getByLabel("Ancho (cm)").fill("15")
    await page.getByLabel("Alto (cm)").fill("5")
    await page.getByLabel("Profundidad (cm)").fill("10")

    // Select supplier and warehouse
    await combos.nth(0).click()
    await page.getByRole("option", { name: supplierName }).click()
    await combos.nth(1).click()
    await page.getByRole("option", { name: warehouseName }).click()

    await page.getByRole("button", { name: "Guardar" }).click()

    // Verify backend error for duplicate SKU
    await expect(
      page.getByText("product with this sku already exists."),
    ).toBeVisible()

    await api.remove("products/", id)
  })
})
