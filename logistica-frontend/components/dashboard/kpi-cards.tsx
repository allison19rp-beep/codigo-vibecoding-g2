"use client"

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Users, Truck, Bus, IdCard } from "lucide-react"
import type { KpiData } from "@/types/dashboard"

interface KpiCardsProps {
  data: KpiData
  isLoading: boolean
}

export function KpiCards({ data, isLoading }: KpiCardsProps) {
  const items = [
    { label: "Clientes activos", value: data.clientesActivos, icon: Users, color: "text-blue-500" },
    { label: "Envíos en tránsito", value: data.enviosEnTransito, icon: Truck, color: "text-orange-500" },
    { label: "Transporte disponible", value: data.transporteDisponible, icon: Bus, color: "text-green-500" },
    { label: "Conductores activos", value: data.conductoresActivos, icon: IdCard, color: "text-purple-500" },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <Card key={item.label} size="sm">
            <CardHeader>
              <Icon className={`size-5 ${item.color}`} />
              <CardTitle className="text-3xl">
                {isLoading ? <Skeleton className="h-8 w-20" /> : item.value}
              </CardTitle>
              <CardDescription>{item.label}</CardDescription>
            </CardHeader>
          </Card>
        )
      })}
    </div>
  )
}
