import type { z } from "zod";
import type { logoWallSchema } from "./LogoWall.schema";
import { TONE_SURFACE } from "./tone.constants";

type LogoWallProps = z.infer<typeof logoWallSchema>;

const TONE_STYLES = {
  light: { section: TONE_SURFACE.light, heading: "text-marine/60" },
  dark: { section: TONE_SURFACE.dark, heading: "text-canvas/60" },
} as const;

export function LogoWall({ heading, tone, logos }: LogoWallProps) {
  const styles = TONE_STYLES[tone];
  return (
    <section className={`${styles.section} px-6 py-16`}>
      <div className="mx-auto max-w-6xl">
        <h2
          className={`text-center text-sm font-semibold uppercase tracking-wide ${styles.heading}`}
        >
          {heading}
        </h2>
        <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-70 grayscale">
          {logos.map((logo) => (
            <li key={logo.url}>
              <img src={logo.url} alt={logo.alt} loading="lazy" className="h-6 w-auto" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
