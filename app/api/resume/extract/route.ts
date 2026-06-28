import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { toFile } from "openai/uploads";

import { createInsforgeServer } from "@/lib/insforge-server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are a resume parsing assistant. Extract structured profile data from the provided resume PDF and return it as a JSON object.

Extract the following fields:
- full_name: Person's full name
- phone: Phone number (if found)
- location: City, State/Country (if found)
- linkedin_url: LinkedIn URL (if found)
- portfolio_url: Portfolio, GitHub, or personal website URL (if found)
- work_authorization: One of "citizen", "permanent_resident", "visa_required", or empty string if unknown
- current_title: Current job title
- experience_level: One of "junior", "mid", "senior", "lead", or empty string if unknown
- years_experience: Number of years of experience as a string, or empty string if unknown
- skills: Array of technical and professional skills (max 15)
- industries: Array of industries (max 5)
- work_experience: Array of work experiences (max 3), each with:
  - company: Company name
  - title: Job title
  - startDate: Start date (YYYY-MM format or similar)
  - endDate: End date (YYYY-MM format, "Present", or similar)
  - isCurrent: boolean indicating if currently working there
  - responsibilities: Brief description of role
- degree: Highest education degree (e.g., "Bachelor's", "Master's", "PhD")
- field: Field of study
- institution: School/university name
- graduation_year: Graduation year as 4-digit string
- job_titles_seeking: Array of job titles the person is seeking (max 3)
- remote_preference: One of "remote", "onsite", "hybrid", "any", or empty string
- salary_expectation: Salary expectation if mentioned (as string)
- preferred_locations: Array of preferred work locations (max 5)
- cover_letter_tone: One of "formal", "casual", "enthusiastic", or empty string

Return ONLY valid JSON with these exact field names. Use empty strings for unknown values and empty arrays for missing lists.`;

export async function POST(req: NextRequest) {
  try {
    const insforge = await createInsforgeServer();
    const { data: userData, error: authError } =
      await insforge.auth.getCurrentUser();

    if (authError || !userData.user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 },
      );
    }

    const userId = userData.user.id;
    const body = (await req.json()) as { resumeUrl?: string };
    const { resumeUrl } = body;

    if (!resumeUrl) {
      return NextResponse.json(
        { success: false, error: "No resume URL provided" },
        { status: 400 },
      );
    }

    const storagePath = (() => {
      try {
        const url = new URL(resumeUrl);
        const parts = url.pathname.split("/objects/");
        return parts.length > 1 ? decodeURIComponent(parts[1]) : `resumes/${userId}/resume.pdf`;
      } catch {
        return `resumes/${userId}/resume.pdf`;
      }
    })();
    const { data: downloadData, error: downloadError } = await insforge.storage
      .from("resumes")
      .download(storagePath);

    if (downloadError || !downloadData) {
      console.error("[api/resume/extract] Download error:", downloadError);
      return NextResponse.json(
        { success: false, error: "Failed to download resume file" },
        { status: 500 },
      );
    }

    // Upload PDF to OpenAI Files API then call Responses API for native PDF reading
    const arrayBuffer = await downloadData.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadedFile = await openai.files.create({
      file: await toFile(buffer, "resume.pdf", { type: "application/pdf" }),
      purpose: "user_data",
    });

    let responseText: string | null = null;
    try {
      const response = await openai.responses.create({
        model: "gpt-4o",
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_file",
                file_id: uploadedFile.id,
              },
              {
                type: "input_text",
                text: SYSTEM_PROMPT,
              },
            ],
          },
        ],
        text: {
          format: {
            type: "json_object",
          },
        },
      });
      responseText = response.output_text;
    } finally {
      await openai.files.delete(uploadedFile.id).catch(() => {});
    }

    if (!responseText) {
      return NextResponse.json(
        { success: false, error: "Failed to extract profile data" },
        { status: 500 },
      );
    }

    let extractedData: Record<string, unknown>;
    try {
      extractedData = JSON.parse(responseText) as Record<string, unknown>;
    } catch {
      return NextResponse.json(
        { success: false, error: "Failed to parse extracted data" },
        { status: 500 },
      );
    }

    // Validate and normalize extracted data
    const normalizedData = {
      full_name: String(extractedData.full_name ?? ""),
      phone: String(extractedData.phone ?? ""),
      location: String(extractedData.location ?? ""),
      linkedin_url: String(extractedData.linkedin_url ?? ""),
      portfolio_url: String(extractedData.portfolio_url ?? ""),
      work_authorization: String(extractedData.work_authorization ?? ""),
      current_title: String(extractedData.current_title ?? ""),
      experience_level: String(extractedData.experience_level ?? ""),
      years_experience: String(extractedData.years_experience ?? ""),
      skills: Array.isArray(extractedData.skills) ? extractedData.skills.slice(0, 15).map(String) : [],
      industries: Array.isArray(extractedData.industries) ? extractedData.industries.slice(0, 5).map(String) : [],
      work_experience: Array.isArray(extractedData.work_experience)
        ? extractedData.work_experience.slice(0, 3).map((exp: unknown) => ({
            company: String((exp as Record<string, unknown>)?.company ?? ""),
            title: String((exp as Record<string, unknown>)?.title ?? ""),
            startDate: String((exp as Record<string, unknown>)?.startDate ?? ""),
            endDate: String((exp as Record<string, unknown>)?.endDate ?? ""),
            isCurrent: Boolean((exp as Record<string, unknown>)?.isCurrent ?? false),
            responsibilities: String((exp as Record<string, unknown>)?.responsibilities ?? ""),
          }))
        : [],
      degree: String(extractedData.degree ?? ""),
      field: String(extractedData.field ?? ""),
      institution: String(extractedData.institution ?? ""),
      graduation_year: String(extractedData.graduation_year ?? ""),
      job_titles_seeking: Array.isArray(extractedData.job_titles_seeking)
        ? extractedData.job_titles_seeking.slice(0, 3).map(String)
        : [],
      remote_preference: String(extractedData.remote_preference ?? ""),
      salary_expectation: String(extractedData.salary_expectation ?? ""),
      preferred_locations: Array.isArray(extractedData.preferred_locations)
        ? extractedData.preferred_locations.slice(0, 5).map(String)
        : [],
      cover_letter_tone: String(extractedData.cover_letter_tone ?? ""),
    };

    return NextResponse.json({
      success: true,
      extracted: normalizedData,
    });
  } catch (error) {
    console.error("[api/resume/extract] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
