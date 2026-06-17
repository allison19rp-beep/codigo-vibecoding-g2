"use client"

import { useEffect, useState, type ReactNode } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Skeleton } from "@/components/ui/skeleton"

export function AuthHydrator({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false)
  const hydrate = useAuth((s) => s.hydrate)

  useEffect(() => {
    hydrate()
    setHydrated(true)
  }, [hydrate])

  if (!hydrated) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    )
  }

  return <>{children}</>
}
