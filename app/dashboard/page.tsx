import { redirect } from "next/navigation";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { DashboardPage } from "@/components/dashboard/DashboardPage";
import {
  getDashboardStats,
  getRecentActivity,
  getDashboardChartData,
} from "@/actions/dashboard";
import { createInsforgeServer } from "@/lib/insforge-server";

export default async function Page() {
  const insforge = await createInsforgeServer();
  const { data: userData } = await insforge.auth.getCurrentUser();

  if (!userData?.user) {
    redirect("/login");
  }

  const { data: profile } = await insforge.database
    .from("profiles")
    .select("is_complete")
    .eq("id", userData.user.id)
    .single();

  const profileComplete = profile?.is_complete ?? false;

  const statsResult = await getDashboardStats();
  const stats = statsResult.success ? statsResult.stats : undefined;

  const activityResult = await getRecentActivity();
  const activities = activityResult.success ? activityResult.activities : undefined;

  const chartsResult = await getDashboardChartData();
  const charts = chartsResult.success ? chartsResult.charts : undefined;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-360 px-6 py-8">
        <DashboardPage
          profileComplete={profileComplete}
          stats={stats}
          activities={activities}
          charts={charts}
        />
      </main>
      <Footer />
    </div>
  );
}
