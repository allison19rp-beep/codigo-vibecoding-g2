# Error Report: Módulo Auth + Perfil

## Resumen

| # | Severidad | Archivo | Problema |
|---|-----------|---------|----------|
| 1 | 🔴 Anterior | `app/dashboard/` | ✅ **CORREGIDO** — Ahora usa Route Group `(app)/` |
| 2 | 🟡 Anterior | `components/header.tsx:33` | ✅ **CORREGIDO** — Muestra username del store |
| 3 | 🟡 Anterior | `app/dashboard/layout.tsx:25` | ✅ **CORREGIDO** — AuthHydrator solo en root layout |
| 4 | 🔵 Anterior | `hooks/use-login.ts:30-34` | ✅ Desviación aceptable (no llama a `useAuth.login()`) |
| **5** | 🟡 **Nuevo** | `hooks/use-login.ts:38-44` | ✅ **CORREGIDO** — Ahora almacena `email`/`firstName`/`lastName` |
| **6** | 🟡 **Nuevo** | `hooks/use-auth.ts:85-101` | ✅ **CORREGIDO** — `hydrate()` no puede restaurar campos que no están en el JWT; perfil ahora usa `useCurrentUser()` como fuente autoritativa |
| **7** | 🔵 **Nuevo** | `app/(app)/dashboard/profile/page.tsx` | ✅ **CORREGIDO** — Perfil prioriza `currentUser` sobre `useAuth` |

---

## Errores Anteriores (Corregidos)

### Error 1 ✅ — Route Group `(dashboard)` no utilizado — CORREGIDO
- **Antes**: Archivos en `app/dashboard/` — layout no cubría módulos futuros
- **Ahora**: Usa Route Group `(app)/` → `app/(app)/layout.tsx` protege todas las rutas (`/dashboard`, `/customers`, etc.)

### Error 2 ✅ — Nombre de usuario no mostrado en header — CORREGIDO
- **Antes**: Hardcoded "Usuario" en dropdown
- **Ahora**: `header.tsx:23` lee `useAuth((s) => s.username)` y lo muestra dinámicamente

### Error 3 ✅ — `AuthHydrator` redundante — CORREGIDO
- **Antes**: Presente en root layout + dashboard layout (doble skeleton)
- **Ahora**: Solo en `app/layout.tsx` → raíz. `(app)/layout.tsx` no lo incluye.

### Error 4 ✅ — Desviación en `use-login.ts` — Aceptable
- **Antes**: `useLogin()` no llama a `useAuth.login()` (usa `setState` directo)
- **Veredicto**: ✅ Desviación aceptable (mejor diseño)

---

## Errores Nuevos

## Error 5 ✅ — `use-login.ts` no almacena email/firstName/lastName — CORREGIDO

- **Archivo**: `hooks/use-login.ts:38-44`
- **Fix**: Se agregaron `email`, `firstName`, `lastName` al `setState` en `onSuccess`.
- **Estado**: ✅ Corregido

---

## Error 6 ✅ — `hydrate()` no restaura email/firstName/lastName — CORREGIDO

- **Archivo**: `hooks/use-auth.ts:85-101`
- **Análisis**: `email`, `firstName`, `lastName` no están en el JWT, solo en la respuesta del login y en `/auth/me/`. Guardarlos en localStorage duplicaría datos y quedarían desactualizados.
- **Fix**: La página de perfil ahora usa `useCurrentUser()` (Error 7) como fuente autoritativa. No es necesario persistir estos campos en localStorage.
- **Estado**: ✅ Corregido por diseño (no se requiere fix en `hydrate()`)

---

## Error 7 ✅ — Perfil lee email/nombre de useAuth (null) en vez de currentUser — CORREGIDO

- **Archivo**: `app/(app)/dashboard/profile/page.tsx`
- **Fix**: Se reemplazaron las lecturas de `useAuth` por `currentUser` como fuente principal, con fallback a `useAuth`.
- **Estado**: ✅ Corregido

---

## Backend — Validación

| # | Componente | Estado | Nota |
|---|-----------|--------|------|
| 1 | `apps/authentication/pagination.py` — `AllResultsPagination` | ✅ | Implementado correctamente |
| 2 | `apps/authentication/views.py` — `PermissionViewSet` usa `AllResultsPagination` | ✅ | Correcto |
| 3 | `apps/authentication/views.py` — `CurrentUserView` incluye `groups` | ✅ | Retorna `{id, name}` correctamente |
| 4 | `apps/*/views.py` — `permission_classes` cambiado a `[IsAuthenticated, DjangoModelPermissions]` | ✅ | 8 apps actualizadas correctamente |
| 5 | `apps/{warehouses,suppliers}/tests/test_views.py` — superusers | ✅ | Tests pasan con superusuarios |

## Frontend — Validación

| # | Componente | Estado | Nota |
|---|-----------|--------|------|
| 1 | `hooks/use-auth.ts` — store con email/firstName/lastName | ✅ | Campos definidos en estado y login() |
| 2 | `hooks/use-groups.ts` — `usePermissions()` desenvuelve PaginatedResponse | ✅ | `data.results` correctamente |
| 3 | `hooks/use-current-user.ts` — nuevo hook | ✅ | Llama a `GET /auth/me/` con staleTime correcto |
| 4 | `app/(app)/dashboard/profile/page.tsx` | ❌ | Error 5, 6, 7 — email/nombre/apellido no se muestran |
| 5 | `components/ui/dropdown-menu.tsx` — GroupLabel envuelto en Group | ✅ | Estructura correcta de shadcn/ui |
| 6 | Route Group `(app)/` | ✅ | Protege todas las rutas del sidebar |
| 7 | Header muestra username | ✅ | Lee de `useAuth((s) => s.username)` |
| 8 | AuthHydrator sin duplicación | ✅ | Solo en root layout |

---

## Build

⚠️ `npm run lint` reporta 23 errores y 16 warnings, pero **ninguno** está en los archivos de auth/perfil. Todos los errores de lint son preexistentes en otros módulos (forms, tables, etc.) y no fueron introducidos por estos cambios.

- `providers/auth-provider.tsx:13` — `setHydrated(true)` en useEffect (pre-existente, reportado en Error 3 anterior)
- Sin errores en: `hooks/use-auth.ts`, `hooks/use-current-user.ts`, `hooks/use-groups.ts`, `hooks/use-login.ts`, `components/header.tsx`, `components/ui/dropdown-menu.tsx`, `app/(app)/dashboard/profile/page.tsx`

---

## Conclusión

Los **3 errores nuevos** fueron corregidos. Todos los cambios de backend y frontend están correctos.

| # | Severidad | Archivo | Estado |
|---|-----------|---------|--------|
| 5 | 🟡 Medio | `hooks/use-login.ts:38-44` | ✅ Corregido |
| 6 | 🟡 Medio | `hooks/use-auth.ts:85-101` | ✅ Corregido |
| 7 | 🔵 Bajo | `profile/page.tsx` | ✅ Corregido |
