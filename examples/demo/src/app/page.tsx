import { CtaBanner } from "@/blocks/CtaBanner";
import { ctaBannerDefaults } from "@/blocks/ctaBannerDefaults";
import { FaqAccordion } from "@/blocks/FaqAccordion";
import { faqAccordionDefaults } from "@/blocks/faqAccordionDefaults";
import { FeatureGrid } from "@/blocks/FeatureGrid";
import { featureGridDefaults } from "@/blocks/featureGridDefaults";
import { Hero } from "@/blocks/Hero";
import { heroDefaults } from "@/blocks/heroDefaults";
import { LogoWall } from "@/blocks/LogoWall";
import { logoWallDefaults } from "@/blocks/logoWallDefaults";
import { SiteFooter } from "@/blocks/SiteFooter";
import { siteFooterDefaults } from "@/blocks/siteFooterDefaults";
import { StatBand } from "@/blocks/StatBand";
import { statBandDefaults } from "@/blocks/statBandDefaults";
import { TestimonialQuote } from "@/blocks/TestimonialQuote";
import { testimonialQuoteDefaults } from "@/blocks/testimonialQuoteDefaults";

/**
 * Each block's own `defaults` is what an author sees before touching a field — rendering it
 * unmodified here is the same content a freshly dropped block would show in a studio canvas.
 */
export default function HomePage() {
  return (
    <main>
      <Hero {...heroDefaults} />
      <LogoWall {...logoWallDefaults} />
      <FeatureGrid {...featureGridDefaults} />
      <StatBand {...statBandDefaults} />
      <TestimonialQuote {...testimonialQuoteDefaults} />
      <FaqAccordion {...faqAccordionDefaults} />
      <CtaBanner {...ctaBannerDefaults} />
      <SiteFooter {...siteFooterDefaults} />
    </main>
  );
}
