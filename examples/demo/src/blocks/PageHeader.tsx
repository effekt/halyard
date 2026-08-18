import type { InferProps } from "@nubbin/core";
import type { pageHeaderSchema } from "./PageHeader.schema";
import { TONE_ACCENT, TONE_SURFACE } from "./tone.constants";

type PageHeaderProps = InferProps<typeof pageHeaderSchema>;

const TONE_BODY = { light: "text-marine/70", dark: "text-canvas/75" } as const;

/** A Hero without its action and image — kept separate rather than loosening Hero's schema. */
export function PageHeader({ eyebrow, headline, body, tone }: PageHeaderProps) {
  return (
    <section data-nubbin-block="PageHeader" className={`${TONE_SURFACE[tone]} px-6 py-24`}>
      <div className="mx-auto max-w-3xl">
        <p className={`text-sm font-semibold uppercase tracking-wide ${TONE_ACCENT[tone]}`}>
          {eyebrow}
        </p>
        <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight">{headline}</h1>
        <p className={`mt-6 text-lg ${TONE_BODY[tone]}`}>{body}</p>
      </div>
    </section>
  );
}
