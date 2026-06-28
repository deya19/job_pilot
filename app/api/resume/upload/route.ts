import { NextRequest, NextResponse } from "next/server";

import { createInsforgeServer } from "@/lib/insforge-server";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

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

    // Delete old resume file if one exists
    const { data: profile } = await insforge.database
      .from("profiles")
      .select("resume_pdf_url")
      .eq("id", userId)
      .single();

    if (profile?.resume_pdf_url) {
      const oldKey = (() => {
        try {
          const url = new URL(profile.resume_pdf_url as string);
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

    const formData = await req.formData();
    const file = formData.get("file");
    const rawName = formData.get("fileName");
    const fileName = typeof rawName === "string" && rawName.trim()
      ? rawName.trim()
      : file instanceof File ? file.name : "resume.pdf";

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 },
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { success: false, error: "Only PDF files are accepted" },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: "File exceeds 10MB limit" },
        { status: 400 },
      );
    }

    const blob = new Blob([await file.arrayBuffer()], {
      type: "application/pdf",
    });

    const { data: uploadData, error: uploadError } = await insforge.storage
      .from("resumes")
      .upload(`resumes/${userId}/${fileName}`, blob);

    if (uploadError || !uploadData) {
      console.error("[api/resume/upload] Storage error:", uploadError);
      return NextResponse.json(
        { success: false, error: "Failed to upload file" },
        { status: 500 },
      );
    }

    // Save resume_pdf_url to profiles table
    await insforge.database
      .from("profiles")
      .update({ resume_pdf_url: uploadData.url, updated_at: new Date().toISOString() })
      .eq("id", userId);

    return NextResponse.json({ success: true, url: uploadData.url, fileName });
  } catch (error) {
    console.error("[api/resume/upload]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
