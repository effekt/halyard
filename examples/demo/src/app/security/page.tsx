import { CtaBanner } from "@/blocks/CtaBanner";
import { FaqAccordion } from "@/blocks/FaqAccordion";
import { FeatureGrid } from "@/blocks/FeatureGrid";
import { Hero } from "@/blocks/Hero";
import { SiteFooter } from "@/blocks/SiteFooter";
import { siteFooterDefaults } from "@/blocks/siteFooterDefaults";
import { PRACTICES, SECURITY_FAQS } from "./securityContent.constants";

/** Free-form authoring on purpose: the practice write-ups are page-specific prose. */
export default function SecurityPage() {
  return (
    <main>
      <Hero
        eyebrow="Security"
        headline="Your schedule is your business"
        body="Tidewell holds the one plan everyone trusts, so protecting it is not a feature tier — it is the product."
        tone="dark"
        cta={{ label: "Read the practices", href: "#practices" }}
        image={{
          url: "/hero-board.svg",
          alt: "A Tidewell planning board showing three workstreams moving from backlog to done",
        }}
      />
      <section id="practices" className="bg-canvas px-6 py-24 text-marine">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl font-semibold tracking-tight">How your data is handled</h2>
          <p className="mt-6 text-lg text-marine/70">
            Every schedule lives in one region, encrypted at rest and in transit. Exports are
            generated on demand and never cached; a deleted workstream is purged from backups on a
            fixed thirty-day cycle.
          </p>
          <h2 className="mt-12 text-3xl font-semibold tracking-tight">Who can see what</h2>
          <p className="mt-6 text-lg text-marine/70">
            Access follows the schedule, not the org chart. A seat sees the workstreams it is
            invited to, a read-only link sees exactly one, and{" "}
            <strong>nobody at Tidewell can open your schedule without a recorded grant</strong> that
            you approve first.
          </p>
          <h2 className="mt-12 text-3xl font-semibold tracking-tight">When something changes</h2>
          <p className="mt-6 text-lg text-marine/70">
            Security-relevant changes ship the way everything here ships — versioned, reviewed, and
            announced. Recent ones are on the{" "}
            <a href="/changelog" className="text-teal underline">
              changelog
            </a>
            , not in a quarterly PDF.
          </p>
        </div>
      </section>
      <FeatureGrid heading="The practices behind that" tone="dark" items={[...PRACTICES]} />
      <FaqAccordion heading="Security questions" tone="light" items={[...SECURITY_FAQS]} />
      <CtaBanner
        heading="Questions we did not answer?"
        body="Security review for a larger rollout? We will walk your team through the details."
        tone="dark"
        cta={{ label: "Talk to us", href: "/pricing" }}
      />
      <SiteFooter {...siteFooterDefaults} />
    </main>
  );
}
