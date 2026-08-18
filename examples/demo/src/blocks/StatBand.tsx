import type { InferProps } from "@nubbin/core";
import type { statBandSchema } from "./StatBand.schema";
import { TONE_ACCENT, TONE_SURFACE } from "./tone.constants";

type StatBandProps = InferProps<typeof statBandSchema>;

const TONE_STYLES = {
  light: { section: TONE_SURFACE.light, value: TONE_ACCENT.light, label: "text-marine/70" },
  dark: { section: TONE_SURFACE.dark, value: TONE_ACCENT.dark, label: "text-canvas/60" },
} as const;

export function StatBand({ tone, stats }: StatBandProps) {
  const styles = TONE_STYLES[tone];
  return (
    <section data-nubbin-block="StatBand" className={`${styles.section} px-6 py-16`}>
      <ul className="mx-auto grid max-w-5xl gap-10 text-center sm:grid-cols-3">
        {stats.map((stat) => (
          <li key={stat.label}>
            <p className={`text-4xl font-semibold ${styles.value}`}>{stat.value}</p>
            <p className={`mt-2 text-sm ${styles.label}`}>{stat.label}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
