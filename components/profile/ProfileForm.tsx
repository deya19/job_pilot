"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";

import { saveProfile } from "@/actions/profile";
import type {
  CoverLetterTone,
  Education,
  ExperienceLevel,
  Profile,
  RemotePreference,
  WorkAuthorization,
  WorkExperience,
} from "@/types";

import { ResumeSection } from "./ResumeSection";
import { TagInput } from "./TagInput";
import { WorkExperienceSection } from "./WorkExperienceSection";

type SaveStatus = "idle" | "saving" | "success" | "error";

type FormState = {
  full_name: string;
  email: string;
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

type Props = {
  profile: Profile | null;
};

function profileToFormState(profile: Profile | null, email: string): FormState {
  const edu = profile?.education as Education | null;
  return {
    full_name: profile?.full_name ?? "",
    email: profile?.email ?? email,
    phone: profile?.phone ?? "",
    location: profile?.location ?? "",
    linkedin_url: profile?.linkedin_url ?? "",
    portfolio_url: profile?.portfolio_url ?? "",
    work_authorization: (profile?.work_authorization as WorkAuthorization) ?? "",
    current_title: profile?.current_title ?? "",
    experience_level: (profile?.experience_level as ExperienceLevel) ?? "",
    years_experience: profile?.years_experience?.toString() ?? "",
    skills: profile?.skills ?? [],
    industries: profile?.industries ?? [],
    work_experience: (profile?.work_experience as WorkExperience[]) ?? [],
    degree: edu?.degree ?? "",
    field: edu?.field ?? "",
    institution: edu?.institution ?? "",
    graduation_year: edu?.year?.toString() ?? "",
    job_titles_seeking: profile?.job_titles_seeking ?? [],
    remote_preference: (profile?.remote_preference as RemotePreference) ?? "",
    salary_expectation: profile?.salary_expectation ?? "",
    preferred_locations: profile?.preferred_locations ?? [],
    cover_letter_tone: (profile?.cover_letter_tone as CoverLetterTone) ?? "",
    resume_pdf_url: profile?.resume_pdf_url ?? null,
  };
}

export function ProfileForm({ profile }: Props) {
  const [form, setForm] = useState<FormState>(() =>
    profileToFormState(profile, profile?.email ?? ""),
  );
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [extractSuccess, setExtractSuccess] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [generateSuccess, setGenerateSuccess] = useState(false);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]): void => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleUpload = (url: string): void => {
    set("resume_pdf_url", url);
  };

  const handleExtract = async (): Promise<void> => {
    if (!form.resume_pdf_url) return;
    setIsExtracting(true);
    setExtractError(null);
    setExtractSuccess(false);

    try {
      const res = await fetch("/api/resume/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeUrl: form.resume_pdf_url }),
      });

      const data = (await res.json()) as {
        success: boolean;
        extracted?: Record<string, unknown>;
        error?: string;
      };

      if (!res.ok || !data.success) {
        setExtractError(data.error ?? "Failed to extract profile data");
        setIsExtracting(false);
        return;
      }

      // Merge extracted data into form state
      if (data.extracted) {
        setForm((prev) => ({
          ...prev,
          full_name: (data.extracted?.full_name as string) || prev.full_name,
          phone: (data.extracted?.phone as string) || prev.phone,
          location: (data.extracted?.location as string) || prev.location,
          linkedin_url: (data.extracted?.linkedin_url as string) || prev.linkedin_url,
          portfolio_url: (data.extracted?.portfolio_url as string) || prev.portfolio_url,
          work_authorization: (data.extracted?.work_authorization as WorkAuthorization | "") || prev.work_authorization,
          current_title: (data.extracted?.current_title as string) || prev.current_title,
          experience_level: (data.extracted?.experience_level as ExperienceLevel | "") || prev.experience_level,
          years_experience: (data.extracted?.years_experience as string) || prev.years_experience,
          skills: (data.extracted?.skills as string[])?.length
            ? (data.extracted?.skills as string[])
            : prev.skills,
          industries: (data.extracted?.industries as string[])?.length
            ? (data.extracted?.industries as string[])
            : prev.industries,
          work_experience: (data.extracted?.work_experience as WorkExperience[])?.length
            ? (data.extracted?.work_experience as WorkExperience[])
            : prev.work_experience,
          degree: (data.extracted?.degree as string) || prev.degree,
          field: (data.extracted?.field as string) || prev.field,
          institution: (data.extracted?.institution as string) || prev.institution,
          graduation_year: (data.extracted?.graduation_year as string) || prev.graduation_year,
          job_titles_seeking: (data.extracted?.job_titles_seeking as string[])?.length
            ? (data.extracted?.job_titles_seeking as string[])
            : prev.job_titles_seeking,
          remote_preference: (data.extracted?.remote_preference as RemotePreference | "") || prev.remote_preference,
          salary_expectation: (data.extracted?.salary_expectation as string) || prev.salary_expectation,
          preferred_locations: (data.extracted?.preferred_locations as string[])?.length
            ? (data.extracted?.preferred_locations as string[])
            : prev.preferred_locations,
          cover_letter_tone: (data.extracted?.cover_letter_tone as CoverLetterTone | "") || prev.cover_letter_tone,
          email: prev.email, // preserve email
          resume_pdf_url: prev.resume_pdf_url, // preserve resume URL
        }));
        setExtractSuccess(true);
      }
    } catch {
      setExtractError("Failed to extract profile data. Please try again.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleGenerate = async (): Promise<void> => {
    setIsGenerating(true);
    setGenerateError(null);
    setGenerateSuccess(false);

    try {
      const res = await fetch("/api/resume/generate", { method: "POST" });
      const data = (await res.json()) as { success: boolean; url?: string; error?: string };

      if (!res.ok || !data.success) {
        setGenerateError(data.error ?? "Failed to generate resume");
        setIsGenerating(false);
        return;
      }

      if (data.url) {
        set("resume_pdf_url", data.url);
      }
      setGenerateSuccess(true);
    } catch {
      setGenerateError("Failed to generate resume. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setSaveStatus("saving");
    setSaveError(null);

    const result = await saveProfile(form);

    if (result.success) {
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } else {
      setSaveStatus("error");
      setSaveError(result.error ?? "Failed to save profile");
    }
  };

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="rounded-2xl border border-border bg-surface shadow-sm">
      <div className="p-6">
        <h2 className="text-base font-semibold text-text-primary">
          Profile Information
        </h2>
        <p className="mt-1 text-xs text-text-secondary">
          Complete all sections to improve your profile and increase your
          matches with better-fit roles.
        </p>
      </div>

      <div className="h-px bg-border" />

      {/* Resume */}
      <div className="p-6">
        <ResumeSection
          existingUrl={form.resume_pdf_url}
          onUpload={handleUpload}
          onExtract={handleExtract}
          isExtracting={isExtracting}
          extractError={extractError}
          extractSuccess={extractSuccess}
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
          generateError={generateError}
          generateSuccess={generateSuccess}
        />
      </div>

      <div className="h-px bg-border" />

      {/* Personal Info */}
      <div className="p-6">
        <h3 className="mb-4 text-sm font-semibold text-text-primary">
          Personal Info
        </h3>
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                Full Name
              </label>
              <input
                type="text"
                value={form.full_name}
                onChange={(e) => set("full_name", e.target.value)}
                placeholder="Your full name"
                className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                readOnly
                className="rounded-md border border-border bg-surface-secondary px-3 py-2 text-sm text-text-muted"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                Phone Number
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                Location
              </label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
                placeholder="City, State"
                className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                LinkedIn URL
              </label>
              <input
                type="url"
                value={form.linkedin_url}
                onChange={(e) => set("linkedin_url", e.target.value)}
                placeholder="https://linkedin.com/in/yourprofile"
                className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                Portfolio / GitHub
              </label>
              <input
                type="url"
                value={form.portfolio_url}
                onChange={(e) => set("portfolio_url", e.target.value)}
                placeholder="https://github.com/yourprofile"
                className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                Work Authorization
              </label>
              <select
                value={form.work_authorization}
                onChange={(e) =>
                  set("work_authorization", e.target.value as WorkAuthorization | "")
                }
                className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option value="">Select...</option>
                <option value="citizen">Citizen</option>
                <option value="permanent_resident">Permanent Resident</option>
                <option value="visa_required">Visa Required</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="h-px bg-border" />

      {/* Professional Info */}
      <div className="p-6">
        <h3 className="mb-4 text-sm font-semibold text-text-primary">
          Professional Info
        </h3>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium uppercase tracking-wide text-text-secondary">
              Current Job Title
            </label>
            <input
              type="text"
              value={form.current_title}
              onChange={(e) => set("current_title", e.target.value)}
              placeholder="Product Designer"
              className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                Experience Level
              </label>
              <select
                value={form.experience_level}
                onChange={(e) =>
                  set("experience_level", e.target.value as ExperienceLevel | "")
                }
                className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option value="">Select...</option>
                <option value="junior">Junior</option>
                <option value="mid">Mid</option>
                <option value="senior">Senior</option>
                <option value="lead">Lead</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                Years of Experience
              </label>
              <input
                type="number"
                min="0"
                max="50"
                value={form.years_experience}
                onChange={(e) => set("years_experience", e.target.value)}
                placeholder="4"
                className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium uppercase tracking-wide text-text-secondary">
              Skills
            </label>
            <TagInput
              tags={form.skills}
              onChange={(tags) => set("skills", tags)}
              placeholder="Add a skill..."
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium uppercase tracking-wide text-text-secondary">
              Industries of Interest
            </label>
            <TagInput
              tags={form.industries}
              onChange={(tags) => set("industries", tags)}
              placeholder="Add an industry..."
            />
          </div>
        </div>
      </div>

      <div className="h-px bg-border" />

      {/* Work Experience */}
      <div className="p-6">
        <WorkExperienceSection
          experiences={form.work_experience}
          onChange={(experiences) => set("work_experience", experiences)}
        />
      </div>

      <div className="h-px bg-border" />

      {/* Education */}
      <div className="p-6">
        <h3 className="mb-4 text-sm font-semibold text-text-primary">
          Education
        </h3>
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                Highest Degree
              </label>
              <select
                value={form.degree}
                onChange={(e) => set("degree", e.target.value)}
                className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option value="">Select...</option>
                <option value="High School">High School</option>
                <option value="Associate's">Associate&apos;s</option>
                <option value="Bachelor's">Bachelor&apos;s</option>
                <option value="Master's">Master&apos;s</option>
                <option value="PhD">PhD</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                Field of Study
              </label>
              <input
                type="text"
                value={form.field}
                onChange={(e) => set("field", e.target.value)}
                placeholder="Computer Science"
                className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                Institution Name
              </label>
              <input
                type="text"
                value={form.institution}
                onChange={(e) => set("institution", e.target.value)}
                placeholder="City State University"
                className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                Graduation Year
              </label>
              <input
                type="text"
                value={form.graduation_year}
                onChange={(e) => set("graduation_year", e.target.value)}
                placeholder="YYYY"
                maxLength={4}
                className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="h-px bg-border" />

      {/* Job Preferences */}
      <div className="p-6">
        <h3 className="mb-4 text-sm font-semibold text-text-primary">
          Job Preferences
        </h3>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium uppercase tracking-wide text-text-secondary">
              Job Titles Seeking
            </label>
            <TagInput
              tags={form.job_titles_seeking}
              onChange={(tags) => set("job_titles_seeking", tags)}
              placeholder="Add a job title..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                Remote Preference
              </label>
              <select
                value={form.remote_preference}
                onChange={(e) =>
                  set("remote_preference", e.target.value as RemotePreference | "")
                }
                className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option value="">Select...</option>
                <option value="remote">Remote</option>
                <option value="onsite">On-site</option>
                <option value="hybrid">Hybrid</option>
                <option value="any">Any</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                Salary Expectation
              </label>
              <input
                type="text"
                value={form.salary_expectation}
                onChange={(e) => set("salary_expectation", e.target.value)}
                placeholder="e.g. $120,000/yr"
                className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium uppercase tracking-wide text-text-secondary">
              Preferred Locations
            </label>
            <TagInput
              tags={form.preferred_locations}
              onChange={(tags) => set("preferred_locations", tags)}
              placeholder="Add a location..."
            />
          </div>
        </div>
      </div>

      <div className="h-px bg-border" />

      {/* Save button */}
      <div className="p-6 flex flex-col gap-3">
        {saveStatus === "error" && saveError && (
          <p className="text-center text-xs text-error">{saveError}</p>
        )}
        <button
          type="submit"
          disabled={saveStatus === "saving"}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent py-3 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-70"
        >
          {saveStatus === "saving" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : saveStatus === "success" ? (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Saved
            </>
          ) : (
            "Save Profile"
          )}
        </button>
      </div>
    </form>
  );
}
