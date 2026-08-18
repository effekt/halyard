#!/usr/bin/env node

// Fails when prose names a repository file inside a code span and that file does not exist.
//
// `check-docs.mjs` verifies that links and anchors resolve. A filename in a code span is
// neither, so `commitlint.config.js` sat in three documents — including the rule instructing
// people to reference it — while the file is `commitlint.config.mjs`. A pointer to the wrong
// filename is worse than the stale list it replaced, because it reads as authoritative.
//
// A span is treated as a repository reference only when its first path segment exists at the
// repository root or beside the document naming it, so `src/app/page.tsx` in a package README
// anchors to that package. That is what separates `scripts/check-docs.mjs` from
// `next/cache.js`, which is a module specifier resolved by Node rather than a path here.
// Globs and templates are skipped: `packages/*/src` and `<Name>.block.ts` name a shape.
//
// Beyond it: a bare filename naming a file deeper in the same package, because its only
// possible anchor is the existence test itself, and a gate anchored there can never fail.
//
// Usage: node scripts/check-file-refs.mjs [--check] [files...]

import { execFileSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { trackedFiles } from "./trackedFiles.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const TOP_LEVEL = new Set(readdirSync(ROOT));
const CODE_SPAN = /`([^`\n]+)`/g;
const EXTENSION = /\.(md|tsx?|m?[cj]s|jsonc?|ya?ml|grit|txt)$/;
const NOT_A_PATH = /[*<>{}()\s,|]|^@|^node:|^https?:/;

/** Root entries by stem, so `commitlint.config.js` can be recognised as meaning `.mjs`. */
const ROOT_STEMS = new Set([...TOP_LEVEL].map((name) => name.replace(EXTENSION, "")));

/** Entry names per directory, memoised so the gate reads each directory once, not per span. */
const DIR_ENTRIES = new Map();
function entriesOf(dir) {
  let entries = DIR_ENTRIES.get(dir);
  if (entries === undefined) {
    try {
      entries = new Set(readdirSync(dir));
    } catch {
      entries = new Set();
    }
    DIR_ENTRIES.set(dir, entries);
  }
  return entries;
}

const DIR_STEMS = new Map();
function stemsOf(dir) {
  let stems = DIR_STEMS.get(dir);
  if (stems === undefined) {
    stems = new Set([...entriesOf(dir)].map((name) => name.replace(EXTENSION, "")));
    DIR_STEMS.set(dir, stems);
  }
  return stems;
}

/**
 * The directories a span is anchored to — empty when it names a module or a shape rather
 * than a path in this repository. Existence is later checked against exactly these, so a
 * span anchored only beside its document still fails when the file exists only at the root:
 * a coincidental hit elsewhere would pass a reference that is wrong where it stands.
 *
 * A span containing `/` anchors where its first segment is an entry — that is what
 * separates `scripts/check-docs.mjs` from `next/cache.js`, a specifier Node resolves.
 *
 * A span without `/` anchors where an entry shares its stem, which catches the observed
 * failure: naming a real file with the wrong extension. A bare filename matching nothing
 * is left alone, since prose says `index.ts` about many files that are not here.
 */
function anchorsOf(span, base) {
  if (NOT_A_PATH.test(span) || !EXTENSION.test(span)) return [];
  const slashed = span.includes("/");
  const key = slashed ? span.split("/")[0] : span.replace(EXTENSION, "");
  const anchors = [];
  if ((slashed ? TOP_LEVEL : ROOT_STEMS).has(key)) anchors.push(ROOT);
  if (base !== ROOT && (slashed ? entriesOf(base) : stemsOf(base)).has(key)) anchors.push(base);
  return anchors;
}

/**
 * True when git would ignore the path. A gitignored file is absent on purpose — the vendor
 * term list is documented precisely because publishing a denylist defeats it — so naming one
 * in prose is correct, and an escape comment would only record that the gate is too blunt.
 */
function isDeliberatelyAbsent(span) {
  try {
    execFileSync("git", ["check-ignore", "-q", span], { cwd: ROOT, stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

async function danglingRefs(file) {
  const text = await readFile(file, "utf8");
  const base = dirname(file);
  const seen = new Set();
  const dangling = [];
  for (const [, span] of text.matchAll(CODE_SPAN)) {
    if (seen.has(span)) continue;
    const anchors = anchorsOf(span, base);
    if (anchors.length === 0) continue;
    seen.add(span);
    const found = anchors.some((dir) => existsSync(join(dir, span)));
    if (!found && !isDeliberatelyAbsent(span)) dangling.push(span);
  }
  return dangling;
}

const explicit = process.argv.slice(2).filter((arg) => !arg.startsWith("--"));
const targets =
  explicit.length > 0
    ? explicit.map((file) => resolve(ROOT, file)).filter(existsSync)
    : trackedFiles(ROOT)
        .filter((path) => path.endsWith(".md"))
        .map((path) => join(ROOT, path));

const offenders = [];
for (const file of targets) {
  const dangling = await danglingRefs(file);
  if (dangling.length > 0) offenders.push({ file: relative(ROOT, file), dangling });
}

if (offenders.length === 0) {
  console.log(
    `✅ Every repository file named in prose exists — ${targets.length} file(s) checked.`,
  );
  process.exit(0);
}

console.log(
  "❌ Prose names a repository file that does not exist. A pointer to the wrong filename\n" +
    "   reads as authoritative, which makes it worse than the stale text it replaced.\n",
);
for (const { file, dangling } of offenders) {
  console.log(`  ${file}`);
  for (const span of dangling) console.log(`        ${span}`);
  console.log("");
}

process.exit(process.argv.includes("--check") ? 1 : 0);
