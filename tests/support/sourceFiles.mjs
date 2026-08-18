// Every TypeScript source file git would publish, as repository-relative paths. Shared by the
// three assertions that read the AST, so all three read the same corpus — the property each of
// the deleted scripts re-derived, with a different allowlist, and got wrong differently.

import { REPO_ROOT } from "./repoRoot.mjs";
import { trackedFiles } from "./trackedFiles.mjs";

export function sourceFiles() {
  return trackedFiles(REPO_ROOT).filter((path) => /\.tsx?$/.test(path) && !path.endsWith(".d.ts"));
}
