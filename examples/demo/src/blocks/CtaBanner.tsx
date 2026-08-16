import type { z } from "zod";
import type { ctaBannerSchema } from "./CtaBanner.schema";

type CtaBannerProps = z.infer<typeof ctaBannerSchema>;

const TONE_STYLES = {
  light: {
    section: "bg-canvas text-marine",
    body: "text-marine/70",
    button: "bg-teal text-white",
  },
  dark: {
    section: "bg-marine text-canvas",
    body: "text-canvas/75",
    button: "bg-teal-light text-marine",
  },
} as const;

export function CtaBanner({ heading, body, tone, cta }: CtaBannerProps) {
  const styles = TONE_STYLES[tone];
  return (
    <section className={`${styles.section} border-brass/30 border-y`}>
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-6 py-20 text-center">
        <h2 className="text-3xl font-semibold tracking-tight">{heading}</h2>
        <p className={`max-w-xl text-lg ${styles.body}`}>{body}</p>
        <a
          href={cta.href}
          className={`${styles.button} inline-block rounded-md px-6 py-3 text-sm font-semibold`}
        >
          {cta.label}
        </a>
      </div>
    </section>
  );
}
