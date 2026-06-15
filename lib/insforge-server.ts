import type { InsForgeClient } from "@insforge/sdk";
import { createServerClient } from "@insforge/sdk/ssr";
import { cookies } from "next/headers";

export async function createInsforgeServer(): Promise<InsForgeClient> {
  const cookieStore = await cookies();

  return createServerClient({
    cookies: {
      get: (name: string) => cookieStore.get(name),
    },
  });
}
