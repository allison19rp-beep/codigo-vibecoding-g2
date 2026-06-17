"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  Warehouse,
  Building2,
  Package,
  Truck,
  UserCircle,
  Map,
  PackageCheck,
  Shield,
  ShieldCheck,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/customers", label: "Clientes", icon: Users },
  { href: "/warehouses", label: "Almacenes", icon: Warehouse },
  { href: "/suppliers", label: "Proveedores", icon: Building2 },
  { href: "/products", label: "Productos", icon: Package },
  { href: "/transport", label: "Transporte", icon: Truck },
  { href: "/drivers", label: "Conductores", icon: UserCircle },
  { href: "/routes", label: "Rutas", icon: Map },
  { href: "/shipments", label: "Envíos", icon: PackageCheck },
]

export function SidebarContent({ onNav }: { onNav?: () => void }) {
  const pathname = usePathname()
  const isSuperuser = useAuth((s) => s.isSuperuser)

  return (
    <>
      <div className="flex h-14 items-center border-b px-4">
        <span className="text-lg font-semibold text-sidebar-foreground">Logística</span>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-2">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNav}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="size-4" />
              {link.label}
            </Link>
          )
        })}
        {isSuperuser && (
          <>
            <div className="my-1 border-t border-sidebar-border" />
            <p className="px-3 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
              Administración
            </p>
            <Link
              href="/dashboard/users"
              onClick={onNav}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname === "/dashboard/users"
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <Shield className="size-4" />
              Usuarios
            </Link>
            <Link
              href="/dashboard/groups"
              onClick={onNav}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname === "/dashboard/groups"
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <ShieldCheck className="size-4" />
              Roles
            </Link>
          </>
        )}
      </nav>
    </>
  )
}

export function Sidebar() {
  return (
    <aside className="hidden h-full w-60 flex-col border-r bg-sidebar lg:flex">
      <SidebarContent />
    </aside>
  )
}
