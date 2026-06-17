import { defineConfig } from "@playwright/test"

const BASE_URL = process.env.E2E_BASE_URL ?? "http://localhost:5173"
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
      use: {
        storageState: AUTH_FILE,
      },
      testMatch: ["**/auth.spec.ts"],
    },
  ],

  reporter: [["html"], ["list"]],
})
