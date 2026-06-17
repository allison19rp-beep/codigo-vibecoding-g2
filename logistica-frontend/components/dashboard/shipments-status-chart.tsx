"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"
import type { ChartDataItem } from "@/types/dashboard"
import { ChartTooltip } from "./chart-tooltip"

interface ShipmentsStatusChartProps {
  data: ChartDataItem[]
  isLoading: boolean
}

const statusColors: Record<string, string> = {
  PENDING: "#f59e0b",
  CONFIRMED: "#3b82f6",
  IN_TRANSIT: "#f97316",
  DELIVERED: "#10b981",
  CANCELLED: "#f43f5e",
  RETURNED: "#64748b",
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

  const colors = data.map(item => statusColors[item.name] ?? "#64748b")

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
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </>
        )}
      </CardContent>
    </Card>
  )
}
