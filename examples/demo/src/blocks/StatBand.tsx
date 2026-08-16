import type { z } from "zod";
import type { statBandSchema } from "./StatBand.schema";

type StatBandProps = z.infer<typeof statBandSchema>;

const TONE_STYLES = {
  light: { section: "bg-canvas text-marine", value: "text-teal", label: "text-marine/60" },
  dark: { section: "bg-marine text-canvas", value: "text-teal-light", label: "text-canvas/60" },
} as const;

export function StatBand({ tone, stats }: StatBandProps) {
  const styles = TONE_STYLES[tone];
  return (
    <section className={`${styles.section} px-6 py-16`}>
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
