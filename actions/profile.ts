"use server";

import { revalidatePath } from "next/cache";

import { createInsforgeServer } from "@/lib/insforge-server";
import type {
  CoverLetterTone,
  ExperienceLevel,
  RemotePreference,
  WorkAuthorization,
  WorkExperience,
} from "@/types";

export type ProfileFormData = {
  full_name: string;
  phone: string;
  location: string;
  linkedin_url: string;
  portfolio_url: string;
  work_authorization: WorkAuthorization | "";
  current_title: string;
  experience_level: ExperienceLevel | "";
  years_experience: string;
  skills: string[];
  industries: string[];
  work_experience: WorkExperience[];
  degree: string;
  field: string;
  institution: string;
  graduation_year: string;
  job_titles_seeking: string[];
  remote_preference: RemotePreference | "";
  salary_expectation: string;
  preferred_locations: string[];
  cover_letter_tone: CoverLetterTone | "";
  resume_pdf_url: string | null;
};


function calculateCompletion(data: ProfileFormData): {
  completionPercent: number;
  missingFields: string[];
} {
  const missing: string[] = [];

  if (!data.full_name.trim()) missing.push("FULL NAME");
  if (!data.phone.trim()) missing.push("PHONE");
  if (!data.location.trim()) missing.push("LOCATION");
  if (!data.current_title.trim()) missing.push("JOB TITLE");
  if (!data.experience_level) missing.push("EXP LEVEL");
  if (!data.years_experience) missing.push("YEARS EXP");
  if (data.skills.length === 0) missing.push("SKILLS");
  if (data.work_experience.length === 0) missing.push("WORK EXP");
  if (!data.degree.trim() || !data.institution.trim()) missing.push("EDUCATION");
  if (data.job_titles_seeking.length === 0) missing.push("JOB TITLES");

  const totalRequired = 10;
  const completionPercent = Math.round(
    ((totalRequired - missing.length) / totalRequired) * 100,
  );

  return { completionPercent, missingFields: missing };
}

export async function saveProfile(
  data: ProfileFormData,
): Promise<{ success: boolean; error?: string; completionPercent?: number }> {
  try {
    const insforge = await createInsforgeServer();
    const { data: userData, error: authError } =
      await insforge.auth.getCurrentUser();

    if (authError || !userData.user) {
      return { success: false, error: "Not authenticated" };
    }

    const userId = userData.user.id;
    const userEmail = userData.user.email;
    const { completionPercent, missingFields } = calculateCompletion(data);
    const isComplete = missingFields.length === 0;

    const { error: dbError } = await insforge.database
      .from("profiles")
      .upsert({
        id: userId,
        email: userEmail,
        full_name: data.full_name || null,
        phone: data.phone || null,
        location: data.location || null,
        linkedin_url: data.linkedin_url || null,
        portfolio_url: data.portfolio_url || null,
        work_authorization: data.work_authorization || null,
        current_title: data.current_title || null,
        experience_level: data.experience_level || null,
        years_experience: data.years_experience
          ? parseInt(data.years_experience, 10)
          : null,
        skills: data.skills,
        industries: data.industries,
        work_experience: data.work_experience,
        education:
          data.degree || data.institution
            ? {
                degree: data.degree,
                field: data.field,
                institution: data.institution,
                year: data.graduation_year
                  ? parseInt(data.graduation_year, 10)
                  : null,
              }
            : null,
        job_titles_seeking: data.job_titles_seeking,
        remote_preference: data.remote_preference || null,
        salary_expectation: data.salary_expectation || null,
        preferred_locations: data.preferred_locations,
        cover_letter_tone: data.cover_letter_tone || null,
        resume_pdf_url: data.resume_pdf_url,
        is_complete: isComplete,
        updated_at: new Date().toISOString(),
      });

    if (dbError) {
      console.error("[actions/profile] DB update error:", dbError);
      return { success: false, error: "Failed to save profile" };
    }

    revalidatePath("/profile");
    return { success: true, completionPercent };
  } catch (error) {
    console.error("[actions/profile]", error);
    return { success: false, error: "Failed to save profile" };
  }
}
