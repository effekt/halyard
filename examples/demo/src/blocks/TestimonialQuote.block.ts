import { defineBlock } from "@nubbin/core";
import { TestimonialQuote } from "./TestimonialQuote";
import { testimonialQuoteSchema } from "./TestimonialQuote.schema";

export const testimonialQuoteBlock = defineBlock({
  name: "TestimonialQuote",
  schema: testimonialQuoteSchema,
  component: TestimonialQuote,
  version: 1,
  slots: {},
});
