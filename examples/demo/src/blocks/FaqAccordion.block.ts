import { defineBlock } from "@nubbin/core";
import { FaqAccordion } from "./FaqAccordion";
import { faqAccordionSchema } from "./FaqAccordion.schema";

export const faqAccordionBlock = defineBlock({
  name: "FaqAccordion",
  schema: faqAccordionSchema,
  component: FaqAccordion,
  version: 1,
  slots: {},
});
