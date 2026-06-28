import { redirect } from "next/navigation";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { ProfileAttentionBanner } from "@/components/profile/ProfileAttentionBanner";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { createInsforgeServer } from "@/lib/insforge-server";
import type { Profile } from "@/types";

function calculateCompletion(profile: Profile | null): {
  completionPercent: number;
  missingFields: string[];
} {
  const missing: string[] = [];

  if (!profile?.full_name?.trim()) missing.push("FULL NAME");
  if (!profile?.phone?.trim()) missing.push("PHONE");
  if (!profile?.location?.trim()) missing.push("LOCATION");
  if (!profile?.current_title?.trim()) missing.push("JOB TITLE");
  if (!profile?.experience_level) missing.push("EXP LEVEL");
  if (profile?.years_experience == null) missing.push("YEARS EXP");
  if (!profile?.skills?.length) missing.push("SKILLS");
  if (!profile?.work_experience?.length) missing.push("WORK EXP");
  if (!profile?.education?.degree || !profile?.education?.institution)
    missing.push("EDUCATION");
  if (!profile?.job_titles_seeking?.length) missing.push("JOB TITLES");

  const totalRequired = 10;
  const completionPercent = Math.round(
    ((totalRequired - missing.length) / totalRequired) * 100,
  );

  return { completionPercent, missingFields: missing };
}

export default async function ProfilePage() {
  const insforge = await createInsforgeServer();
  const { data: userData, error: authError } =
    await insforge.auth.getCurrentUser();

  if (authError || !userData.user) {
    redirect("/login");
  }

  const { data: profileData } = await insforge.database
    .from("profiles")
    .select("*")
    .eq("id", userData.user.id)
    .maybeSingle();

  const profile = profileData as Profile | null;
  const { completionPercent, missingFields } = calculateCompletion(profile);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-360 px-6 py-8">
        <div className="flex flex-col gap-6">
          <ProfileAttentionBanner
            completionPercent={completionPercent}
            missingFields={missingFields}
          />
          <ProfileForm profile={profile} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
