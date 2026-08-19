import type { RichTextBlock } from "@nubbin/core";
import { RichTextSpans } from "./RichTextSpans";
import { richTextText } from "./richTextText";

interface RichTextRunProps {
  run: readonly RichTextBlock[];
  className: string;
}

/** One run of blocks: a list of items, or a single paragraph. */
export function RichTextRun({ run, className }: RichTextRunProps) {
  if (run[0]?.kind === "listItem") {
    return (
      <ul className={`${className} list-disc pl-6`}>
        {run.map((block) => (
          <li key={richTextText([block])}>
            <RichTextSpans spans={block.spans} />
          </li>
        ))}
      </ul>
    );
  }
  return (
    <p className={className}>
      <RichTextSpans spans={run[0]?.spans ?? []} />
    </p>
  );
}
