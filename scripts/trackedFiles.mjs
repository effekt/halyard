// Every file this repository would publish, asked of git rather than guessed from a list.
//
// Three scanners each carried their own allowlist of extensions and directory roots, and each
// was narrower than the property its gate-table row claims. An allowlist is invisible to every
// file type nobody thought of when it was written, and it fails silently — the tick printed
// over the files it did read looks identical to a complete one. `--cached` is what is
// committed, `--others --exclude-standard` is what is written but not yet staged and not
// ignored, so the union is exactly what a contributor is about to publish, and no ignored
// build output can enter it.
//
// Deliberately no fallback when git cannot answer: a scanner that quietly walked the tree
// instead would print the same tick whether it read the repository or something else entirely.

import { execFileSync } from "node:child_process";
import { existsSync, realpathSync } from "node:fs";
import { join } from "node:path";
import { isBinaryPath } from "./isBinaryPath.mjs";

const MAX_OUTPUT = 64 * 1024 * 1024;

/** Repository-relative paths of every non-binary file git would publish. */
export function trackedFiles(root) {
  const listed = execFileSync(
    "git",
    ["ls-files", "-z", "--cached", "--others", "--exclude-standard"],
    { cwd: root, encoding: "utf8", maxBuffer: MAX_OUTPUT },
  ).split("\0");
  // A tracked symlink and its target are the same bytes listed twice; resolving to the real
  // path keeps one, the same dedup check-prose-dupes.mjs applies for the same reason. A path
  // git lists but the tree no longer holds cannot be read, so it is dropped rather than thrown.
  const seen = new Set();
  const files = [];
  for (const path of listed) {
    if (path === "" || isBinaryPath(path) || !existsSync(join(root, path))) continue;
    const real = realpathSync(join(root, path));
    if (seen.has(real)) continue;
    seen.add(real);
    files.push(path);
  }
  return files;
}
