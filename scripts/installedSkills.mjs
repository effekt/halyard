// Reading the skills installed on this machine. `.agents/skills` is gitignored, so a fresh clone
// and a CI runner both find nothing here — which is the difference between the half of the skills
// lockfile that can be checked anywhere and the half that needs a contributor's disk.

import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const SKILL_FILE = "SKILL.md";

const skillsDir = (root) => join(root, ".agents", "skills");

/** Every file under `dir`, as paths relative to it. */
async function filesUnder(dir, prefix = "") {
  const entries = await readdir(dir, { withFileTypes: true });
  const found = [];
  for (const entry of entries) {
    const rel = prefix === "" ? entry.name : `${prefix}/${entry.name}`;
    if (entry.isDirectory()) found.push(...(await filesUnder(join(dir, entry.name), rel)));
    else found.push(rel);
  }
  return found;
}

/** The names of the skills installed here, or [] where none are. */
export async function installedSkills(root) {
  if (!existsSync(skillsDir(root))) return [];
  const entries = await readdir(skillsDir(root), { withFileTypes: true });
  return entries.filter((entry) => !entry.name.startsWith(".")).map((entry) => entry.name);
}

/**
 * One skill's files as a Map of relative path to bytes, or null where the directory carries no
 * `SKILL.md` — a directory without one is not a skill, and hashing it would record something
 * unusable.
 */
export async function skillFiles(root, name) {
  const dir = join(skillsDir(root), name);
  if (!existsSync(join(dir, SKILL_FILE))) return null;
  const files = new Map();
  for (const rel of (await filesUnder(dir)).sort()) {
    files.set(rel, await readFile(join(dir, rel)));
  }
  return files;
}
