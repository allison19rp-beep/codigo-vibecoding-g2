"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts"
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
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="cantidad" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
