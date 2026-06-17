"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { DonutChart, Legend } from "@tremor/react"
import type { ChartDataItem } from "@/types/dashboard"
import { ChartTooltip } from "./chart-tooltip"

interface ShipmentsStatusChartProps {
  data: ChartDataItem[]
  isLoading: boolean
}

const statusColors: Record<string, string> = {
  PENDING: "amber",
  CONFIRMED: "blue",
  IN_TRANSIT: "orange",
  DELIVERED: "emerald",
  CANCELLED: "rose",
  RETURNED: "slate",
}

const statusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmado",
  IN_TRANSIT: "En tránsito",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
  RETURNED: "Devuelto",
}

const valueFormatter = (n: number) =>
  new Intl.NumberFormat("es-ES").format(n)

export function ShipmentsStatusChart({ data, isLoading }: ShipmentsStatusChartProps) {
  const chartData = data.map(item => ({
    name: statusLabels[item.name] ?? item.name,
    value: item.value,
  }))

  const colors = data.map(item => statusColors[item.name] ?? "slate")

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Envíos por estado</CardTitle>
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
        <CardTitle>Envíos por estado</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 || chartData.every(d => d.value === 0) ? (
          <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
            No hay envíos registrados
          </div>
        ) : (
          <>
            <DonutChart
              data={chartData}
              category="value"
              index="name"
              colors={colors}
              showAnimation
              valueFormatter={valueFormatter}
              customTooltip={ChartTooltip}
              className="h-[250px]"
            />
            <div className="mt-3 flex justify-center">
              <Legend
                categories={chartData.map(d => d.name)}
                colors={colors}
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
