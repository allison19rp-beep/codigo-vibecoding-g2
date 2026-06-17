"use client"

import { useState, useEffect } from "react"
import { ListFilter } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

interface ResponsiveFiltersProps {
  children: React.ReactNode
}

export function ResponsiveFilters({ children }: ResponsiveFiltersProps) {
  const [open, setOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(true)

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)")
    setIsDesktop(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  if (!isDesktop) {
    return (
      <>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setOpen(true)}
        >
          <ListFilter className="size-4" />
          Filtros
        </Button>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>Filtros</SheetTitle>
            </SheetHeader>
            <div className="mt-4 flex flex-col gap-4">
              {children}
            </div>
          </SheetContent>
        </Sheet>
      </>
    )
  }

  return (
    <div className="flex flex-row flex-wrap items-end gap-3">
      {children}
    </div>
  )
}
