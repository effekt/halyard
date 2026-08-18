import { CtaBanner } from "@/blocks/CtaBanner";
import { FeatureGrid } from "@/blocks/FeatureGrid";
import { Hero } from "@/blocks/Hero";
import { SiteFooter } from "@/blocks/SiteFooter";
import { siteFooterDefaults } from "@/blocks/siteFooterDefaults";
import { TEAM, VALUES } from "./aboutContent.constants";

/** Free-form authoring on purpose: the prose and roster sections are page-specific JSX. */
export default function AboutPage() {
  return (
    <main>
      <Hero
        eyebrow="About"
        headline="Built by people who ran the Friday status hunt"
        body="Tidewell exists because every team we worked on kept three versions of the same plan and trusted none of them."
        tone="dark"
        cta={{ label: "See how it reads", href: "/" }}
        image={{
          url: "/hero-board.svg",
          alt: "A Tidewell planning board showing three workstreams moving from backlog to done",
        }}
      />
      <section className="bg-canvas px-6 py-24 text-marine">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl font-semibold tracking-tight">Why we build this</h2>
          <p className="mt-6 text-lg text-marine/70">
            Most planning tools optimise for the person entering the work. Tidewell optimises for
            the person reading it — the one deciding on Monday morning what the week actually holds.
          </p>
          <p className="mt-4 text-lg text-marine/70">
            That is why there is one schedule rather than one per team, and why a read-only link is
            a first-class thing rather than an export. How we keep that one schedule safe is written
            up on our{" "}
            <a href="/security" className="text-teal underline">
              security page
            </a>
            .
          </p>
          <p className="mt-4 text-lg text-marine/70">
            We are a small crew and we ship weekly. The changelog is public because a roadmap is a
            promise, and promises age badly.
          </p>
        </div>
      </section>
      <FeatureGrid heading="What we optimise for" tone="dark" items={[...VALUES]} />
      <section className="bg-canvas px-6 py-24 text-marine">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-semibold tracking-tight">The crew</h2>
          <ul className="mt-12 grid gap-6 sm:grid-cols-3">
            {TEAM.map((person) => (
              <li key={person.name} className="rounded-lg border border-brass/30 bg-white p-6">
                <p className="font-semibold">{person.name}</p>
                <p className="mt-1 text-sm text-marine/70">{person.role}</p>
                <p className="mt-4 text-sm text-marine/70">{person.bio}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <CtaBanner
        heading="Read the schedule, not the status thread"
        body="Start a free trial — your first workstream is live the same afternoon."
        tone="light"
        cta={{ label: "Start a free trial", href: "/pricing" }}
      />
      <SiteFooter {...siteFooterDefaults} />
    </main>
  );
}
