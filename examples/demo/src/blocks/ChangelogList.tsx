import type { InferProps } from "@nubbin/core";
import type { changelogListSchema } from "./ChangelogList.schema";
import { TONE_SURFACE } from "./tone.constants";

type ChangelogListProps = InferProps<typeof changelogListSchema>;

const TAG_LABELS = { added: "Added", improved: "Improved", fixed: "Fixed" } as const;

const TONE_STYLES = {
  light: { muted: "text-marine/60", body: "text-marine/70", tag: "border-teal text-teal" },
  dark: {
    muted: "text-canvas/60",
    body: "text-canvas/70",
    tag: "border-teal-light text-teal-light",
  },
} as const;

export function ChangelogList({ tone, entries }: ChangelogListProps) {
  const styles = TONE_STYLES[tone];
  return (
    <section data-nubbin-block="ChangelogList" className={`${TONE_SURFACE[tone]} px-6 py-24`}>
      <div className="mx-auto max-w-3xl">
        {entries.map((entry) => (
          <article key={entry.date} className="border-t border-brass/30 py-10">
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
              <h2 className="text-xl font-semibold">{entry.title}</h2>
              <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${styles.tag}`}>
                {TAG_LABELS[entry.tag]}
              </span>
            </div>
            <p className={`mt-1 text-sm ${styles.muted}`}>
              <time dateTime={entry.date}>{entry.date}</time>
            </p>
            {entry.paragraphs.map((paragraph) => (
              <p key={paragraph} className={`mt-4 ${styles.body}`}>
                {paragraph}
              </p>
            ))}
          </article>
        ))}
      </div>
    </section>
  );
}
