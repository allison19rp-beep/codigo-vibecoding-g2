"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { BarChart } from "@tremor/react"
import type { FleetItem } from "@/types/dashboard"
import { ChartTooltip } from "./chart-tooltip"

interface FleetCompositionProps {
  data: FleetItem[]
  isLoading: boolean
}

const fleetLabels: Record<string, string> = {
  TRUCK: "Camión",
  VAN: "Camioneta",
  MOTORCYCLE: "Moto",
  CARGO_BIKE: "Bici",
}

export function FleetComposition({ data, isLoading }: FleetCompositionProps) {
  const chartData = data.map(item => ({
    name: fleetLabels[item.name] ?? item.name,
    cantidad: item.cantidad,
  }))

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Composición de flota</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[250px] w-full rounded-xl" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Composición de flota</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
            No hay vehículos registrados
          </div>
        ) : (
          <BarChart
            data={chartData}
            index="name"
            categories={["cantidad"]}
            colors={["indigo"]}
            layout="vertical"
            showLegend={false}
            showAnimation
            customTooltip={ChartTooltip}
            className="h-[250px]"
          />
        )}
      </CardContent>
    </Card>
  )
}
