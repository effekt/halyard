import { defineBlock } from "@nubbin/core";
import { StatBand } from "./StatBand";
import { statBandSchema } from "./StatBand.schema";

export const statBandBlock = defineBlock({
  name: "StatBand",
  schema: statBandSchema,
  component: StatBand,
  version: 1,
  slots: {},
});
