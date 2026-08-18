// The repository root, derived from this file's own location so a test resolves it identically
// wherever vitest is invoked from — the property the deleted scripts each re-derived by hand.

import { fileURLToPath } from "node:url";

export const REPO_ROOT = fileURLToPath(new URL("../..", import.meta.url));
