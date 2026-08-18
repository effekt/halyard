import type { Block } from "@nubbin/core";
import { changelogListBlock } from "../blocks/ChangelogList.block";
import { ctaBannerBlock } from "../blocks/CtaBanner.block";
import { faqAccordionBlock } from "../blocks/FaqAccordion.block";
import { featureGridBlock } from "../blocks/FeatureGrid.block";
import { heroBlock } from "../blocks/Hero.block";
import { logoWallBlock } from "../blocks/LogoWall.block";
import { pageHeaderBlock } from "../blocks/PageHeader.block";
import { planTiersBlock } from "../blocks/PlanTiers.block";
import { profileGridBlock } from "../blocks/ProfileGrid.block";
import { proseBlock } from "../blocks/Prose.block";
import { sectionStackBlock } from "../blocks/SectionStack.block";
import { siteFooterBlock } from "../blocks/SiteFooter.block";
import { statBandBlock } from "../blocks/StatBand.block";
import { testimonialQuoteBlock } from "../blocks/TestimonialQuote.block";

/**
 * The blocks this site curates, as a list rather than a built registry, so the compatibility
 * guardrail can register a deliberately altered set beside the real one and prove its detector
 * still fires. `registry.ts` is the one built from it.
 */
export const BLOCKS: Block[] = [
  heroBlock,
  logoWallBlock,
  featureGridBlock,
  planTiersBlock,
  proseBlock,
  profileGridBlock,
  statBandBlock,
  testimonialQuoteBlock,
  faqAccordionBlock,
  ctaBannerBlock,
  pageHeaderBlock,
  changelogListBlock,
  siteFooterBlock,
  sectionStackBlock,
];
