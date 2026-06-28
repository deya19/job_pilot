import { Document, DocumentProps, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import React from "react";

import { createInsforgeServer } from "@/lib/insforge-server";
import type { Education, Profile } from "@/types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type GeneratedContent = {
  summary: string;
  workExperience: {
    company: string;
    title: string;
    period: string;
    bullets: string[];
  }[];
  skills: string[];
  education: string;
};

const SYSTEM_PROMPT = `You are a professional resume writer. Given a candidate's raw profile data, produce polished resume content in JSON format.

Return ONLY valid JSON with this exact shape:
{
  "summary": "A 2-3 sentence professional summary paragraph. First person is fine. Highlight seniority, key skills, and career focus.",
  "workExperience": [
    {
      "company": "Company Name",
      "title": "Job Title",
      "period": "Jan 2022 – Present",
      "bullets": ["Achievement or responsibility 1", "Achievement or responsibility 2", "Achievement or responsibility 3"]
    }
  ],
  "skills": ["Skill 1", "Skill 2"],
  "education": "Degree, Field — Institution (Year)"
}

Rules:
- summary: concise, punchy, written for the candidate's target roles.
- workExperience bullets: action-verb led, specific, professional. Max 4 bullets per role. Use the provided responsibilities as raw material but polish them.
- skills: flat list from the candidate's skills array, max 15.
- education: single formatted string combining degree, field, institution, graduation year.
- If a field is missing, omit gracefully (empty array for missing lists, empty string for missing text).
- Return ONLY the JSON object. No markdown. No extra text.`;

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    paddingTop: 40,
    paddingBottom: 40,
    paddingLeft: 48,
    paddingRight: 48,
    color: "#111827",
    backgroundColor: "#ffffff",
  },
  name: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
    marginBottom: 2,
  },
  title: {
    fontSize: 11,
    color: "#6a7282",
    marginBottom: 6,
  },
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
    fontSize: 9,
    color: "#6a7282",
  },
  contactItem: {
    flexDirection: "row",
    gap: 2,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#e7eaf3",
    marginBottom: 12,
  },
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#7c5cfc",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#e7eaf3",
    paddingBottom: 3,
  },
  summaryText: {
    fontSize: 10,
    color: "#364153",
    lineHeight: 1.5,
  },
  jobBlock: {
    marginBottom: 10,
  },
  jobHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  jobTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
  },
  jobCompany: {
    fontSize: 10,
    color: "#364153",
  },
  jobPeriod: {
    fontSize: 9,
    color: "#6a7282",
  },
  bullet: {
    flexDirection: "row",
    marginBottom: 2,
    paddingLeft: 8,
  },
  bulletDot: {
    fontSize: 10,
    color: "#7c5cfc",
    marginRight: 4,
    marginTop: -1,
  },
  bulletText: {
    fontSize: 9.5,
    color: "#364153",
    lineHeight: 1.45,
    flex: 1,
  },
  skillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  skillBadge: {
    backgroundColor: "#faf5ff",
    borderWidth: 1,
    borderColor: "#e7eaf3",
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    fontSize: 9,
    color: "#364153",
  },
  educationText: {
    fontSize: 10,
    color: "#364153",
  },
});

function buildContactItems(profile: Profile): string[] {
  const items: string[] = [];
  if (profile.email) items.push(profile.email);
  if (profile.phone) items.push(profile.phone);
  if (profile.location) items.push(profile.location);
  if (profile.linkedin_url) {
    const clean = profile.linkedin_url.replace(/^https?:\/\//, "");
    items.push(clean);
  }
  if (profile.portfolio_url) {
    const clean = profile.portfolio_url.replace(/^https?:\/\//, "");
    items.push(clean);
  }
  return items;
}

function ResumeDocument({ profile, content }: { profile: Profile; content: GeneratedContent }) {
  const contactItems = buildContactItems(profile);
  const edu = profile.education as Education | null;

  return React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      { size: "A4", style: styles.page },

      // Header
      React.createElement(Text, { style: styles.name }, profile.full_name ?? ""),
      profile.current_title
        ? React.createElement(Text, { style: styles.title }, profile.current_title)
        : null,

      // Contact row
      contactItems.length > 0
        ? React.createElement(
            View,
            { style: styles.contactRow },
            ...contactItems.map((item, i) =>
              React.createElement(
                View,
                { key: String(i), style: styles.contactItem },
                React.createElement(Text, null, item),
              ),
            ),
          )
        : null,

      React.createElement(View, { style: styles.divider }),

      // Summary
      content.summary
        ? React.createElement(
            View,
            { style: styles.section },
            React.createElement(Text, { style: styles.sectionTitle }, "Summary"),
            React.createElement(Text, { style: styles.summaryText }, content.summary),
          )
        : null,

      // Work Experience
      content.workExperience.length > 0
        ? React.createElement(
            View,
            { style: styles.section },
            React.createElement(Text, { style: styles.sectionTitle }, "Experience"),
            ...content.workExperience.map((job, i) =>
              React.createElement(
                View,
                { key: String(i), style: styles.jobBlock },
                React.createElement(
                  View,
                  { style: styles.jobHeader },
                  React.createElement(
                    View,
                    null,
                    React.createElement(Text, { style: styles.jobTitle }, job.title),
                    React.createElement(Text, { style: styles.jobCompany }, job.company),
                  ),
                  React.createElement(Text, { style: styles.jobPeriod }, job.period),
                ),
                ...job.bullets.map((bullet, j) =>
                  React.createElement(
                    View,
                    { key: String(j), style: styles.bullet },
                    React.createElement(Text, { style: styles.bulletDot }, "•"),
                    React.createElement(Text, { style: styles.bulletText }, bullet),
                  ),
                ),
              ),
            ),
          )
        : null,

      // Skills
      content.skills.length > 0
        ? React.createElement(
            View,
            { style: styles.section },
            React.createElement(Text, { style: styles.sectionTitle }, "Skills"),
            React.createElement(
              View,
              { style: styles.skillsRow },
              ...content.skills.map((skill, i) =>
                React.createElement(Text, { key: String(i), style: styles.skillBadge }, skill),
              ),
            ),
          )
        : null,

      // Education
      (content.education || edu)
        ? React.createElement(
            View,
            { style: styles.section },
            React.createElement(Text, { style: styles.sectionTitle }, "Education"),
            React.createElement(
              Text,
              { style: styles.educationText },
              content.education ||
                [edu?.degree, edu?.field, edu?.institution, edu?.year]
                  .filter(Boolean)
                  .join(" — "),
            ),
          )
        : null,
    ),
  );
}

export async function POST(req: NextRequest) {
  // Silence unused req warning — required by Next.js route signature
  void req;

  try {
    const insforge = await createInsforgeServer();
    const { data: userData, error: authError } = await insforge.auth.getCurrentUser();

    if (authError || !userData.user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 },
      );
    }

    const userId = userData.user.id;

    // Fetch profile from DB
    const { data: profile, error: profileError } = await insforge.database
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { success: false, error: "Save your profile before generating a resume." },
        { status: 400 },
      );
    }

    const typedProfile = profile as Profile;

    // Build user message for GPT-4o
    const profilePayload = {
      full_name: typedProfile.full_name,
      current_title: typedProfile.current_title,
      experience_level: typedProfile.experience_level,
      years_experience: typedProfile.years_experience,
      skills: typedProfile.skills,
      industries: typedProfile.industries,
      work_experience: typedProfile.work_experience,
      education: typedProfile.education,
      job_titles_seeking: typedProfile.job_titles_seeking,
      location: typedProfile.location,
      remote_preference: typedProfile.remote_preference,
    };

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      temperature: 0.4,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Here is the candidate's profile data:\n\n${JSON.stringify(profilePayload, null, 2)}`,
        },
      ],
    });

    const rawContent = completion.choices[0]?.message?.content;
    if (!rawContent) {
      return NextResponse.json(
        { success: false, error: "Failed to generate resume content" },
        { status: 500 },
      );
    }

    let generatedContent: GeneratedContent;
    try {
      generatedContent = JSON.parse(rawContent) as GeneratedContent;
    } catch {
      return NextResponse.json(
        { success: false, error: "Failed to parse generated content" },
        { status: 500 },
      );
    }

    // Delete old resume file if one exists
    if (typedProfile.resume_pdf_url) {
      const oldKey = (() => {
        try {
          const url = new URL(typedProfile.resume_pdf_url);
          const parts = url.pathname.split("/objects/");
          return parts.length > 1 ? decodeURIComponent(parts[1]) : null;
        } catch {
          return null;
        }
      })();
      if (oldKey) {
        await insforge.storage.from("resumes").remove(oldKey);
      }
    }

    // Render PDF buffer
    const pdfBuffer = await renderToBuffer(
      React.createElement(ResumeDocument, { profile: typedProfile, content: generatedContent }) as React.ReactElement<DocumentProps>,
    );

    // Upload to InsForge Storage
    const storagePath = `resumes/${userId}/resume.pdf`;
    const arrayBuffer = pdfBuffer.buffer.slice(
      pdfBuffer.byteOffset,
      pdfBuffer.byteOffset + pdfBuffer.byteLength,
    ) as ArrayBuffer;
    const blob = new Blob([arrayBuffer], { type: "application/pdf" });

    const { data: uploadData, error: uploadError } = await insforge.storage
      .from("resumes")
      .upload(storagePath, blob);

    if (uploadError || !uploadData) {
      console.error("[api/resume/generate] Storage upload error:", uploadError);
      return NextResponse.json(
        { success: false, error: "Failed to upload generated resume" },
        { status: 500 },
      );
    }

    // Update profiles.resume_pdf_url
    const { error: dbError } = await insforge.database
      .from("profiles")
      .update({ resume_pdf_url: uploadData.url, updated_at: new Date().toISOString() })
      .eq("id", userId);

    if (dbError) {
      console.error("[api/resume/generate] DB update error:", dbError);
    }

    return NextResponse.json({ success: true, url: uploadData.url });
  } catch (error) {
    console.error("[api/resume/generate]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
