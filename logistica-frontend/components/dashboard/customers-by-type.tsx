"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"
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
  COMPANY: "#10b981",
  INDIVIDUAL: "#06b6d4",
}

const valueFormatter = (n: number) =>
  new Intl.NumberFormat("es-ES").format(n)

export function CustomersByType({ data, isLoading }: CustomersByTypeProps) {
  const chartData = data.map(item => ({
    name: typeLabels[item.name] ?? item.name,
    value: item.value,
  }))

  const colors = data.map(item => typeColors[item.name] ?? "#64748b")

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
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
              >
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={colors[i] ?? "#64748b"} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} formatter={valueFormatter} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
