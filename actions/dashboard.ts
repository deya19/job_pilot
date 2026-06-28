"use server";

import { createInsforgeServer } from "@/lib/insforge-server";

export type DashboardStats = {
  totalJobs: number;
  averageMatchRate: number;
  companiesResearched: number;
  jobsThisWeek: number;
};

export type ActivityEntry = {
  id: string;
  text: string;
  timestamp: string;
  createdAt: string;
  type: "job_found" | "researched";
};

export async function getDashboardStats(): Promise<{
  success: boolean;
  stats?: DashboardStats;
  error?: string;
}> {
  try {
    const insforge = await createInsforgeServer();
    const { data: userData, error: authError } =
      await insforge.auth.getCurrentUser();

    if (authError || !userData?.user) {
      return { success: false, error: "Not authenticated" };
    }

    const userId = userData.user.id;

    const { count: totalJobs, error: totalError } = await insforge.database
      .from("jobs")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if (totalError) {
      console.error("[actions/dashboard] totalJobs error:", totalError);
      return { success: false, error: "Failed to load dashboard stats" };
    }

    const { data: avgData, error: avgError } = await insforge.database
      .from("jobs")
      .select("match_score")
      .eq("user_id", userId);

    if (avgError) {
      console.error("[actions/dashboard] avgMatchRate error:", avgError);
      return { success: false, error: "Failed to load dashboard stats" };
    }

    const scores = (avgData ?? []).map((row) => row.match_score).filter(
      (score): score is number => typeof score === "number",
    );
    const averageMatchRate =
      scores.length > 0
        ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
        : 0;

    const { count: companiesResearched, error: researchError } = await insforge
      .database
      .from("jobs")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .not("company_research", "is", null);

    if (researchError) {
      console.error("[actions/dashboard] companiesResearched error:", researchError);
      return { success: false, error: "Failed to load dashboard stats" };
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoIso = sevenDaysAgo.toISOString();

    const { count: jobsThisWeek, error: weekError } = await insforge.database
      .from("jobs")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("found_at", sevenDaysAgoIso);

    if (weekError) {
      console.error("[actions/dashboard] jobsThisWeek error:", weekError);
      return { success: false, error: "Failed to load dashboard stats" };
    }

    return {
      success: true,
      stats: {
        totalJobs: totalJobs ?? 0,
        averageMatchRate,
        companiesResearched: companiesResearched ?? 0,
        jobsThisWeek: jobsThisWeek ?? 0,
      },
    };
  } catch (error) {
    console.error("[actions/dashboard]", error);
    return { success: false, error: "Failed to load dashboard stats" };
  }
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} min${diffMinutes === 1 ? "" : "s"} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export async function getRecentActivity(): Promise<{
  success: boolean;
  activities?: ActivityEntry[];
  error?: string;
}> {
  try {
    const insforge = await createInsforgeServer();
    const { data: userData, error: authError } =
      await insforge.auth.getCurrentUser();

    if (authError || !userData?.user) {
      return { success: false, error: "Not authenticated" };
    }

    const userId = userData.user.id;

    const { data: runs, error: runsError } = await insforge.database
      .from("agent_runs")
      .select("id, job_title_searched, jobs_found, completed_at")
      .eq("user_id", userId)
      .eq("status", "completed")
      .order("completed_at", { ascending: false })
      .limit(10);

    if (runsError) {
      console.error("[actions/dashboard] recent activity runs error:", runsError);
      return { success: false, error: "Failed to load recent activity" };
    }

    const { data: researchedJobs, error: jobsError } = await insforge.database
      .from("jobs")
      .select("id, company, company_research, found_at")
      .eq("user_id", userId)
      .not("company_research", "is", null)
      .order("found_at", { ascending: false })
      .limit(10);

    if (jobsError) {
      console.error("[actions/dashboard] recent activity jobs error:", jobsError);
      return { success: false, error: "Failed to load recent activity" };
    }

    const runActivities: ActivityEntry[] = (runs ?? [])
      .filter((run) => run.completed_at)
      .map((run) => ({
        id: `run-${run.id}`,
        text: `Found ${run.jobs_found ?? 0} jobs for ${run.job_title_searched ?? "a search"}`,
        timestamp: formatRelativeTime(run.completed_at!),
        createdAt: run.completed_at!,
        type: "job_found",
      }));

    const researchActivities: ActivityEntry[] = (researchedJobs ?? []).map((job) => ({
      id: `research-${job.id}`,
      text: `Researched ${job.company}`,
      timestamp: formatRelativeTime(job.found_at),
      createdAt: job.found_at,
      type: "researched",
    }));

    const activities = [...runActivities, ...researchActivities]
      .sort((a, b) => {
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        return timeB - timeA;
      })
      .slice(0, 5);

    return { success: true, activities };
  } catch (error) {
    console.error("[actions/dashboard] recent activity", error);
    return { success: false, error: "Failed to load recent activity" };
  }
}

export type ChartDayPoint = {
  day: string;
  count: number;
};

export type MatchScoreBucket = {
  range: string;
  count: number;
};

export type DashboardCharts = {
  jobsFound: ChartDayPoint[];
  companyResearch: ChartDayPoint[];
  matchScores: MatchScoreBucket[];
};

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function toISODate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function formatMonthDay(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getMatchScoreBucket(score: number): MatchScoreBucket["range"] | null {
  if (score >= 90) return "90-100%";
  if (score >= 80) return "80-90%";
  if (score >= 70) return "70-80%";
  if (score >= 60) return "60-70%";
  if (score >= 50) return "50-60%";
  return null;
}

export async function getDashboardChartData(): Promise<{
  success: boolean;
  charts?: DashboardCharts;
  error?: string;
}> {
  try {
    const insforge = await createInsforgeServer();
    const { data: userData, error: authError } =
      await insforge.auth.getCurrentUser();

    if (authError || !userData?.user) {
      return { success: false, error: "Not authenticated" };
    }

    const userId = userData.user.id;
    const today = startOfDay(new Date());

    // Jobs Found Over Time — last 30 days
    const thirtyDaysAgo = addDays(today, -29);
    const { data: jobsFoundRows, error: jobsFoundError } = await insforge
      .database
      .from("jobs")
      .select("found_at")
      .eq("user_id", userId)
      .gte("found_at", thirtyDaysAgo.toISOString());

    if (jobsFoundError) {
      console.error("[actions/dashboard] jobsFound error:", jobsFoundError);
      return { success: false, error: "Failed to load chart data" };
    }

    const jobsFoundCounts = new Map<string, number>();
    for (const row of jobsFoundRows ?? []) {
      if (!row.found_at) continue;
      const key = toISODate(new Date(row.found_at));
      jobsFoundCounts.set(key, (jobsFoundCounts.get(key) ?? 0) + 1);
    }

    const jobsFound: ChartDayPoint[] = [];
    for (let i = -29; i <= 0; i++) {
      const date = addDays(today, i);
      const key = toISODate(date);
      jobsFound.push({
        day: formatMonthDay(date),
        count: jobsFoundCounts.get(key) ?? 0,
      });
    }

    // Company Research Activity — last 30 days
    const { data: researchRows, error: researchError } = await insforge
      .database
      .from("jobs")
      .select("found_at")
      .eq("user_id", userId)
      .not("company_research", "is", null)
      .gte("found_at", thirtyDaysAgo.toISOString());

    if (researchError) {
      console.error(
        "[actions/dashboard] companyResearch error:",
        researchError,
      );
      return { success: false, error: "Failed to load chart data" };
    }

    const researchCounts = new Map<string, number>();
    for (const row of researchRows ?? []) {
      if (!row.found_at) continue;
      const key = toISODate(new Date(row.found_at));
      researchCounts.set(key, (researchCounts.get(key) ?? 0) + 1);
    }

    const companyResearch: ChartDayPoint[] = [];
    for (let i = -29; i <= 0; i++) {
      const date = addDays(today, i);
      const key = toISODate(date);
      companyResearch.push({
        day: formatMonthDay(date),
        count: researchCounts.get(key) ?? 0,
      });
    }

    // Match Score Distribution — all user jobs with a score
    const { data: scoreRows, error: scoreError } = await insforge.database
      .from("jobs")
      .select("match_score")
      .eq("user_id", userId)
      .not("match_score", "is", null);

    if (scoreError) {
      console.error("[actions/dashboard] matchScores error:", scoreError);
      return { success: false, error: "Failed to load chart data" };
    }

    const buckets: MatchScoreBucket[] = [
      { range: "50-60%", count: 0 },
      { range: "60-70%", count: 0 },
      { range: "70-80%", count: 0 },
      { range: "80-90%", count: 0 },
      { range: "90-100%", count: 0 },
    ];

    for (const row of scoreRows ?? []) {
      const score = row.match_score;
      if (typeof score !== "number") continue;
      const label = getMatchScoreBucket(score);
      if (!label) continue;
      const bucket = buckets.find((b) => b.range === label);
      if (bucket) bucket.count++;
    }

    return {
      success: true,
      charts: {
        jobsFound,
        companyResearch,
        matchScores: buckets,
      },
    };
  } catch (error) {
    console.error("[actions/dashboard] chart data", error);
    return { success: false, error: "Failed to load chart data" };
  }
}
