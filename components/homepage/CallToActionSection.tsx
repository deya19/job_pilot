import Link from "next/link";

export function CallToActionSection() {
  return (
    <section className="px-6 py-12 md:py-16">
      <div className="mx-auto max-w-360">
        <div className="relative overflow-hidden border border-border/60 bg-surface-secondary px-6 py-12 text-center shadow-sm md:px-12 md:py-16">
          <div className="absolute -left-10 top-0 h-40 w-40 rounded-full bg-accent-light opacity-80 blur-3xl" />
          <div className="absolute -right-8 top-0 h-40 w-40 rounded-full bg-info-light opacity-90 blur-3xl" />
          <div className="absolute inset-x-0 bottom-0 h-20 bg-linear-to-b from-surface/0 to-surface/70" />
          <div className="relative">
          <h2 className="mx-auto max-w-3xl text-[34px] font-semibold leading-[1.08] tracking-[-0.03em] text-text-primary md:text-[48px]">
            Your next job search can feel a lot less overwhelming
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm font-medium leading-6 text-text-secondary md:text-base">
            Discover better opportunities, understand where you stand, and
            prepare smarter with JobPilot.
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/login"
              className="inline-flex min-w-34 items-center justify-center rounded-md bg-overlay px-4 py-2 text-sm font-medium leading-5 text-surface transition-colors hover:bg-overlay-dark"
            >
              Get started
            </Link>
            <Link
              href="/find-jobs"
              className="inline-flex min-w-40 items-center justify-center rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium leading-5 text-text-primary transition-colors hover:bg-surface-secondary"
            >
              Find your first match
            </Link>
          </div>
          </div>
        </div>
      </div>
    </section>
  );
}
