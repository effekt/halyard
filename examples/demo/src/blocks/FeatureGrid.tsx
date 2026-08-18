import type { InferProps } from "@nubbin/core";
import type { featureGridSchema } from "./FeatureGrid.schema";
import { TONE_ACCENT, TONE_SURFACE } from "./tone.constants";

type FeatureGridProps = InferProps<typeof featureGridSchema>;

const TONE_STYLES = {
  light: {
    section: TONE_SURFACE.light,
    card: "border-brass/30 bg-white",
    body: "text-marine/70",
    icon: TONE_ACCENT.light,
  },
  dark: {
    section: TONE_SURFACE.dark,
    card: "border-teal-light/20 bg-white/5",
    body: "text-canvas/70",
    icon: TONE_ACCENT.dark,
  },
} as const;

/** Full class names per column count, because Tailwind only compiles classes it can read. */
const COLUMN_STYLES: Record<number, string> = {
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
};
const DEFAULT_COLUMNS = 4;
const DEFAULT_COLUMN_STYLE = "lg:grid-cols-4";

/** One fixed glyph per closed icon name — a plain lookup, not a branch, so it stays data. */
const ICON_PATHS: Record<FeatureGridProps["items"][number]["icon"], string> = {
  chart: "M4 19V9m6 10V5m6 14v-7",
  shield: "M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z",
  bolt: "M13 2 4 14h6l-1 8 9-12h-6l1-8z",
  layers: "M12 3 3 8l9 5 9-5-9-5zM3 14l9 5 9-5M3 11l9 5 9-5",
};

export function FeatureGrid({ heading, tone, columns, compact, items }: FeatureGridProps) {
  const styles = TONE_STYLES[tone];
  const columnStyle = COLUMN_STYLES[columns ?? DEFAULT_COLUMNS] ?? DEFAULT_COLUMN_STYLE;
  return (
    <section
      data-nubbin-block="FeatureGrid"
      className={`${styles.section} px-6 ${compact ? "py-10" : "py-24"}`}
    >
      <div className="mx-auto max-w-6xl">
        <h2 className="max-w-2xl text-balance text-3xl font-semibold tracking-tight">{heading}</h2>
        <ul className={`mt-12 grid gap-6 sm:grid-cols-2 ${columnStyle}`}>
          {items.map((item) => (
            <li key={item.title} className={`${styles.card} rounded-lg border p-6`}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                className={`h-6 w-6 ${styles.icon}`}
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
