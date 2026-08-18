// The directories under `packages/` that carry a manifest. A directory without one is a
// placeholder for a package a later phase creates, so it is skipped rather than reported.

import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { REPO_ROOT } from "./repoRoot.mjs";

export function publishablePackages() {
  const root = join(REPO_ROOT, "packages");
  return readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => join(root, entry.name))
    .filter((dir) => existsSync(join(dir, "package.json")));
}
