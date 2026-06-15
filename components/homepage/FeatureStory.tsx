import Image from "next/image";

type FeatureStoryProps = {
  eyebrow: string;
  title: string;
  paragraphs: string[];
  bulletPoints?: string[];
  imageSrc: string;
  imageAlt: string;
  imageLeft?: boolean;
};

export function FeatureStory({
  eyebrow,
  title,
  paragraphs,
  bulletPoints,
  imageSrc,
  imageAlt,
  imageLeft = false,
}: FeatureStoryProps) {
  return (
    <section className="relative overflow-hidden bg-background px-6 py-10 md:py-14">
      <div className="absolute inset-0 opacity-60 bg-[radial-gradient(circle,var(--color-border)_1px,transparent_1px)] bg-size-[10px_10px]" />
      <div className="relative mx-auto grid max-w-360 items-center gap-10 md:grid-cols-2 md:gap-12">
        <div className={imageLeft ? "md:order-2" : ""}>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            {eyebrow}
          </span>
          <h2 className="mt-4 max-w-md text-[34px] font-semibold leading-[1.08] tracking-[-0.03em] text-text-primary md:text-[44px]">
            {title}
          </h2>
          <div className="mt-6 space-y-4 text-sm font-medium leading-6 text-text-secondary md:text-base">
            {paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          {bulletPoints ? (
            <ul className="mt-6 space-y-3 text-sm font-medium leading-6 text-text-primary md:text-base">
              {bulletPoints.map((bulletPoint) => (
                <li key={bulletPoint} className="flex items-start gap-3">
                  <span className="mt-2 h-2 w-2 rounded-full bg-accent" />
                  <span>{bulletPoint}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <div className={imageLeft ? "md:order-1" : ""}>
          <div className="overflow-hidden rounded-[26px] border border-border bg-surface shadow-sm">
            <Image
              src={imageSrc}
              alt={imageAlt}
              width={900}
              height={700}
              className="h-auto w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
