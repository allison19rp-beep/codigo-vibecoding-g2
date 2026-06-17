"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { DonutChart } from "@tremor/react"
import type { ChartDataItem } from "@/types/dashboard"
import { ChartTooltip } from "./chart-tooltip"

interface CustomersByTypeProps {
  data: ChartDataItem[]
  isLoading: boolean
}

const typeLabels: Record<string, string> = {
  COMPANY: "Empresa",
  INDIVIDUAL: "Individual",
}

const typeColors: Record<string, string> = {
  COMPANY: "emerald",
  INDIVIDUAL: "cyan",
}

const valueFormatter = (n: number) =>
  new Intl.NumberFormat("es-ES").format(n)

export function CustomersByType({ data, isLoading }: CustomersByTypeProps) {
  const chartData = data.map(item => ({
    name: typeLabels[item.name] ?? item.name,
    value: item.value,
  }))

  const colors = data.map(item => typeColors[item.name] ?? "slate")

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Clientes por tipo</CardTitle>
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
        <CardTitle>Clientes por tipo</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 || chartData.every(d => d.value === 0) ? (
          <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
            No hay clientes registrados
          </div>
        ) : (
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
        )}
      </CardContent>
    </Card>
  )
}
