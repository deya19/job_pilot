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

import type { ChartDayPoint } from "@/actions/dashboard";

type Props = {
  data?: ChartDayPoint[];
};

export function CompanyResearchChart({ data }: Props) {
  const total = data?.reduce((sum, point) => sum + point.count, 0) ?? 0;

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <h2 className="mb-6 text-base font-semibold text-text-primary">
        Company Research Activity
      </h2>
      {total === 0 ? (
        <div className="flex h-55 items-center justify-center">
          <p className="text-sm text-text-muted">No data yet</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} barSize={28}>
            <CartesianGrid
              vertical={false}
              strokeDasharray="4 4"
              stroke="var(--color-border)"
            />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--color-text-muted)", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--color-text-muted)", fontSize: 12 }}
              width={24}
              domain={[0, "auto"]}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ fill: "var(--color-surface-secondary)" }}
              contentStyle={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Bar
              dataKey="count"
              fill="var(--color-info)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
