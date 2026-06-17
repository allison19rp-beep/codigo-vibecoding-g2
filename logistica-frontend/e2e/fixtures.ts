import { test as base, request } from "@playwright/test"
import type { APIResponse } from "@playwright/test"

const API_BASE_URL = "http://localhost:8000/api/v1/"
const USERNAME = process.env.E2E_USERNAME ?? "testuser"
const PASSWORD = process.env.E2E_PASSWORD ?? "TestPass123!"

type ApiFixtures = {
  api: {
    seed: (endpoint: string, payload: object) => Promise<number>
    remove: (endpoint: string, id: number) => Promise<void>
  }
}

async function getAccessToken(): Promise<string> {
  const ctx = await request.newContext({ baseURL: API_BASE_URL })
  const resp = await ctx.post("auth/token/", {
    data: { username: USERNAME, password: PASSWORD },
  })
  if (!resp.ok()) throw new Error(`Auth failed: ${await resp.text()}`)
  const { access } = await resp.json()
  await ctx.dispose()
  return access
}

export const test = base.extend<ApiFixtures>({
  api: async ({}, use) => {
    const token = await getAccessToken()
    const ctx = await request.newContext({
      baseURL: API_BASE_URL,
      extraHTTPHeaders: { Authorization: `Bearer ${token}` },
    })

    await use({
      seed: async (endpoint: string, payload: object): Promise<number> => {
        const r: APIResponse = await ctx.post(endpoint, { data: payload })
        if (!r.ok()) throw new Error(`seed ${endpoint} failed: ${await r.text()}`)
        return (await r.json()).id
      },
      remove: async (endpoint: string, id: number): Promise<void> => {
        await ctx.delete(`${endpoint}/${id}/`)
      },
    })

    await ctx.dispose()
  },
})

export { expect } from "@playwright/test"
