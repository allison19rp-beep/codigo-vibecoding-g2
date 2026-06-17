/**
 * Playwright E2E config — Logística Frontend.
 *
 * PREREQUISITES (manual):
 *   1. Django backend en http://localhost:8000 (migrado y corriendo)
 *   2. Next.js frontend en http://localhost:3000 (`npm run dev`)
 *   3. Usuario de test en la BD (crear con `python manage.py createsuperuser` o fixture):
 *        username=testuser  password=TestPass123!
 *
 * Los servidores NO se levantan automáticamente (regla del proyecto).
 */

import { defineConfig } from "@playwright/test"

const BASE_URL = process.env.E2E_BASE_URL ?? "http://localhost:3000"
const AUTH_FILE = "playwright/.auth/user.json"

export default defineConfig({
  testDir: "e2e",
  fullyParallel: false,
  retries: 1,
  timeout: 30_000,

  use: {
    baseURL: BASE_URL,
    channel: "chrome",
    headless: true,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "setup",
      testMatch: ["**/auth.setup.ts"],
    },
    {
      name: "chromium",
      dependencies: ["setup"],
      testIgnore: ["**/auth.setup.ts"],
      use: {
        storageState: AUTH_FILE,
      },
    },
  ],

  reporter: [["html"], ["list"]],
})
