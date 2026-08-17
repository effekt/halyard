import type { InferProps } from "@nubbin/core";
import type { ctaBannerSchema } from "./CtaBanner.schema";
import { TONE_SURFACE } from "./tone.constants";

type CtaBannerProps = InferProps<typeof ctaBannerSchema>;

const TONE_STYLES = {
  light: {
    section: TONE_SURFACE.light,
    body: "text-marine/70",
    button: "border-teal bg-teal text-white",
  },
  dark: {
    section: TONE_SURFACE.dark,
    body: "text-canvas/75",
    button: "border-teal-light bg-teal-light text-marine",
  },
} as const;

export function CtaBanner({ heading, body, tone, cta }: CtaBannerProps) {
  const styles = TONE_STYLES[tone];
  return (
    <section data-nubbin-block="CtaBanner" className={`${styles.section} border-brass/30 border-y`}>
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-6 py-20 text-center">
        <h2 className="text-balance text-3xl font-semibold tracking-tight">{heading}</h2>
        <p className={`max-w-xl text-lg ${styles.body}`}>{body}</p>
        <a
          href={cta.href}
          className={`${styles.button} inline-block rounded-md border px-6 py-3 text-sm font-semibold underline-offset-4 hover:underline`}
        >
          {cta.label}
        </a>
      </div>
    </section>
  );
}
