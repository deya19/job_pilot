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

import type { MatchScoreBucket } from "@/actions/dashboard";

type Props = {
  data?: MatchScoreBucket[];
};

export function MatchScoreChart({ data }: Props) {
  const total = data?.reduce((sum, bucket) => sum + bucket.count, 0) ?? 0;

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <h2 className="mb-6 text-base font-semibold text-text-primary">
        Match Score Distribution
      </h2>
      {total === 0 ? (
        <div className="flex h-55 items-center justify-center">
          <p className="text-sm text-text-muted">No data yet</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} barSize={32}>
            <CartesianGrid
              vertical={false}
              strokeDasharray="4 4"
              stroke="var(--color-border)"
            />
            <XAxis
              dataKey="range"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--color-text-muted)", fontSize: 11 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--color-text-muted)", fontSize: 12 }}
              domain={[0, "auto"]}
              allowDecimals={false}
              width={28}
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
              fill="var(--color-success)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
