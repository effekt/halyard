import { defineBlock } from "@nubbin/core";
import { FeatureGrid } from "./FeatureGrid";
import { featureGridSchema } from "./FeatureGrid.schema";

export const featureGridBlock = defineBlock({
  name: "FeatureGrid",
  schema: featureGridSchema,
  component: FeatureGrid,
  version: 1,
  slots: {},
});
