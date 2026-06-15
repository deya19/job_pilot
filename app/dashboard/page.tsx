import Link from "next/link";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto flex max-w-360 flex-1 px-6 py-8">
        <section className="w-full rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.18em] text-accent">
            Dashboard
          </p>
          <h1 className="text-3xl font-semibold tracking-[-0.03em] text-text-primary">
            You&apos;re signed in
          </h1>
          <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-text-secondary">
            Auth is ready. The full dashboard UI will be built in Phase 5 after
            profile, job discovery, and analytics data are available.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/profile"
              className="inline-flex items-center justify-center rounded-md bg-overlay px-4 py-2 text-sm font-medium text-surface transition-colors hover:bg-overlay-dark"
            >
              Set up profile
            </Link>
            <Link
              href="/find-jobs"
              className="inline-flex items-center justify-center rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-surface-secondary"
            >
              Find jobs
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
