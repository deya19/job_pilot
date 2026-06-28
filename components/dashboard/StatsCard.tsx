import { TrendingUp } from "lucide-react";

type Props = {
  label: string;
  value: string;
  trend?: string;
  trendLabel?: string;
  subtitle?: string;
};

export function StatsCard({ label, value, trend, trendLabel, subtitle }: Props) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <p className="text-sm font-medium text-text-secondary">{label}</p>
      <p className="mt-2 text-[30px] font-semibold leading-9 text-text-primary">{value}</p>
      <div className="mt-2 flex items-center gap-2">
        {trend && trendLabel && (
          <span className="inline-flex items-center gap-1 rounded-sm bg-success-lightest px-2 py-0.5 text-xs font-medium text-success-darker">
            <TrendingUp className="h-3 w-3" />
            {trend}
          </span>
        )}
        {(trendLabel || subtitle) && (
          <span className="text-xs text-text-muted">{trendLabel ?? subtitle}</span>
        )}
      </div>
    </div>
  );
}
