import type { z } from "zod";
import type { featureGridSchema } from "./FeatureGrid.schema";

type FeatureGridProps = z.infer<typeof featureGridSchema>;

const TONE_STYLES = {
  light: { section: "bg-canvas text-marine", card: "border-brass/30 bg-white", body: "text-marine/70" },
  dark: { section: "bg-marine text-canvas", card: "border-teal-light/20 bg-white/5", body: "text-canvas/70" },
} as const;

/** One fixed glyph per closed icon name — a plain lookup, not a branch, so it stays data. */
const ICON_PATHS: Record<FeatureGridProps["items"][number]["icon"], string> = {
  chart: "M4 19V9m6 10V5m6 14v-7",
  shield: "M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z",
  bolt: "M13 2 4 14h6l-1 8 9-12h-6l1-8z",
  layers: "M12 3 3 8l9 5 9-5-9-5zM3 14l9 5 9-5M3 11l9 5 9-5",
};

export function FeatureGrid({ heading, tone, items }: FeatureGridProps) {
  const styles = TONE_STYLES[tone];
  return (
    <section className={`${styles.section} px-6 py-24`}>
      <div className="mx-auto max-w-6xl">
        <h2 className="max-w-2xl text-3xl font-semibold tracking-tight">{heading}</h2>
        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <li key={item.title} className={`${styles.card} rounded-lg border p-6`}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                className="h-6 w-6 text-teal"
                aria-hidden="true"
              >
                <path d={ICON_PATHS[item.icon]} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <h3 className="mt-4 font-semibold">{item.title}</h3>
              <p className={`mt-2 text-sm ${styles.body}`}>{item.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
