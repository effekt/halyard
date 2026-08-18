import { join } from "node:path";
import { createFsArtifactStore } from "@nubbin/store-fs";

/**
 * The demo's own store, reached from the studio's cwd (`apps/studio`): this studio edits the
 * demo site, so publishing must move the pointers the demo serves from. A consumer points
 * this at wherever their app's store lives.
 */
export const studioStore = createFsArtifactStore(
  join(process.cwd(), "..", "..", "examples", "demo", ".nubbin"),
);
