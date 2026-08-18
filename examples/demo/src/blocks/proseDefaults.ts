import type { z } from "zod";
import type { proseSchema } from "./Prose.schema";

export const proseDefaults: z.infer<typeof proseSchema> = {
  heading: "Why we build this",
  tone: "light",
  paragraphs: [
    "Most planning tools optimise for the person entering the work. Tidewell optimises for the person reading it — the one deciding on Monday morning what the week actually holds.",
    "That is why there is one schedule rather than one per team, and why a read-only link is a first-class thing rather than an export. How we keep that one schedule safe is written up on our security page.",
    "We are a small crew and we ship weekly. The changelog is public because a roadmap is a promise, and promises age badly.",
  ],
};
