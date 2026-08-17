import { defineBlock } from "@nubbin/core";
import { Hero } from "./Hero";
import { heroSchema } from "./Hero.schema";

export const heroBlock = defineBlock({
  name: "Hero",
  schema: heroSchema,
  component: Hero,
  version: 1,
  slots: {},
});
