import type { CookieOptions, CookieStore } from "@insforge/sdk/ssr";
import { updateSession } from "@insforge/sdk/ssr";
import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/dashboard", "/profile", "/find-jobs"];

function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

function createRequestCookieStore(request: NextRequest): CookieStore {
  return {
    get: (name: string) => request.cookies.get(name),
  };
}

function createResponseCookieStore(response: NextResponse): CookieStore {
  function setCookie(
    name: string,
    value: string,
    options?: CookieOptions,
  ): unknown;
  function setCookie(
    options: { name: string; value: string } & CookieOptions,
  ): unknown;
  function setCookie(
    nameOrOptions: string | ({ name: string; value: string } & CookieOptions),
    value?: string,
    options?: CookieOptions,
  ): unknown {
    if (typeof nameOrOptions === "string") {
      response.cookies.set({
        name: nameOrOptions,
        value: value ?? "",
        ...(options ?? {}),
      });
      return;
    }

    response.cookies.set(nameOrOptions);
  }

  function deleteCookie(name: string): unknown;
  function deleteCookie(options: { name: string } & CookieOptions): unknown;
  function deleteCookie(
    nameOrOptions: string | ({ name: string } & CookieOptions),
  ): unknown {
    if (typeof nameOrOptions === "string") {
      response.cookies.delete(nameOrOptions);
      return;
    }

    response.cookies.delete(nameOrOptions.name);
  }

  return {
    get: (name: string) => response.cookies.get(name),
    set: setCookie,
    delete: deleteCookie,
  };
}

export default async function proxy(request: NextRequest): Promise<NextResponse> {
  const pathname = request.nextUrl.pathname;
  const response = NextResponse.next();

  console.log("[proxy] pathname:", pathname, "protected?", isProtectedRoute(pathname));

  if (!isProtectedRoute(pathname)) {
    return response;
  }

  const { accessToken, refreshed, error } = await updateSession({
    requestCookies: createRequestCookieStore(request),
    responseCookies: createResponseCookieStore(response),
  });

  console.log("[proxy] updateSession result:", { accessToken: accessToken ? "present" : "MISSING", refreshed, error: error?.message ?? null });

  if (accessToken) {
    return response;
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set(
    "redirectTo",
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  );

  console.log("[proxy] redirecting to:", loginUrl.toString());
  return NextResponse.redirect(loginUrl);
}

