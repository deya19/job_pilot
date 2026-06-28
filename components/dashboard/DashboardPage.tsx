import Link from "next/link";
import { AlertCircle } from "lucide-react";

import { StatsCard } from "@/components/dashboard/StatsCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { CompanyResearchChart } from "@/components/dashboard/CompanyResearchChart";
import { JobsFoundChart } from "@/components/dashboard/JobsFoundChart";
import { MatchScoreChart } from "@/components/dashboard/MatchScoreChart";
import type {
  ActivityEntry,
  DashboardStats,
  DashboardCharts,
} from "@/actions/dashboard";

type Props = {
  profileComplete: boolean;
  stats?: DashboardStats;
  activities?: ActivityEntry[];
  charts?: DashboardCharts;
};

export function DashboardPage({
  profileComplete,
  stats,
  activities,
  charts,
}: Props) {
  return (
    <div className="flex flex-col gap-6">
      {!profileComplete && (
        <div className="flex items-center gap-3 rounded-xl border border-warning/30 bg-warning/5 px-5 py-4">
          <AlertCircle className="h-5 w-5 shrink-0 text-warning" />
          <p className="text-sm font-medium text-text-primary">
            Your profile is incomplete.{" "}
            <Link href="/profile" className="font-semibold text-accent hover:underline">
              Complete your profile
            </Link>{" "}
            to unlock job matching.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label="Total Jobs Found"
          value={String(stats?.totalJobs ?? 0)}
          trend="+12%"
          trendLabel="vs last week"
        />
        <StatsCard
          label="Avg. Match Rate"
          value={`${stats?.averageMatchRate ?? 0}%`}
          trend="+3%"
          trendLabel="vs last week"
        />
        <StatsCard
          label="Companies Researched"
          value={String(stats?.companiesResearched ?? 0)}
          subtitle="Total researched"
        />
        <StatsCard
          label="Jobs This Week"
          value={String(stats?.jobsThisWeek ?? 0)}
          subtitle="New this week"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentActivity activities={activities} />
        <CompanyResearchChart data={charts?.companyResearch} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <JobsFoundChart data={charts?.jobsFound} />
        <MatchScoreChart data={charts?.matchScores} />
      </div>
    </div>
  );
}
