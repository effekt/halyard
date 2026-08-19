import type { InferProps } from "@nubbin/core";
import type { proseSchema } from "./Prose.schema";
import { RichTextRun } from "./RichTextRun";
import { richTextRuns } from "./richTextRuns";
import { richTextText } from "./richTextText";
import { TONE_SURFACE } from "./tone.constants";

type ProseProps = InferProps<typeof proseSchema>;

const TONE_BODY = { light: "text-marine/70", dark: "text-canvas/75" } as const;

export function Prose({ heading, tone, body }: ProseProps) {
  return (
    <section data-nubbin-block="Prose" className={`${TONE_SURFACE[tone]} px-6 py-24`}>
      <div className="mx-auto max-w-3xl">
        <h2 className="text-3xl font-semibold tracking-tight">{heading}</h2>
        {richTextRuns(body).map((run, index) => (
          <RichTextRun
            key={richTextText(run)}
            run={run}
            className={`${index === 0 ? "mt-6" : "mt-4"} text-lg ${TONE_BODY[tone]}`}
          />
        ))}
      </div>
    </section>
  );
}
