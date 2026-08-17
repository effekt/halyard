import { defineBlock } from "@nubbin/core";
import { LogoWall } from "./LogoWall";
import { logoWallSchema } from "./LogoWall.schema";

export const logoWallBlock = defineBlock({
  name: "LogoWall",
  schema: logoWallSchema,
  component: LogoWall,
  version: 1,
  slots: {},
});
