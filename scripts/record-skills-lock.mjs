#!/usr/bin/env node

// Records the installed skills into `skills-lock.json`, which is the only committed evidence of
// which third-party skills this repository is worked on with — the skills themselves are ignored,
// because they are someone else's work and they arrive as symlinks.
//
// The first-party `skills` CLI writes this same file, minus `contentHash`. It cannot be used in
// place of this one: `skills experimental_install` against a lockfile whose recorded hash had been
// corrupted installed anyway and rewrote the hash to match whatever upstream now holds, so the
// lockfile records the fetch rather than constraining it. `contentHash` is ours, and
// `tests/skillsLock.test.mjs` is what compares it.
//
// Usage: node scripts/record-skills-lock.mjs

import { readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { installedSkills, skillFiles } from "./installedSkills.mjs";
import { skillDigest } from "./skillDigest.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const LOCKFILE = join(ROOT, "skills-lock.json");

const previous = JSON.parse(await readFile(LOCKFILE, "utf8"));
const skills = {};
for (const name of await installedSkills(ROOT)) {
  const files = await skillFiles(ROOT, name);
  if (files === null) continue;
  skills[name] = { ...previous.skills?.[name], contentHash: skillDigest(files) };
}

await writeFile(LOCKFILE, `${JSON.stringify({ version: 1, skills }, null, 2)}\n`);
console.log(`✅ Recorded ${Object.keys(skills).length} skill(s) into skills-lock.json.`);
