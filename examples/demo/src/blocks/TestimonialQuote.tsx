import type { InferProps } from "@nubbin/core";
import type { testimonialQuoteSchema } from "./TestimonialQuote.schema";
import { TONE_SURFACE } from "./tone.constants";

type TestimonialQuoteProps = InferProps<typeof testimonialQuoteSchema>;

const TONE_STYLES = {
  light: { section: TONE_SURFACE.light, role: "text-marine/60" },
  dark: { section: TONE_SURFACE.dark, role: "text-canvas/60" },
} as const;

export function TestimonialQuote({ quote, name, role, avatar, tone }: TestimonialQuoteProps) {
  const styles = TONE_STYLES[tone];
  return (
    <section data-nubbin-block="TestimonialQuote" className={`${styles.section} px-6 py-24`}>
      <figure className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
        <blockquote className="text-2xl font-medium leading-relaxed">“{quote}”</blockquote>
        <figcaption className="flex items-center gap-3">
          <img
            src={avatar.url}
            alt={avatar.alt}
            loading="lazy"
            className="h-10 w-10 rounded-full"
          />
          <span>
            <span className="font-semibold">{name}</span>
            <span className={`block text-sm ${styles.role}`}>{role}</span>
          </span>
        </figcaption>
      </figure>
    </section>
  );
}
