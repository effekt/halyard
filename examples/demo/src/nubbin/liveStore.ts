import { fileURLToPath } from "node:url";
import { createFsArtifactStore } from "@nubbin/store-fs";

/**
 * What this site has already published — a committed store, not the gitignored `.nubbin/` one a
 * developer's publishes land in. The guardrail's question is whether the registry in *this*
 * commit still serves pages compiled before it, and only durable state answers that: a fresh
 * checkout has no `.nubbin/`, so a check reading it would find nothing and report a pass.
 *
 * Resolved from this module rather than from `process.cwd()`, so the answer does not depend on
 * which directory the check was invoked from.
 */
export const liveStore = createFsArtifactStore(
  fileURLToPath(new URL("../../live", import.meta.url)),
);
