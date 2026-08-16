import type { z } from "zod";
import type { faqAccordionSchema } from "./FaqAccordion.schema";
import { TONE_SURFACE } from "./tone.constants";

type FaqAccordionProps = z.infer<typeof faqAccordionSchema>;

const TONE_STYLES = {
  light: { section: TONE_SURFACE.light, item: "border-brass/30" },
  dark: { section: TONE_SURFACE.dark, item: "border-teal-light/20" },
} as const;

/** Native `<details>` gives the disclosure behaviour for free — no client state, one root. */
export function FaqAccordion({ heading, tone, items }: FaqAccordionProps) {
  const styles = TONE_STYLES[tone];
  return (
    <section className={`${styles.section} px-6 py-24`}>
      <div className="mx-auto max-w-3xl">
        <h2 className="text-balance text-3xl font-semibold tracking-tight">{heading}</h2>
        <div className="mt-10 divide-y">
          {items.map((item) => (
            <details key={item.question} className={`${styles.item} group py-5`}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold marker:content-none">
                {item.question}
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  className="h-4 w-4 shrink-0 motion-safe:transition-transform group-open:rotate-180"
                  aria-hidden="true"
                >
                  <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </summary>
              <p className="mt-3 text-sm opacity-75">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
