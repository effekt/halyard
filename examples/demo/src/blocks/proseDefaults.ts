import type { InferProps } from "@nubbin/core";
import type { proseSchema } from "./Prose.schema";

export const proseDefaults: InferProps<typeof proseSchema> = {
  heading: "Why we build this",
  tone: "light",
  body: [
    {
      kind: "paragraph",
      spans: [
        {
          text: "Most planning tools optimise for the person entering the work. Tidewell optimises for the person reading it — the one deciding on Monday morning what the week actually holds.",
        },
      ],
    },
    {
      kind: "paragraph",
      spans: [
        {
          text: "That is why there is one schedule rather than one per team, and why a read-only link is a first-class thing rather than an export. How we keep that one schedule safe is written up on our ",
        },
        { text: "security page", href: "/security" },
        { text: "." },
      ],
    },
  ],
};
