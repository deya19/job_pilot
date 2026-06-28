import { AlertCircle, CheckCircle2 } from "lucide-react";

type Props = {
  completionPercent: number;
  missingFields: string[];
};

const CIRCUMFERENCE = 2 * Math.PI * 18;

export function ProfileAttentionBanner({ completionPercent, missingFields }: Props) {
  const isComplete = missingFields.length === 0;
  const progress = (completionPercent / 100) * CIRCUMFERENCE;
  const remaining = CIRCUMFERENCE - progress;

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex items-center gap-2">
            {isComplete ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-warning" />
            )}
            <span className="text-sm font-semibold text-text-primary">
              {isComplete ? "Profile complete" : "Profile needs attention"}
            </span>
          </div>
          <p className="text-xs leading-5 text-text-secondary">
            {isComplete
              ? "Your profile is complete. You'll get the best job matches possible."
              : "Complete your profile to get better job matches. A complete profile helps our AI find roles that truly fit your background and goals."}
          </p>
          {!isComplete && missingFields.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {missingFields.map((field) => (
                <span
                  key={field}
                  className="rounded-full bg-warning/10 px-2.5 py-0.5 text-xs font-medium text-warning"
                >
                  {field}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="relative shrink-0">
          <svg
            width="56"
            height="56"
            viewBox="0 0 44 44"
            className="-rotate-90"
          >
            <circle
              cx="22"
              cy="22"
              r="18"
              fill="none"
              stroke="var(--color-border)"
              strokeWidth="4"
            />
            <circle
              cx="22"
              cy="22"
              r="18"
              fill="none"
              stroke={isComplete ? "var(--color-success)" : "var(--color-error)"}
              strokeWidth="4"
              strokeDasharray={`${progress} ${remaining}`}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-text-primary">
            {completionPercent}%
          </span>
        </div>
      </div>
    </div>
  );
}
