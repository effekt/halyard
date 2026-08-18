import { defineBlock } from "@nubbin/core";
import { ProfileGrid } from "./ProfileGrid";
import { profileGridSchema } from "./ProfileGrid.schema";

export const profileGridBlock = defineBlock({
  name: "ProfileGrid",
  schema: profileGridSchema,
  component: ProfileGrid,
  version: 1,
  slots: {},
});
