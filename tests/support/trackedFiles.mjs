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
  // `GIT_*` is stripped so `cwd` decides which repository answers. Inside a git hook the
  // environment carries `GIT_DIR` and `GIT_INDEX_FILE` naming the repository the hook fired in,
  // and git prefers those over the working directory — so a scanner handed one root would silently
  // report another's files, which is the failure this module exists to prevent.
  const env = Object.fromEntries(
    Object.entries(process.env).filter(([name]) => !name.startsWith("GIT_")),
  );
  const listed = execFileSync(
    "git",
    ["ls-files", "-z", "--cached", "--others", "--exclude-standard"],
    // stderr piped, not inherited: the throw below is the answer, and git's own message on top
    // of it is noise in a suite where a caller is expected to handle the failure.
    { cwd: root, encoding: "utf8", maxBuffer: MAX_OUTPUT, stdio: ["ignore", "pipe", "pipe"], env },
  ).split("\0");
  // A tracked symlink and its target are the same bytes listed twice; resolving to the real
  // path keeps one, the same dedup the prose-duplication corpus applies for the same reason. A path
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
