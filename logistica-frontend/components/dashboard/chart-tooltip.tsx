"use client"

import type { CustomTooltipProps } from "@tremor/react"

export function ChartTooltip({ payload, active, label }: CustomTooltipProps) {
  if (!active || !payload) return null

  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="mb-1 font-medium text-popover-foreground">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="flex items-center gap-2 font-mono tabular-nums text-popover-foreground">
          <span
            className="inline-block size-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  )
}
