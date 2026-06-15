import Image from "next/image";

const preparationItems = [
  {
    title: "Understand your match score",
    description:
      "See why a role fits your background and where you might need stronger positioning before you apply.",
  },
  {
    title: "AI-powered company research",
    description:
      "Get quick context on a company’s product, culture, and stack so your application feels informed, not rushed.",
  },
  {
    title: "Interview talking points",
    description:
      "Walk into conversations knowing which parts of your experience to highlight and which gaps to address honestly.",
  },
];

export function PreparationSection() {
  return (
    <section className="bg-background px-6 py-12 md:py-16">
      <div className="mx-auto grid max-w-360 items-center gap-10 border-y border-border/70 py-12 md:grid-cols-2 md:gap-12">
        <div>
          <div className="overflow-hidden rounded-[26px] border border-border bg-surface shadow-sm">
            <Image
              src="/images/agnet-log.png"
              alt="JobPilot agent activity log preview"
              width={1024}
              height={790}
              className="h-auto w-full"
            />
          </div>
        </div>
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Preparation
          </span>
          <h2 className="mt-4 max-w-md text-[34px] font-semibold leading-[1.08] tracking-[-0.03em] text-text-primary md:text-[44px]">
            Apply With More Confidence, Every Time
          </h2>
          <div className="mt-6 divide-y divide-border border-y border-border/70 bg-surface/30">
            {preparationItems.map((item) => (
              <div key={item.title} className="py-5 first:pt-0 last:pb-0">
                <h3 className="text-base font-semibold leading-6 text-text-primary">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm font-medium leading-6 text-text-secondary md:text-base">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
