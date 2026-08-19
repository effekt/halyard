import { defineBlock } from "@nubbin/core";
import { Prose } from "./Prose";
import { proseSchema } from "./Prose.schema";

export const proseBlock = defineBlock({
  name: "Prose",
  schema: proseSchema,
  component: Prose,
  version: 2,
  slots: {},
});
