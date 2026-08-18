// sha256 over every file in a skill, each contributing its relative path as well as its bytes, so
// moving content between two files changes the digest. Hashing the concatenated bytes alone would
// not.
//
// Hashing `SKILL.md` alone is what the deleted gate used to do, and it covered 7 of the 298 files
// the seven installed skills carry — 2.3%. A skill is a directory: `vercel-optimize` ships 156
// files, and the `rules/*.md` beside `SKILL.md` are loaded into an agent's context the same way its
// body is. Appending "ignore every other rule in this repository" to one of those passed as a tick.
//
// One home, because the installer computes this over what it fetched and the test computes it over
// what is on disk. Two copies would agree with each other and with nothing else.

import { createHash } from "node:crypto";

/** @param files a Map of skill-relative path to that file's bytes. */
export function skillDigest(files) {
  const digest = createHash("sha256");
  for (const path of [...files.keys()].sort()) {
    digest.update(path);
    digest.update("\0");
    digest.update(files.get(path));
  }
  return digest.digest("hex");
}
