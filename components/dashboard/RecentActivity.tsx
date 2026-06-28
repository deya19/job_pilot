import type { ActivityEntry as ActivityEntryType } from "@/actions/dashboard";

type Props = {
  activities?: ActivityEntryType[];
};

type DotProps = {
  type: ActivityEntryType["type"];
};

function ActivityDot({ type }: DotProps) {
  if (type === "job_found") {
    return (
      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-success-light">
        <span className="h-2 w-2 rounded-full bg-success-alt" />
      </span>
    );
  }
  return (
    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-info-light">
      <span className="h-2 w-2 rounded-full bg-info" />
    </span>
  );
}

export function RecentActivity({ activities }: Props) {
  const hasActivities = activities && activities.length > 0;

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <h2 className="text-base font-semibold text-text-primary">Recent Activity</h2>
      {hasActivities ? (
        <ul className="mt-4 flex flex-col gap-4">
          {activities.map((entry) => (
            <li key={entry.id} className="flex items-start gap-3">
              <div className="mt-0.5">
                <ActivityDot type={entry.type} />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-text-primary">{entry.text}</span>
                <span className="text-xs text-text-muted">{entry.timestamp}</span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-text-muted">No recent activity yet.</p>
      )}
    </div>
  );
}
