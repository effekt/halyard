import type { z } from "zod";
import type { testimonialQuoteSchema } from "./TestimonialQuote.schema";

type TestimonialQuoteProps = z.infer<typeof testimonialQuoteSchema>;

const TONE_STYLES = {
  light: { section: "bg-canvas text-marine", role: "text-marine/60" },
  dark: { section: "bg-marine text-canvas", role: "text-canvas/60" },
} as const;

export function TestimonialQuote({ quote, name, role, avatar, tone }: TestimonialQuoteProps) {
  const styles = TONE_STYLES[tone];
  return (
    <section className={`${styles.section} px-6 py-24`}>
      <figure className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
        <blockquote className="text-2xl font-medium leading-relaxed">“{quote}”</blockquote>
        <figcaption className="flex items-center gap-3">
          <img src={avatar.url} alt={avatar.alt} className="h-10 w-10 rounded-full" />
          <span>
            <span className="font-semibold">{name}</span>
            <span className={`block text-sm ${styles.role}`}>{role}</span>
          </span>
        </figcaption>
      </figure>
    </section>
  );
}
