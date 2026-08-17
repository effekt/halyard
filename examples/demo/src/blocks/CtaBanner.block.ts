import { defineBlock } from "@nubbin/core";
import { CtaBanner } from "./CtaBanner";
import { ctaBannerSchema } from "./CtaBanner.schema";

export const ctaBannerBlock = defineBlock({
  name: "CtaBanner",
  schema: ctaBannerSchema,
  component: CtaBanner,
  version: 1,
  slots: {},
});
