import type { z } from "zod";
import type { faqAccordionSchema } from "./FaqAccordion.schema";

export const faqAccordionDefaults: z.infer<typeof faqAccordionSchema> = {
  heading: "Frequently asked questions",
  tone: "light",
  items: [
    {
      question: "Does Tidewell replace our ticket tracker?",
      answer:
        "No — Tidewell reads from the tracker you already use and turns it into one shared schedule. Your team keeps filing tickets exactly where they do today.",
    },
    {
      question: "How long does setup take?",
      answer:
        "Most teams import a first workstream and see a working schedule inside an afternoon. Full rollout across a department typically takes a week.",
    },
    {
      question: "Can clients see a read-only view?",
      answer:
        "Yes. Every schedule has a shareable read-only link that updates automatically, so a client never asks for the wrong version again.",
    },
    {
      question: "What happens to our data if we cancel?",
      answer:
        "You can export every workstream to a spreadsheet at any time, and your data stays exportable for 90 days after cancellation.",
    },
  ],
};
