import { NextResponse } from "next/server";

import { createInsforgeServer } from "@/lib/insforge-server";

export async function GET() {
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

    // Fetch resume_pdf_url from profiles table
    const { data: profile, error: profileError } = await insforge.database
      .from("profiles")
      .select("resume_pdf_url")
      .eq("id", userId)
      .single();

    if (profileError || !profile?.resume_pdf_url) {
      return NextResponse.json(
        { success: false, error: "No resume found" },
        { status: 404 },
      );
    }

    // Derive storage key from URL — same pattern as extract route
    const storagePath = (() => {
      try {
        const url = new URL(profile.resume_pdf_url as string);
        const parts = url.pathname.split("/objects/");
        return parts.length > 1
          ? decodeURIComponent(parts[1])
          : `resumes/${userId}/resume.pdf`;
      } catch {
        return `resumes/${userId}/resume.pdf`;
      }
    })();

    const { data: blob, error: downloadError } = await insforge.storage
      .from("resumes")
      .download(storagePath);

    if (downloadError || !blob) {
      console.error("[api/resume/download] Download error:", downloadError);
      return NextResponse.json(
        { success: false, error: "Failed to download resume" },
        { status: 500 },
      );
    }

    const arrayBuffer = await blob.arrayBuffer();

    // Derive a filename for the Content-Disposition header
    const rawFileName = storagePath.split("/").pop() ?? "resume.pdf";
    const safeFileName = rawFileName.replace(/[^a-zA-Z0-9._-]/g, "_");

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeFileName}"`,
        "Content-Length": String(arrayBuffer.byteLength),
      },
    });
  } catch (error) {
    console.error("[api/resume/download]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
