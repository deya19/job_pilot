import Image from "next/image";

export function TestimonialSection() {
  return (
    <section className="relative overflow-hidden bg-background px-6 py-12 md:py-16">
      <div className="absolute inset-0 opacity-60 bg-[radial-gradient(circle,var(--color-border)_1px,transparent_1px)] bg-size-[10px_10px]" />
      <div className="relative mx-auto max-w-4xl text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          Success story
        </span>
        <blockquote className="mx-auto mt-6 max-w-3xl text-[22px] font-medium leading-9 tracking-[-0.02em] text-text-primary md:text-[28px] md:leading-[1.45]">
          “I used to spend my evenings copying applications into ten
          different tabs. Now JobPilot keeps everything organized, surfaces
          the best matches, and helps me walk into interviews already
          prepared.”
        </blockquote>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Image
            src="/images/user-icon.png"
            alt="Satisfied JobPilot user"
            width={56}
            height={56}
            className="h-14 w-14 rounded-full border border-border object-cover"
          />
          <div className="text-left">
            <p className="text-sm font-semibold leading-5 text-text-primary">
              James Valdez
            </p>
            <p className="text-sm font-medium leading-5 text-text-secondary">
              Product designer
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
