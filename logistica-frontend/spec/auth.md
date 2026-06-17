# Spec: Auth

## Requisitos

- Login con username y password
- Almacenar tokens JWT (access + refresh) en localStorage
- Interceptor axios para adjuntar `Authorization: Bearer <access>` en cada request (ya implementado en `lib/axios.ts`)
- Refresh automático de token al recibir 401 (ya implementado en `lib/axios.ts`)
- Logout: limpiar localStorage + redirigir a `/login`
- Proteger rutas: redirigir a `/login` si no hay token
- Hydrate estado de auth al cargar la app (leer tokens de localStorage)
- Layout protegido con header y sidebar
- Mostrar nombre de usuario logueado en el header

## API Endpoints

- `POST /api/v1/auth/token/` — login. Request: `{ username, password }`. Response: `{ access, refresh }`.
- `POST /api/v1/auth/token/refresh/` — refresh token. Request: `{ refresh }`. Response: `{ access }`.

Ambos son públicos (no requieren JWT).

## Lo que ya existe (no modificar)

- `lib/axios.ts` — instancia axios con baseURL, request interceptor (Bearer token), response interceptor (refresh automático en 401, redirect a `/login` si falla refresh)
- `hooks/use-auth.ts` — store Zustand con `accessToken`, `refreshToken`, `isAuthenticated`, `login()`, `logout()`, `hydrate()`
- `providers/query-provider.tsx` — TanStack Query provider (ya envuelve la app)
- `components/ui/` — shadcn/ui components: button, input, card, label, sonner (toast), etc.

## Componentes a crear

### `app/login/page.tsx`
- Página pública de login
- Layout minimalista centrado (card con logo + formulario)
- Si ya está autenticado, redirigir a `/dashboard`

### `components/login-form.tsx`
- Inputs: username, password (type=password)
- Botón submit con estado de carga (disabled + spinner mientras muta)
- Manejo de errores: mostrar toast (sonner) con mensaje del backend (ej: "Invalid credentials")
- Validación client-side: campos requeridos
- `use client`

### `app/(dashboard)/layout.tsx`
- Layout protegido: verifica `isAuthenticated`, redirige a `/login` si no hay token
- Renderiza `AuthHydrator` + sidebar + header + `<main>{children}</main>`
- `use client`

### `components/sidebar.tsx`
- Navegación lateral con links a cada módulo: Dashboard, Customers, Warehouses, Suppliers, Products, Transport, Drivers, Routes, Shipments
- Usa iconos de lucide-react
- Link activo resaltado según ruta actual
- Versión colapsable (opcional)

### `components/header.tsx`
- Barra superior: breadcrumb o título de página, nombre de usuario, botón de logout
- Dropdown-menu con opciones de usuario (logout)

### `app/(dashboard)/page.tsx`
- Página de dashboard (destino post-login)
- Placeholder con cards de resumen (pendiente de implementar con datos reales)

### `app/(dashboard)/customers/page.tsx`
- Placeholder para el módulo Customers (próximo a implementar)

## Hooks/Queries

### `hooks/use-login.ts`
- TanStack Query `useMutation` que llama a `api.post("/auth/token/", { username, password })`
- `onSuccess`: llama a `useAuth.getState().login(username, password)` con los tokens de la respuesta
- `onError`: extraer mensaje del backend (`error.response?.data?.detail`) y mostrar toast
- Retorna `{ mutate, isPending, error }`

## Providers

### `providers/auth-provider.tsx`
- `use client`
- Llama a `useAuth.getState().hydrate()` en el `useEffect` de montaje
- Muestra un skeleton/spinner mientras hidrata
- Provee el estado de auth al árbol (evita flash de contenido no autenticado)

## Tareas

- [x] Crear `app/login/page.tsx` — página de login centrada con card
- [x] Crear `components/login-form.tsx` — formulario con inputs username/password, botón submit, validación y errores
- [x] Crear `hooks/use-login.ts` — TanStack Query mutation para login
- [x] Crear `providers/auth-provider.tsx` — hydrate auth state en mount + loading skeleton
- [x] Crear `app/(dashboard)/layout.tsx` — layout protegido con sidebar y header
- [x] Crear `components/sidebar.tsx` — navegación lateral con links a módulos
- [x] Crear `components/header.tsx` — header con nombre de usuario y logout
- [x] Crear `app/(dashboard)/page.tsx` — dashboard placeholder post-login
- [x] Conectar `AuthProvider` en `app/layout.tsx` para proteger rutas
- [x] Verificar build con `npm run build`

## Flujo de navegación

```
/ → redirige a /dashboard o /login según auth
/login → formulario de login → éxito → /dashboard
/dashboard → layout protegido con sidebar + header
/customers → (próximo módulo)
...
```

## Estados de UI

| Estado | Componente | Comportamiento |
|--------|------------|----------------|
| Loading (hydrate) | AuthProvider | Skeleton/spinner full screen |
| Loading (login) | LoginForm | Botón disabled con spinner |
| Error (login) | LoginForm | Toast con mensaje de error (sonner) |
| Success (login) | LoginForm → redirect | Navegar a /dashboard |
| Expired token | Axios interceptor | Refresh automático (silencioso) |
| Refresh falla | Axios interceptor | Logout + redirect a /login |
| Logout | Header → dropdown | Limpiar localStorage + redirect a /login |
| No token | Dashboard layout | Redirect a /login |

## Dependencias

- Ninguna (módulo inicial)
- Dependencias ya instaladas: zustand, @tanstack/react-query, axios, sonner, lucide-react
