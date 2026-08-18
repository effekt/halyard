import { defineBlock } from "@nubbin/core";
import { PlanTiers } from "./PlanTiers";
import { planTiersSchema } from "./PlanTiers.schema";

export const planTiersBlock = defineBlock({
  name: "PlanTiers",
  schema: planTiersSchema,
  component: PlanTiers,
  version: 1,
  slots: {},
});
