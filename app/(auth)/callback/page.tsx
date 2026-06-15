"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { insforge } from "@/lib/insforge-client";

function getSafeRedirectPath(value: string | null): string {
  if (value?.startsWith("/")) {
    return value;
  }

  return "/dashboard";
}

export default function CallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const finishSignIn = async (): Promise<void> => {
      const searchParams = new URLSearchParams(window.location.search);
      const code = searchParams.get("insforge_code");
      const redirectTo = getSafeRedirectPath(searchParams.get("redirectTo"));

      console.log("[callback] URL params:", { code: code ? "present" : "missing", redirectTo });

      // getCurrentUser waits for the SDK's auto-detect to finish (it consumes
      // insforge_code during import, so we can't manually exchange here).
      console.log("[callback] calling getCurrentUser (waits for auto-detect)...");
      const { data, error: authError } = await insforge.auth.getCurrentUser();
      console.log("[callback] getCurrentUser result:", { hasUser: !!data.user, error: authError?.message ?? null });

      if (!isMounted) {
        return;
      }

      if (authError || !data.user) {
        setError("Could not complete sign in. Please try again.");
        return;
      }

      // Auto-detect succeeded in memory but cookies are on InsForge's domain.
      // Extract tokens from the SDK's tokenManager and write them to our
      // localhost cookies via the session endpoint.
      const tokenManager = (
        insforge.auth as unknown as {
          tokenManager?: {
            getSession: () => {
              accessToken?: string;
              refreshToken?: string;
            } | null;
          };
        }
      ).tokenManager;

      const session = tokenManager?.getSession?.() ?? null;
      console.log("[callback] tokenManager session:", {
        hasAccessToken: !!session?.accessToken,
        hasRefreshToken: !!session?.refreshToken,
      });

      if (session?.accessToken) {
        const res = await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            accessToken: session.accessToken,
            refreshToken: session.refreshToken ?? null,
          }),
        });
        console.log("[callback] cookie POST status:", res.status);

        if (!res.ok) {
          setError("Could not secure your session. Please try again.");
          return;
        }
      } else {
        console.warn("[callback] no access token in tokenManager — proxy will redirect back to login");
        setError("Could not complete sign in. Please try again.");
        return;
      }

      console.log("[callback] redirecting to:", redirectTo);
      router.replace(redirectTo);
    };

    void finishSignIn();

    return () => {
      isMounted = false;
    };
  }, [router]);

  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-80px)] max-w-360 items-center justify-center">
        <section className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 text-center shadow-sm">
          {error ? (
            <>
              <h1 className="text-xl font-semibold text-text-primary">
                Sign in failed
              </h1>
              <p className="mt-3 text-sm font-medium leading-5 text-text-secondary">
                {error}
              </p>
              <button
                type="button"
                onClick={() => router.replace("/login")}
                className="mt-6 inline-flex items-center justify-center rounded-md bg-overlay px-4 py-2 text-sm font-medium text-surface transition-colors hover:bg-overlay-dark"
              >
                Back to login
              </button>
            </>
          ) : (
            <>
              <Loader2 className="mx-auto size-6 animate-spin text-accent" />
              <h1 className="mt-4 text-xl font-semibold text-text-primary">
                Completing sign in
              </h1>
              <p className="mt-3 text-sm font-medium leading-5 text-text-secondary">
                Hang tight while JobPilot secures your session.
              </p>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
