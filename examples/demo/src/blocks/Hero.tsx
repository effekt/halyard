import type { z } from "zod";
import type { heroSchema } from "./Hero.schema";
import { TONE_ACCENT, TONE_SURFACE } from "./tone.constants";

type HeroProps = z.infer<typeof heroSchema>;

const TONE_STYLES = {
  light: { section: TONE_SURFACE.light, eyebrow: TONE_ACCENT.light, body: "text-marine/70" },
  dark: { section: TONE_SURFACE.dark, eyebrow: TONE_ACCENT.dark, body: "text-canvas/75" },
} as const;

/**
 * The orange wash is decorative-only and appears once per screen — it is never a text or
 * button surface, since white text on raw orange fails contrast (invariant: use orange-deep
 * for anything that carries text).
 */
export function Hero({ eyebrow, headline, body, tone, cta, image }: HeroProps) {
  const styles = TONE_STYLES[tone];
  return (
    <section className={`${styles.section} relative overflow-hidden`}>
      <div
        aria-hidden="true"
        className="-top-24 -right-24 pointer-events-none absolute h-96 w-96 rounded-full bg-orange opacity-20 blur-3xl"
      />
      <div className="relative z-10 mx-auto grid max-w-6xl gap-12 px-6 py-24 md:grid-cols-2 md:items-center">
        <div>
          <p className={`text-sm font-semibold uppercase tracking-wide ${styles.eyebrow}`}>
            {eyebrow}
          </p>
          <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight md:text-5xl">
            {headline}
          </h1>
          <p className={`mt-6 max-w-md text-lg ${styles.body}`}>{body}</p>
          <a
            href={cta.href}
            className="mt-8 inline-block rounded-md border border-orange-deep bg-orange-deep px-6 py-3 text-sm font-semibold text-white underline-offset-4 hover:underline"
          >
            {cta.label}
          </a>
        </div>
        <img src={image.url} alt={image.alt} className="w-full max-w-lg justify-self-center" />
      </div>
    </section>
  );
}
