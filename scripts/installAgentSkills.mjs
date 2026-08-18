#!/usr/bin/env node

// Reinstalls the skills `skills-lock.json` records, and verifies each one against its recorded
// digest **before** writing anything to disk.
//
// The lockfile was already the only committed record of which skills this repository is worked on
// with; it was not something a contributor could act on. There is no skills CLI on a fresh
// machine, and `docs/environment.md` could only say "then install the skills in
// skills-lock.json". This closes that: `pnpm run skills:install` rebuilds the set.
//
// Verify-then-write, not write-then-check. A skill whose upstream has moved since the lockfile was
// written produces a digest mismatch, and the wrong answer there is to leave the new content on
// disk and report it — that is how an agent ends up running instructions nobody recorded. Nothing
// is written unless the digest matches, so a failed run leaves the previous state intact.
//
// Reproducing a *past* state is a separate problem: entries carry no commit, so this fetches the
// default branch. #165 covers pinning.
//
// Usage: node scripts/installAgentSkills.mjs [--check]
//   --check  verify against upstream and report, writing nothing.
// SKILLS_DIR overrides the install root, which is how this is tested without touching a real one.

import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { skillDigest } from "./skillDigest.mjs";

/** Enough of a sha256 to tell two apart in a report, without filling the line. */
const DIGEST_PREFIX = 12;
const short = (digest) => digest.slice(0, DIGEST_PREFIX);

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const LOCKFILE = join(ROOT, "skills-lock.json");
const SKILLS_DIR = process.env.SKILLS_DIR ?? join(ROOT, ".agents", "skills");
const DEFAULT_BRANCH = "main";

const trees = new Map();

/** The recursive tree for a source repo, fetched once however many skills come from it. */
async function treeFor(source) {
  const cached = trees.get(source);
  if (cached !== undefined) return cached;
  const url = `https://api.github.com/repos/${source}/git/trees/${DEFAULT_BRANCH}?recursive=1`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`cannot list ${source}: HTTP ${response.status}`);
  }
  const { tree } = await response.json();
  trees.set(source, tree);
  return tree;
}

/** Every file in the skill's directory, as paths relative to it, sorted. */
async function pathsFor(entry) {
  const dir = entry.skillPath.replace(/\/[^/]+$/, "");
  const tree = await treeFor(entry.source);
  const paths = tree
    .filter((node) => node.type === "blob" && node.path.startsWith(`${dir}/`))
    .map((node) => node.path.slice(dir.length + 1))
    .sort();
  if (paths.length === 0) {
    throw new Error(`no files under ${entry.source}/${dir}`);
  }
  return { dir, paths };
}

async function fetchFiles(entry, dir, paths) {
  const files = new Map();
  for (const path of paths) {
    const url = `https://raw.githubusercontent.com/${entry.source}/${DEFAULT_BRANCH}/${dir}/${path}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`cannot fetch ${dir}/${path}: HTTP ${response.status}`);
    }
    files.set(path, Buffer.from(await response.arrayBuffer()));
  }
  return files;
}

async function writeSkill(name, files) {
  const target = join(SKILLS_DIR, name);
  await rm(target, { recursive: true, force: true });
  for (const [path, bytes] of files) {
    const file = join(target, path);
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, bytes);
  }
}

export async function installAgentSkills() {
  const { skills } = JSON.parse(await readFile(LOCKFILE, "utf8"));
  const isCheckOnly = process.argv.includes("--check");
  const failures = [];
  let written = 0;

  for (const [name, entry] of Object.entries(skills)) {
    const { dir, paths } = await pathsFor(entry);
    const files = await fetchFiles(entry, dir, paths);
    const digest = skillDigest(files);
    if (digest !== entry.contentHash) {
      failures.push(`${name} — recorded ${short(entry.contentHash)}…, upstream ${short(digest)}…`);
      console.log(`  ❌ ${name}  ${paths.length} file(s), digest differs — nothing written`);
      continue;
    }
    if (!isCheckOnly) {
      await writeSkill(name, files);
      written += 1;
    }
    console.log(`  ✅ ${name}  ${paths.length} file(s), digest matches`);
  }

  if (failures.length > 0) {
    console.log(`\n❌ ${failures.length} skill(s) do not match the lockfile:\n`);
    for (const failure of failures) console.log(`        ${failure}`);
    console.log(
      "\n        Upstream moved, or the lockfile is wrong. Nothing was written for these — on a\n" +
        "        machine carrying the intended set, re-record it with\n" +
        "        `pnpm skills:record`.\n",
    );
    return failures.length;
  }
  const verb = isCheckOnly ? "verified" : `installed into ${SKILLS_DIR}`;
  console.log(
    `\n✅ ${Object.keys(skills).length} skill(s) ${verb}${isCheckOnly ? "" : ` — ${written} written`}.`,
  );
  return 0;
}

process.exit((await installAgentSkills()) === 0 ? 0 : 1);
