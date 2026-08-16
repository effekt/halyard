import type { z } from "zod";
import type { faqAccordionSchema } from "./FaqAccordion.schema";

type FaqAccordionProps = z.infer<typeof faqAccordionSchema>;

const TONE_STYLES = {
  light: { section: "bg-canvas text-marine", item: "border-brass/30" },
  dark: { section: "bg-marine text-canvas", item: "border-teal-light/20" },
} as const;

/** Native `<details>` gives the disclosure behaviour for free — no client state, one root. */
export function FaqAccordion({ heading, tone, items }: FaqAccordionProps) {
  const styles = TONE_STYLES[tone];
  return (
    <section className={`${styles.section} px-6 py-24`}>
      <div className="mx-auto max-w-3xl">
        <h2 className="text-3xl font-semibold tracking-tight">{heading}</h2>
        <div className="mt-10 divide-y">
          {items.map((item) => (
            <details key={item.question} className={`${styles.item} py-5`}>
              <summary className="cursor-pointer list-none font-semibold marker:content-none">
                {item.question}
              </summary>
              <p className="mt-3 text-sm opacity-75">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
