import Image from "next/image";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="px-6 pt-3 pb-10 md:pt-5 md:pb-14">
      <div className="mx-auto max-w-360">
        <div className="relative overflow-hidden border border-border/60 bg-surface-secondary px-6 py-12 text-center shadow-sm md:px-12 md:py-16">
          <div className="absolute -left-12 top-0 h-44 w-44 rounded-full bg-accent-light opacity-80 blur-3xl" />
          <div className="absolute -right-10 top-0 h-44 w-44 rounded-full bg-info-light opacity-90 blur-3xl" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-b from-surface/0 to-surface/70" />
          <div className="relative">
            <h1 className="mx-auto max-w-3xl text-[40px] font-semibold leading-[1.05] tracking-[-0.03em] text-text-primary md:text-[56px]">
              Job hunting is hard.
              <br />
              Your tools shouldn&apos;t be.
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm font-medium leading-6 text-text-secondary md:text-base">
              JobPilot helps you discover better roles, understand your fit,
              and prepare with confidence before you apply.
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
        <div className="relative -mt-3 rounded-[28px] border border-border bg-surface p-3 shadow-xl md:-mt-7 md:p-4">
          <div className="overflow-hidden rounded-3xl border border-border-light bg-surface-secondary">
            <Image
              src="/images/dashboard-demo.png"
              alt="Dashboard preview"
              width={1200}
              height={675}
              className="h-auto w-full"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
