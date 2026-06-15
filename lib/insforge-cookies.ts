import type { CookieOptions, CookieStore } from "@insforge/sdk/ssr";
import type { NextRequest, NextResponse } from "next/server";

export function createRequestCookieStore(request: NextRequest): CookieStore {
  return {
    get: (name: string) => request.cookies.get(name),
  };
}

export function createResponseCookieStore(response: NextResponse): CookieStore {
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
