import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, renderHook, type RenderOptions } from "@testing-library/react"
import type { ReactElement, ReactNode } from "react"

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  })
}

function QueryWrapper({ children }: { children: ReactNode }) {
  const queryClient = createTestQueryClient()
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

function renderWithQuery(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) {
  return render(ui, { wrapper: QueryWrapper, ...options })
}

function renderHookWithQuery<Result, Props>(
  hook: (initialProps: Props) => Result,
  options?: Omit<RenderOptions, "wrapper">,
) {
  return renderHook(hook, { wrapper: QueryWrapper, ...options })
}

export { renderWithQuery, renderHookWithQuery, QueryWrapper }
export type { RenderOptions }
