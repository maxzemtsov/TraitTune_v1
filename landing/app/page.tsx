import HeroSection from "../src/components/HeroSection";
import ProductOverview from "../src/components/ProductOverview";
import ScientificValidation from "../src/components/ScientificValidation";
import CompetitiveAdvantages from "../src/components/CompetitiveAdvantages";
import UseCases from "../src/components/UseCases";
import SocialProof from "../src/components/SocialProof";
import PricingSection from "../src/components/PricingSection";
import CtaSection from "../src/components/CtaSection";

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <ProductOverview />
      <ScientificValidation />
      <CompetitiveAdvantages />
      <UseCases />
      <SocialProof />
      <PricingSection />
      <CtaSection />
    </main>
  );
}

