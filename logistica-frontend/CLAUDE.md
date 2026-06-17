# Logística Frontend — SDD Flow

## Entry Point

Para trabajar en un módulo nuevo, invoca al **@orquestador** con el nombre del módulo.

El flujo es:
1. @spect analiza y genera `spec/<modulo>.md`
2. Revisión humana (aprobación requerida)
3. @implement escribe el código
4. @validator verifica y actualiza el spec

## Stack

| Capa | Herramienta |
|---|---|
| Framework | Next.js 16.2.6 + React 19 + TypeScript |
| Estilos | Tailwind CSS v4 + shadcn/ui |
| Tablas | TanStack Table v8 |
| Data fetching | TanStack Query v5 |
| HTTP | Axios (`lib/axios.ts`) |
| Estado global | Zustand (`hooks/use-auth.ts`) |
| E2E | Playwright (`npm run e2e`) |
| CI | GitHub Actions (`.github/workflows/e2e.yml`) |
| Lint | `npm run lint` |
| Build | `npm run build` (tsc -b primero) |

## E2E Tests

| Comando | Descripción |
|---|---|
| `npm run e2e` | Run all E2E tests (requires backend + frontend running) |
| `npm run e2e -- --grep "Warehouses"` | Run specific test group |
| `.\scripts\run-e2e.ps1` | **Local helper** — auto-starts Django + Next.js, runs tests, cleans up |
| `.\scripts\run-e2e.ps1 -Build` | Same but rebuilds Next.js first |
| `.\scripts\run-e2e.ps1 -TestName "Warehouses"` | Run only warehouses tests |

**Local prerequisites:**
1. Python venv activated with `pip install -r requirements.txt`
2. DB migrated: `python manage.py migrate`
3. Test user created: `python manage.py shell` → create `testuser` / `TestPass123!`

**CI** runs automatically on push/PR to main via `.github/workflows/e2e.yml`.

## Reglas

- **Siempre** leer `docs/` antes de codificar
- Trabajar **un módulo a la vez** según orden en `docs/mvp.md`
- No saltar la revisión humana
- No editar `docs/clase-*/` ni `logistica-api/` ni `logistica-api_old/` ni `task-manager-*/`
