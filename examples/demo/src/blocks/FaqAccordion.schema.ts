import { z } from "zod";
import { faqItemSchema } from "./faqItem.schema";

export const faqAccordionSchema = z.object({
  heading: z.string(),
  tone: z.enum(["light", "dark"]),
  items: z.array(faqItemSchema),
});
