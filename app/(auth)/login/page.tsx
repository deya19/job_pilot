"use client";

import { Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { insforge } from "@/lib/insforge-client";

type OAuthProvider = "google" | "github";

function getRedirectPath(): string {
  const searchParams = new URLSearchParams(window.location.search);
  const redirectTo = searchParams.get("redirectTo");

  if (redirectTo?.startsWith("/")) {
    return redirectTo;
  }

  return "/dashboard";
}

export default function LoginPage() {
  const router = useRouter();
  const [pendingProvider, setPendingProvider] = useState<OAuthProvider | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const redirectAuthenticatedUser = async (): Promise<void> => {
      console.log("[login] checking existing session...");
      const { data } = await insforge.auth.getCurrentUser();
      console.log("[login] getCurrentUser:", data.user ? "user exists" : "no user");

      if (isMounted && data.user) {
        router.replace("/dashboard");
      }
    };

    void redirectAuthenticatedUser();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleOAuthSignIn = async (provider: OAuthProvider): Promise<void> => {
    setError(null);
    setPendingProvider(provider);

    const callbackUrl = new URL("/callback", window.location.origin);
    callbackUrl.searchParams.set("redirectTo", getRedirectPath());

    const { data, error: signInError } = await insforge.auth.signInWithOAuth(
      provider,
      {
        redirectTo: callbackUrl.toString(),
        additionalParams:
          provider === "google" ? { prompt: "select_account" } : undefined,
        skipBrowserRedirect: true,
      },
    );

    console.log("[login] signInWithOAuth result:", { url: data.url, hasCodeVerifier: !!data.codeVerifier });

    if (signInError || !data.url) {
      console.error("[login] signInWithOAuth failed:", signInError);
      setPendingProvider(null);
      setError("Could not start sign in. Please try again.");
      return;
    }

    console.log("[login] redirecting to OAuth URL:", data.url);
    window.location.href = data.url;
  };

  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-80px)] max-w-360 items-center justify-center">
        <section className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <div className="mb-8 flex justify-center">
            <Link href="/">
              <Image
                src="/logo.png"
                alt="JobPilot"
                width={128}
                height={36}
                className="h-9 w-auto"
                priority
              />
            </Link>
          </div>

          <div className="mb-8 text-center">
            <p className="mb-2 text-sm font-medium uppercase tracking-[0.18em] text-accent">
              Welcome back
            </p>
            <h1 className="text-3xl font-semibold tracking-[-0.03em] text-text-primary">
              Continue to JobPilot
            </h1>
            <p className="mt-3 text-sm font-medium leading-5 text-text-secondary">
              Sign in with Google or GitHub to manage your job search.
            </p>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => void handleOAuthSignIn("google")}
              disabled={pendingProvider !== null}
              className="flex w-full items-center justify-center gap-3 rounded-md border border-border bg-surface px-4 py-3 text-sm font-medium text-text-primary transition-colors hover:bg-surface-secondary disabled:cursor-not-allowed disabled:opacity-70"
            >
              {pendingProvider === "google" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <span className="flex size-5 items-center justify-center rounded-full border border-border text-sm font-semibold text-accent">
                  G
                </span>
              )}
              Continue with Google
            </button>

            <button
              type="button"
              onClick={() => void handleOAuthSignIn("github")}
              disabled={pendingProvider !== null}
              className="flex w-full items-center justify-center gap-3 rounded-md bg-overlay px-4 py-3 text-sm font-medium text-surface transition-colors hover:bg-overlay-dark disabled:cursor-not-allowed disabled:opacity-70"
            >
              {pendingProvider === "github" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <span className="text-sm font-semibold">GH</span>
              )}
              Continue with GitHub
            </button>
          </div>

          {error ? (
            <p className="mt-4 rounded-md bg-surface-secondary px-3 py-2 text-sm font-medium text-error">
              {error}
            </p>
          ) : null}

          <p className="mt-6 text-center text-xs leading-4 text-text-muted">
            By continuing, you agree to use JobPilot to organize your own job
            search workflow.
          </p>
        </section>
      </div>
    </main>
  );
}
