import type { Metadata } from "next";
import { CtaBanner } from "@/blocks/CtaBanner";
import { FaqAccordion } from "@/blocks/FaqAccordion";
import { FeatureGrid } from "@/blocks/FeatureGrid";
import { Hero } from "@/blocks/Hero";
import { SiteFooter } from "@/blocks/SiteFooter";
import { siteFooterDefaults } from "@/blocks/siteFooterDefaults";
import { PlanCard } from "./PlanCard";
import { PLANS } from "./plans.constants";
import { INCLUDED_FEATURES, PRICING_FAQS } from "./pricingContent.constants";

export const metadata: Metadata = {
  title: "Pricing — Tidewell",
  description:
    "Every Tidewell plan includes unlimited workstreams and the same fast setup. Pick the seat count that matches your team today.",
};

/** Not a block — a pricing table is page-specific composition, not one of the curated eight. */
export default function PricingPage() {
  return (
    <main>
      <Hero
        eyebrow="Pricing"
        headline="Simple pricing, no surprises"
        body="Every plan includes unlimited workstreams and the same fast setup. Pick the seat count that matches your team today — change it anytime."
        tone="dark"
        cta={{ label: "Compare plans", href: "#plans" }}
        image={{
          url: "/hero-pricing.svg",
          alt: "Abstract illustration of three plan tiers as ascending sails",
        }}
      />
      <section id="plans" className="bg-canvas px-6 py-24 text-marine">
        <h2 className="mx-auto mb-12 max-w-5xl text-balance text-3xl font-semibold tracking-tight">
          Plans
        </h2>
        <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-3">
          {PLANS.map((plan) => (
            <PlanCard key={plan.name} plan={plan} />
          ))}
        </div>
      </section>
      <FeatureGrid heading="Every plan includes" tone="dark" items={[...INCLUDED_FEATURES]} />
      <FaqAccordion heading="Pricing questions" tone="light" items={[...PRICING_FAQS]} />
      <CtaBanner
        heading="Still deciding?"
        body="Start on Starter and upgrade the moment you need more seats — every plan migrates without losing a workstream."
        tone="light"
        cta={{ label: "Start a free trial", href: "/pricing#plans" }}
      />
      <SiteFooter {...siteFooterDefaults} />
    </main>
  );
}
