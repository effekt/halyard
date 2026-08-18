import { defineBlock } from "@nubbin/core";
import { PageHeader } from "./PageHeader";
import { pageHeaderSchema } from "./PageHeader.schema";

export const pageHeaderBlock = defineBlock({
  name: "PageHeader",
  schema: pageHeaderSchema,
  component: PageHeader,
  version: 1,
  slots: {},
});
