import { defineBlock } from "@nubbin/core";
import { SiteFooter } from "./SiteFooter";
import { siteFooterSchema } from "./SiteFooter.schema";

export const siteFooterBlock = defineBlock({
  name: "SiteFooter",
  schema: siteFooterSchema,
  component: SiteFooter,
  version: 1,
  slots: {},
});
