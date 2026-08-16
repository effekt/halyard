import type { z } from "zod";
import type { heroSchema } from "./Hero.schema";

export const heroDefaults: z.infer<typeof heroSchema> = {
  eyebrow: "Now shipping weekly",
  headline: "Plan the work. Trust the read.",
  body: "Tidewell turns scattered planning docs into one schedule everyone on the team reads the same way — no more Friday afternoon status hunts.",
  tone: "dark",
  cta: { label: "Start a free trial", href: "/pricing" },
  image: {
    url: "/hero-board.svg",
    alt: "A Tidewell planning board showing three workstreams moving from backlog to done",
  },
};
