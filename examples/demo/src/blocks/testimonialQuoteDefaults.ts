import type { z } from "zod";
import type { testimonialQuoteSchema } from "./TestimonialQuote.schema";

export const testimonialQuoteDefaults: z.infer<typeof testimonialQuoteSchema> = {
  quote:
    "We stopped reconciling three versions of the plan every Monday. Now there’s just the one, and everyone trusts it.",
  name: "Priya Shah",
  role: "Head of Operations",
  avatar: { url: "/avatar-priya.svg", alt: "Portrait illustration of Priya Shah" },
  tone: "light",
};
