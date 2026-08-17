#!/usr/bin/env node

// Fails when prose names a repository file inside a code span and that file does not exist.
//
// `check-docs.mjs` verifies that links and anchors resolve. A filename in a code span is
// neither, so `commitlint.config.js` sat in three documents — including the rule instructing
// people to reference it — while the file is `commitlint.config.mjs`. A pointer to the wrong
// filename is worse than the stale list it replaced, because it reads as authoritative.
//
// A span is treated as a repository reference only when its first path segment is something
// that exists at the repository root. That is what separates `scripts/check-docs.mjs` from
// `next/cache.js`, which is a module specifier resolved by Node rather than a path here.
// Globs and templates are skipped: `packages/*/src` and `<Name>.block.ts` name a shape.
//
// Usage: node scripts/check-file-refs.mjs [--check] [files...]

import { execFileSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SCAN_ROOTS = ["docs", ".claude", ".github", ".changeset", "packages"];
const TOP_LEVEL = new Set(readdirSync(ROOT));
const CODE_SPAN = /`([^`\n]+)`/g;
const EXTENSION = /\.(md|tsx?|m?[cj]s|jsonc?|ya?ml|grit|txt)$/;
const NOT_A_PATH = /[*<>{}()\s,|]|^@|^node:|^https?:/;

async function markdownFiles(dir, found = []) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return found;
  }
  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === "dist") continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) await markdownFiles(full, found);
    else if (entry.name.endsWith(".md")) found.push(full);
  }
  return found;
}

/** Root entries by stem, so `commitlint.config.js` can be recognised as meaning `.mjs`. */
const ROOT_STEMS = new Set([...TOP_LEVEL].map((name) => name.replace(EXTENSION, "")));

/**
 * True when a span names a path in this repository rather than a module or a shape.
 *
 * A span containing `/` qualifies when its first segment exists at the root — that is what
 * separates `scripts/check-docs.mjs` from `next/cache.js`, a specifier Node resolves.
 *
 * A span without `/` qualifies when a root entry shares its stem, which catches the observed
 * failure: naming a real root file with the wrong extension. A bare filename matching nothing
 * at the root is left alone, since prose says `index.ts` about many files that are not here.
 */
function isRepositoryPath(span) {
  if (NOT_A_PATH.test(span) || !EXTENSION.test(span)) return false;
  if (span.includes("/")) return TOP_LEVEL.has(span.split("/")[0]);
  return ROOT_STEMS.has(span.replace(EXTENSION, ""));
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
  const seen = new Set();
  const dangling = [];
  for (const [, span] of text.matchAll(CODE_SPAN)) {
    if (seen.has(span) || !isRepositoryPath(span)) continue;
    seen.add(span);
    if (!existsSync(join(ROOT, span)) && !isDeliberatelyAbsent(span)) dangling.push(span);
  }
  return dangling;
}

const explicit = process.argv.slice(2).filter((arg) => !arg.startsWith("--"));
const targets =
  explicit.length > 0
    ? explicit.map((file) => resolve(ROOT, file)).filter(existsSync)
    : [
        ...(await Promise.all(SCAN_ROOTS.map((root) => markdownFiles(join(ROOT, root))))).flat(),
        ...readdirSync(ROOT)
          .filter((name) => name.endsWith(".md"))
          .map((name) => join(ROOT, name)),
      ];

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
