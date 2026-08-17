import { defineCatalog } from "@nubbin/core";
import { ctaBannerSchema } from "../blocks/CtaBanner.schema";
import { ctaBannerDefaults } from "../blocks/ctaBannerDefaults";
import { faqAccordionSchema } from "../blocks/FaqAccordion.schema";
import { featureGridSchema } from "../blocks/FeatureGrid.schema";
import { faqAccordionDefaults } from "../blocks/faqAccordionDefaults";
import { featureGridDefaults } from "../blocks/featureGridDefaults";
import { heroSchema } from "../blocks/Hero.schema";
import { heroDefaults } from "../blocks/heroDefaults";
import { logoWallSchema } from "../blocks/LogoWall.schema";
import { logoWallDefaults } from "../blocks/logoWallDefaults";
import { sectionStackSchema } from "../blocks/SectionStack.schema";
import { siteFooterSchema } from "../blocks/SiteFooter.schema";
import { statBandSchema } from "../blocks/StatBand.schema";
import { sectionStackDefaults } from "../blocks/sectionStackDefaults";
import { siteFooterDefaults } from "../blocks/siteFooterDefaults";
import { statBandDefaults } from "../blocks/statBandDefaults";
import { testimonialQuoteSchema } from "../blocks/TestimonialQuote.schema";
import { testimonialQuoteDefaults } from "../blocks/testimonialQuoteDefaults";

/**
 * The serializable half of the split — what a studio would fetch to build its palette and
 * inspector. Two fields carry a `data` hint, and those are the only two the compiler turns
 * into holes; every other field freezes into the artifact.
 */
export const catalog = defineCatalog({
  Hero: { schema: heroSchema, defaults: heroDefaults },
  LogoWall: { schema: logoWallSchema, defaults: logoWallDefaults },
  FeatureGrid: { schema: featureGridSchema, defaults: featureGridDefaults },
  StatBand: {
    schema: statBandSchema,
    defaults: statBandDefaults,
    ui: { fields: { stats: { data: "request" } } },
  },
  TestimonialQuote: { schema: testimonialQuoteSchema, defaults: testimonialQuoteDefaults },
  FaqAccordion: {
    schema: faqAccordionSchema,
    defaults: faqAccordionDefaults,
    ui: { fields: { items: { data: { revalidate: 5 } } } },
  },
  CtaBanner: { schema: ctaBannerSchema, defaults: ctaBannerDefaults },
  SiteFooter: { schema: siteFooterSchema, defaults: siteFooterDefaults },
  SectionStack: { schema: sectionStackSchema, defaults: sectionStackDefaults },
});
