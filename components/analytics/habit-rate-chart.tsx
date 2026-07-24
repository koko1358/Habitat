"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { HabitRate } from "@/lib/analytics/aggregates";

export function HabitRateChart({ data }: { data: HabitRate[] }) {
  const chartData = data.map((h) => ({ name: `${h.icon} ${h.name}`, rate: h.rate }));

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 4, right: 16, left: 4, bottom: 0 }}
        >
          <CartesianGrid horizontal={false} stroke="var(--border)" />
          <XAxis
            type="number"
            domain={[0, 100]}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            unit="%"
          />
          <YAxis
            type="category"
            dataKey="name"
            axisLine={false}
            tickLine={false}
            width={120}
            tick={{ fill: "var(--foreground)", fontSize: 12 }}
          />
          <Tooltip
            cursor={{ fill: "var(--muted)" }}
            contentStyle={{
              background: "var(--popover)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              fontSize: 12,
              color: "var(--popover-foreground)",
            }}
            formatter={(value) => [`${value}%`, "Completion rate"]}
          />
          <Bar dataKey="rate" fill="var(--chart-1)" radius={[4, 4, 4, 4]} maxBarSize={18} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
