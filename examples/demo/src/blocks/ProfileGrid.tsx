import type { InferProps } from "@nubbin/core";
import type { profileGridSchema } from "./ProfileGrid.schema";
import { TONE_SURFACE } from "./tone.constants";

type ProfileGridProps = InferProps<typeof profileGridSchema>;

const TONE_CARD = {
  light: { card: "border-brass/30 bg-white", muted: "text-marine/70", body: "text-marine/80" },
  dark: {
    card: "border-teal-light/20 bg-white/5",
    muted: "text-canvas/60",
    body: "text-canvas/70",
  },
} as const;

export function ProfileGrid({ heading, tone, people }: ProfileGridProps) {
  const styles = TONE_CARD[tone];
  return (
    <section data-nubbin-block="ProfileGrid" className={`${TONE_SURFACE[tone]} px-6 py-24`}>
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl font-semibold tracking-tight">{heading}</h2>
        <ul className="mt-12 grid gap-6 sm:grid-cols-3">
          {people.map((person) => (
            <li key={person.name} className={`rounded-lg border p-6 ${styles.card}`}>
              <p className="font-semibold">{person.name}</p>
              <p className={`mt-1 text-sm ${styles.muted}`}>{person.role}</p>
              <p className={`mt-4 text-sm ${styles.body}`}>{person.bio}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
