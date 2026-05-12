import { LandingHeader } from "@/features/landing/LandingHeader";
import { LandingHero } from "@/features/landing/LandingHero";
import { LandingSkills } from "@/features/landing/LandingSkills";
import { LandingTryIt } from "@/features/landing/LandingTryIt";
import { LandingHowItWorks } from "@/features/landing/LandingHowItWorks";
import { LandingFooter } from "@/features/landing/LandingFooter";

export default function HomePage() {
  return (
    <>
      <LandingHeader />
      <main className="bg-surface-muted">
        <LandingHero />
        <LandingSkills />
        <LandingTryIt />
        <LandingHowItWorks />
      </main>
      <LandingFooter />
    </>
  );
}
