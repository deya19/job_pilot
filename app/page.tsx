import { CallToActionSection } from "@/components/homepage/CallToActionSection";
import { FeatureStory } from "@/components/homepage/FeatureStory";
import { HeroSection } from "@/components/homepage/HeroSection";
import { PreparationSection } from "@/components/homepage/PreparationSection";
import { TestimonialSection } from "@/components/homepage/TestimonialSection";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

const searchFeatureParagraphs = [
  "Stop bouncing between tabs, spreadsheets, and saved searches. JobPilot keeps your search organized in one clear workflow.",
  "See the roles that are actually worth your time, compare match quality at a glance, and focus on the opportunities that move you forward.",
];

const searchFeatureBullets = [
  "Browse curated opportunities with clear match indicators.",
  "Compare salary ranges, sources, and job freshness in seconds.",
  "Keep your search momentum without losing track of promising roles.",
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <FeatureStory
          eyebrow="Organize your search"
          title="Manage Your Job Search With Ease"
          paragraphs={searchFeatureParagraphs}
          bulletPoints={searchFeatureBullets}
          imageSrc="/images/jobs-lists.png"
          imageAlt="Jobs list preview"
        />
        <PreparationSection />
        <TestimonialSection />
        <CallToActionSection />
      </main>
      <Footer />
    </div>
  );
}
