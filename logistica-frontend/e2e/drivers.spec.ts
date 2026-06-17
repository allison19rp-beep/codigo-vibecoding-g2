import { test, expect } from "./fixtures"

let uidCounter = Date.now()
function uid(prefix: string): string {
  return `${prefix}${++uidCounter}`
}

let transportId: number
let transportLabel: string

async function cleanup(api: any, ...pairs: [string, number | undefined][]) {
  for (const [endpoint, id] of pairs) {
    if (id === undefined) continue
    try { await api.remove(endpoint, id) } catch { /* ignore */ }
  }
}

test.describe("Drivers CRUD", () => {
  test.beforeAll(async ({ api }) => {
    const tag = `${uidCounter}`
    transportId = await api.seed("transport/", {
      plate_number: `E2E-${tag}`,
      transport_type: "VAN",
      brand: "TestBrand",
      model: "TestModel",
      year: 2025,
      capacity_kg: "1000.00",
      capacity_m3: "10.00",
      is_available: true,
    })
    transportLabel = `E2E-${tag} - TestBrand TestModel`
  })

  test.afterAll(async ({ api }) => {
    await cleanup(api, ["transport/", transportId])
  })

  test("List loads and renders table with seeded data showing derived user fields", async ({ page, api }) => {
    const suffix = uid("list")
    let userId1: number | undefined, userId2: number | undefined, id1: number | undefined, id2: number | undefined
    try {
      userId1 = await api.seed("auth/users/", {
        username: `e2edrv${suffix}a`, password: "Pass123!",
        email: `e2edrv${suffix}a@e2e.com`, first_name: "Alpha", last_name: "List",
      })
      userId2 = await api.seed("auth/users/", {
        username: `e2edrv${suffix}b`, password: "Pass123!",
        email: `e2edrv${suffix}b@e2e.com`, first_name: "Beta", last_name: "List",
      })
      const lic1 = `LIC-${suffix}-1`
      const lic2 = `LIC-${suffix}-2`
      id1 = await api.seed("drivers/", {
        user: userId1, transport: transportId,
        license_number: lic1, license_expiry: "2027-06-15", phone: "555-1001",
      })
      id2 = await api.seed("drivers/", {
        user: userId2,
        license_number: lic2, license_expiry: "2028-01-20", phone: "555-1002",
      })

      await page.goto("/drivers")
      await expect(page.getByText("Alpha List").first()).toBeVisible()
      await expect(page.getByText("Beta List").first()).toBeVisible()
      await expect(page.getByText(lic1).first()).toBeVisible()
      await expect(page.getByText(lic2).first()).toBeVisible()
    } finally {
      await cleanup(api, ["drivers/", id1], ["drivers/", id2], ["auth/users/", userId1], ["auth/users/", userId2])
    }
  })

  test("Create: seed via API, verify derived fields appear in list", async ({ page, api }) => {
    const suffix = uid("create")
    let userId: number | undefined, id: number | undefined
    try {
      userId = await api.seed("auth/users/", {
        username: `e2edrv${suffix}`, password: "Pass123!",
        email: `e2edrv${suffix}@e2e.com`, first_name: "Create", last_name: "Test",
      })
      const lic = `LIC-${suffix}`
      id = await api.seed("drivers/", {
        user: userId, transport: transportId,
        license_number: lic, license_expiry: "2027-09-30", phone: "555-2001",
      })

      await page.goto("/drivers")
      await expect(page.getByText("Create Test").first()).toBeVisible()
      await expect(page.getByText(lic).first()).toBeVisible()
      await expect(page.getByText(`e2edrv${suffix}@e2e.com`).first()).toBeVisible()
    } finally {
      await cleanup(api, ["drivers/", id], ["auth/users/", userId])
    }
  })

  test("Form transport select shows seeded transport option", async ({ page }) => {
    await page.goto("/drivers")
    await page.getByRole("button", { name: "Nuevo conductor" }).click()

    const dialog = page.getByRole("dialog", { name: /Nuevo conductor/ })
    await expect(dialog).toBeVisible()

    const combos = dialog.getByRole("combobox")
    await expect(combos.first()).not.toBeDisabled({ timeout: 10000 })

    await combos.first().click()
    await expect(page.getByRole("option", { name: transportLabel })).toBeVisible()
    await page.getByRole("option", { name: transportLabel }).click()
  })

  test("Validation: empty form shows backend errors", async ({ page }) => {
    await page.goto("/drivers")
    await page.getByRole("button", { name: "Nuevo conductor" }).click()
    await page.waitForSelector("#user_full_name", { state: "visible" })

    await page.evaluate(() => {
      const ids = ["user_full_name", "user_email", "license_number", "phone"]
      ids.forEach((id) => {
        const el = document.getElementById(id)
        if (el) el.removeAttribute("required")
      })
    })

    await page.getByRole("button", { name: "Guardar" }).click()
    await expect(page.getByText("This field may not be blank.").first()).toBeVisible()
    await expect(page.getByRole("heading", { name: "Nuevo conductor" })).toBeVisible()
  })

  test("Edit: seed, edit phone via form, save, verify change", async ({ page, api }) => {
    const suffix = uid("edit")
    let userId: number | undefined, id: number | undefined
    try {
      userId = await api.seed("auth/users/", {
        username: `e2edrv${suffix}`, password: "Pass123!",
        email: `e2edrv${suffix}@e2e.com`, first_name: "Edit", last_name: "Original",
      })
      const lic = `LIC-${suffix}`
      id = await api.seed("drivers/", {
        user: userId, transport: transportId,
        license_number: lic, license_expiry: "2027-11-15", phone: "555-3001",
      })
      const newPhone = "555-9999"

      await page.goto("/drivers")
      await expect(page.getByText("Edit Original").first()).toBeVisible()

      const row = page.locator("tr").filter({ hasText: "Edit Original" })
      await row.locator("td").last().locator("button").first().click()

      await page.getByLabel("Teléfono").clear()
      await page.getByLabel("Teléfono").fill(newPhone)
      await page.getByRole("button", { name: "Guardar" }).click()

      await expect(page.getByText(newPhone).first()).toBeVisible()
    } finally {
      await cleanup(api, ["drivers/", id], ["auth/users/", userId])
    }
  })

  test("Delete: seed, delete with confirmation, verify gone", async ({ page, api }) => {
    const suffix = uid("del")
    let userId: number | undefined, id: number | undefined
    try {
      userId = await api.seed("auth/users/", {
        username: `e2edrv${suffix}`, password: "Pass123!",
        email: `e2edrv${suffix}@e2e.com`, first_name: "Delete", last_name: "Me",
      })
      const lic = `LIC-${suffix}`
      id = await api.seed("drivers/", {
        user: userId,
        license_number: lic, license_expiry: "2028-03-10", phone: "555-4001",
      })

      await page.goto("/drivers")
      await expect(page.getByText("Delete Me").first()).toBeVisible()

      const row = page.locator("tr").filter({ hasText: "Delete Me" })
      await row.locator("td").last().locator("button").last().click()

      await page.getByRole("button", { name: "Desactivar" }).click()
      await expect(page.getByText("Delete Me")).not.toBeVisible()
    } finally {
      await cleanup(api, ["drivers/", id], ["auth/users/", userId])
    }
  })

  test("Search: seed 3, filter by text, verify filtered", async ({ page, api }) => {
    const suffix = uid("srch")
    let userId1: number | undefined, userId2: number | undefined, userId3: number | undefined
    let id1: number | undefined, id2: number | undefined, id3: number | undefined
    try {
      userId1 = await api.seed("auth/users/", {
        username: `e2edrv${suffix}a`, password: "Pass123!",
        email: `e2edrv${suffix}a@e2e.com`, first_name: "Search", last_name: "Alpha",
      })
      userId2 = await api.seed("auth/users/", {
        username: `e2edrv${suffix}b`, password: "Pass123!",
        email: `e2edrv${suffix}b@e2e.com`, first_name: "Search", last_name: "Beta",
      })
      userId3 = await api.seed("auth/users/", {
        username: `e2edrv${suffix}c`, password: "Pass123!",
        email: `e2edrv${suffix}c@e2e.com`, first_name: "Search", last_name: "Gamma",
      })
      const lic1 = `LIC-${suffix}-1`
      const lic2 = `LIC-${suffix}-2`
      const lic3 = `LIC-${suffix}-3`
      id1 = await api.seed("drivers/", {
        user: userId1, transport: transportId,
        license_number: lic1, license_expiry: "2027-07-01", phone: "555-5001",
      })
      id2 = await api.seed("drivers/", {
        user: userId2, transport: transportId,
        license_number: lic2, license_expiry: "2027-08-15", phone: "555-5002",
      })
      id3 = await api.seed("drivers/", {
        user: userId3,
        license_number: lic3, license_expiry: "2027-09-01", phone: "555-5003",
      })

      await page.goto("/drivers")
      await expect(page.getByText("Search Alpha").first()).toBeVisible()
      await expect(page.getByText("Search Beta").first()).toBeVisible()
      await expect(page.getByText("Search Gamma").first()).toBeVisible()

      await page.getByPlaceholder("Buscar conductores...").fill("Search Alpha")
      await page.waitForResponse(
        (resp) => resp.url().includes("/drivers/") && resp.status() === 200,
        { timeout: 10000 },
      )

      await expect(page.getByText("Search Alpha").first()).toBeVisible()
      await expect(page.getByText("Search Beta")).not.toBeVisible()
      await expect(page.getByText("Search Gamma")).not.toBeVisible()
    } finally {
      await cleanup(api,
        ["drivers/", id1], ["drivers/", id2], ["drivers/", id3],
        ["auth/users/", userId1], ["auth/users/", userId2], ["auth/users/", userId3],
      )
    }
  })
})
