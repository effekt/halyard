import { CtaBanner } from "@/blocks/CtaBanner";
import { SiteFooter } from "@/blocks/SiteFooter";
import { siteFooterDefaults } from "@/blocks/siteFooterDefaults";
import { ENTRIES } from "./changelogContent.constants";

const TAG_LABELS = { added: "Added", improved: "Improved", fixed: "Fixed" } as const;

/** Free-form authoring on purpose: the entry list is page-specific JSX, not a block. */
export default function ChangelogPage() {
  return (
    <main>
      <section className="bg-marine px-6 py-24 text-canvas">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-light">Changelog</p>
          <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight">
            What shipped, and when
          </h1>
          <p className="mt-6 text-lg text-canvas/75">
            We ship weekly. This page is the record — no roadmap, no “coming soon.”
          </p>
        </div>
      </section>
      <section className="bg-canvas px-6 py-24 text-marine">
        <div className="mx-auto max-w-3xl">
          {ENTRIES.map((entry) => (
            <article key={entry.date} className="border-t border-brass/30 py-10">
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
                <h2 className="text-xl font-semibold">{entry.title}</h2>
                <span className="rounded-full border border-teal px-3 py-1 text-xs font-semibold text-teal">
                  {TAG_LABELS[entry.tag]}
                </span>
              </div>
              <p className="mt-1 text-sm text-marine/70">
                <time dateTime={entry.date}>{entry.date}</time>
              </p>
              {entry.paragraphs.map((paragraph) => (
                <p key={paragraph} className="mt-4 text-marine/70">
                  {paragraph}
                </p>
              ))}
            </article>
          ))}
        </div>
      </section>
      <CtaBanner
        heading="See next week's entry from the inside"
        body="Start a free trial and watch the schedule update itself."
        tone="dark"
        cta={{ label: "Start a free trial", href: "/pricing" }}
      />
      <SiteFooter {...siteFooterDefaults} />
    </main>
  );
}
