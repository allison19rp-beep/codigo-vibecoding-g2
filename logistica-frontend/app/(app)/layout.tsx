"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState, type ReactNode } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Sidebar, SidebarContent } from "@/components/sidebar"
import { Header } from "@/components/header"
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const isAuthenticated = useAuth((s) => s.isAuthenticated)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-60 p-0">
          <SidebarContent onNav={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>
      <div className="flex flex-1 flex-col min-w-0">
        <Header onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  )
}
