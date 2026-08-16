import { CtaBanner } from "@/blocks/CtaBanner";
import { FaqAccordion } from "@/blocks/FaqAccordion";
import { FeatureGrid } from "@/blocks/FeatureGrid";
import { Hero } from "@/blocks/Hero";
import { SiteFooter } from "@/blocks/SiteFooter";
import { siteFooterDefaults } from "@/blocks/siteFooterDefaults";

const PLANS = [
  {
    name: "Starter",
    price: "$19",
    unit: "per seat / month",
    description: "For one team finding its footing.",
    features: ["Up to 3 workstreams", "Read-only share links", "Email support"],
    recommended: false,
  },
  {
    name: "Crew",
    price: "$39",
    unit: "per seat / month",
    description: "For teams coordinating across several workstreams.",
    features: [
      "Unlimited workstreams",
      "Dependency alerts",
      "Priority support",
      "Spreadsheet import",
    ],
    recommended: true,
  },
  {
    name: "Fleet",
    price: "Talk to sales",
    unit: "annual billing",
    description: "For an organization running many teams on one schedule.",
    features: ["Everything in Crew", "Single sign-on", "A dedicated onboarding lead"],
    recommended: false,
  },
] as const;

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
        <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-lg border p-8 ${plan.recommended ? "border-orange-deep" : "border-brass/30"}`}
            >
              {plan.recommended && (
                <span className="inline-block rounded-full bg-orange-deep px-3 py-1 text-xs font-semibold text-white">
                  Recommended
                </span>
              )}
              <h3 className="mt-4 text-xl font-semibold">{plan.name}</h3>
              <p className="mt-1 text-sm text-marine/60">{plan.description}</p>
              <p className="mt-6 text-3xl font-semibold">{plan.price}</p>
              <p className="text-sm text-marine/60">{plan.unit}</p>
              <ul className="mt-6 space-y-2 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
      <FeatureGrid
        heading="Every plan includes"
        tone="dark"
        items={[
          { icon: "layers", title: "Every workstream, unlimited", body: "No plan caps how much of the schedule you can model." },
          { icon: "shield", title: "Read-only share links", body: "Send a client a link that always shows the current schedule, never a stale export." },
          { icon: "bolt", title: "Same-day onboarding", body: "A first workstream is live the day you sign up, on every plan." },
          { icon: "chart", title: "Nested dependencies", body: "Model how work actually depends on other work, not a flat list pretending it does." },
        ]}
      />
      <FaqAccordion
        heading="Pricing questions"
        tone="light"
        items={[
          {
            question: "Can I change seat count later?",
            answer: "Yes — upgrade or downgrade anytime; we prorate the difference to the day.",
          },
          {
            question: "Is there a discount for annual billing?",
            answer: "Annual billing saves two months compared to paying monthly.",
          },
          {
            question: "What counts as a seat?",
            answer:
              "Anyone who edits a schedule. Read-only viewers with a share link never count against your seat total.",
          },
          {
            question: "Do you offer a nonprofit or education discount?",
            answer:
              "Yes — contact sales with a verification and we'll apply a standard discount to any plan.",
          },
        ]}
      />
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
