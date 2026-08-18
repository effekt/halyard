import { defineBlock } from "@nubbin/core";
import { ChangelogList } from "./ChangelogList";
import { changelogListSchema } from "./ChangelogList.schema";

export const changelogListBlock = defineBlock({
  name: "ChangelogList",
  schema: changelogListSchema,
  component: ChangelogList,
  version: 1,
  slots: {},
});
