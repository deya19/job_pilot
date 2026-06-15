import { NextResponse } from "next/server";

import { setAuthCookies } from "@insforge/sdk/ssr";

import { createResponseCookieStore } from "@/lib/insforge-cookies";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) ?? {};
    const { accessToken, refreshToken } = body;

    console.log("[api/auth/session] received tokens:", {
      accessToken: typeof accessToken === "string" ? "present" : typeof accessToken,
      refreshToken: refreshToken === null ? "null" : typeof refreshToken === "string" ? "present" : typeof refreshToken,
    });

    if (typeof accessToken !== "string") {
      return NextResponse.json(
        { success: false, error: "Missing access token" },
        { status: 400 },
      );
    }

    const response = NextResponse.json({ success: true });
    setAuthCookies(createResponseCookieStore(response), {
      accessToken,
      refreshToken: typeof refreshToken === "string" ? refreshToken : undefined,
    });

    console.log("[api/auth/session] cookies set");
    return response;
  } catch (error) {
    console.error("[api/auth/session]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
