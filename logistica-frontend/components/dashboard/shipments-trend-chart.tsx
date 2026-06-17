"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AreaChart } from "@tremor/react"
import type { ShipmentTrendItem } from "@/types/dashboard"
import { ChartTooltip } from "./chart-tooltip"

interface ShipmentsTrendChartProps {
  data: ShipmentTrendItem[]
  isLoading: boolean
}

export function ShipmentsTrendChart({ data, isLoading }: ShipmentsTrendChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Envíos por mes</CardTitle>
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
        <CardTitle>Envíos por mes</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
            No hay datos de envíos por mes
          </div>
        ) : (
          <AreaChart
            data={data}
            index="date"
            categories={["envios"]}
            colors={["blue"]}
            showLegend={false}
            showAnimation
            curveType="monotone"
            customTooltip={ChartTooltip}
            className="h-[250px]"
          />
        )}
      </CardContent>
    </Card>
  )
}
