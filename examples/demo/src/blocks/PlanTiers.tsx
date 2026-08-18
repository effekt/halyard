import type { InferProps } from "@nubbin/core";
import type { planTiersSchema } from "./PlanTiers.schema";
import { TONE_SURFACE } from "./tone.constants";

type PlanTiersProps = InferProps<typeof planTiersSchema>;

const TONE_STYLES = {
  light: {
    section: TONE_SURFACE.light,
    card: "border-brass/30",
    muted: "text-marine/70",
  },
  dark: {
    section: TONE_SURFACE.dark,
    card: "border-teal-light/20",
    muted: "text-canvas/70",
  },
} as const;

export function PlanTiers({ heading, tone, tiers }: PlanTiersProps) {
  const styles = TONE_STYLES[tone];
  return (
    <section data-nubbin-block="PlanTiers" className={`${styles.section} px-6 py-24`}>
      <h2 className="mx-auto mb-12 max-w-5xl text-balance text-3xl font-semibold tracking-tight">
        {heading}
      </h2>
      <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-3">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={`rounded-lg border p-8 ${tier.recommended ? "border-orange-deep" : styles.card}`}
          >
            {/* The badge row keeps its height on every card so names and prices align across the grid. */}
            <p className="min-h-7">
              {tier.recommended && (
                <span className="inline-block rounded-full border border-orange-deep bg-orange-deep px-3 py-1 text-xs font-semibold text-white">
                  Recommended
                </span>
              )}
            </p>
            <h3 className="mt-4 text-xl font-semibold">{tier.name}</h3>
            <p className={`mt-1 text-sm ${styles.muted}`}>{tier.description}</p>
            <p className="mt-6 text-3xl font-semibold">{tier.price}</p>
            <p className={`text-sm ${styles.muted}`}>{tier.unit}</p>
            <ul className="mt-6 space-y-2 text-sm">
              {tier.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
