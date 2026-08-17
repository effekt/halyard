import { defineBlock } from "@nubbin/core";
import { SectionStack } from "./SectionStack";
import { sectionStackSchema } from "./SectionStack.schema";

/** The one bounded slot in the demo: a stack with nothing in it is not a page, and twelve
 * sections is past the point where a marketing page reads as one. */
export const sectionStackBlock = defineBlock({
  name: "SectionStack",
  schema: sectionStackSchema,
  component: SectionStack,
  version: 1,
  slots: { sections: { min: 1, max: 12 } },
});
