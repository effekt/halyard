import type { z } from "zod";
import type { logoWallSchema } from "./LogoWall.schema";

type LogoWallProps = z.infer<typeof logoWallSchema>;

const TONE_STYLES = {
  light: { section: "bg-canvas text-marine", heading: "text-marine/60" },
  dark: { section: "bg-marine text-canvas", heading: "text-canvas/60" },
} as const;

export function LogoWall({ heading, tone, logos }: LogoWallProps) {
  const styles = TONE_STYLES[tone];
  return (
    <section className={`${styles.section} px-6 py-16`}>
      <div className="mx-auto max-w-6xl">
        <p
          className={`text-center text-sm font-semibold uppercase tracking-wide ${styles.heading}`}
        >
          {heading}
        </p>
        <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-70 grayscale">
          {logos.map((logo) => (
            <li key={logo.url}>
              <img src={logo.url} alt={logo.alt} className="h-6 w-auto" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
