#!/usr/bin/env node
// Rejects two prose failures a reader cannot recover from.
//
// The first is an appeal to a measurement nobody outside the room can open — "77 of the
// design system's 122 components expose className". It reads as evidence and functions as
// authority, but a reader cannot check it, argue with it, or reuse it, and it silently dates
// the document to one sample taken once. The conclusion is almost always still true; it just
// has to be argued from why it holds. Public sources are fine and deliberately not matched: a
// named library's documented behaviour, a spec section, a numbered issue in a public tracker.
//
// The second is a reference to what a thing used to be. Git holds the past; a reader spends
// context on it and gets nothing back, and the note outlives everyone who understood why it
// was written. A rejected alternative is not this: "X, not Y, because Z" is the reason for the
// decision and belongs on the page.
//
// The third is a promise about future work. Prose cannot track it, nobody deletes it when it
// stops being true, and an issue does both.
//
// The fourth is filler — words that signal confidence rather than supply it. Each one marks a
// sentence the author had not finished thinking through.
//
// Everything subjective is deliberately NOT here. Whether a decision records the alternative
// it beat, whether a reversal swept every section arguing the old position, whether a
// paragraph is deliberation rather than design — those need judgment, and a regex that guesses
// at them produces false positives until people learn to ignore the gate. They belong to the
// PostToolUse prose reviewer and to `.claude/rules/prose.md`.
//
// Usage: node scripts/check-prose.mjs [files...] [--check]

import { readdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, relative, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SCAN_ROOTS = ["docs", ".claude/rules", ".claude/skills"];
const EXEMPT_LINE = /<!--\s*prose-ok\s*-->/;

/**
 * A claim resting on a corpus a reader cannot open. Each pattern targets the *appeal* rather
 * than the number, so thresholds and versions ("1% duplication", "Node 22+") never match.
 */
const UNVERIFIABLE = [
  [/\b\d+\s+of\s+(?:the\s+|its\s+)?\d+\b/, "a count from a corpus a reader cannot open"],
  [/\b\d+(?:\.\d+)?%\s+of\s+\w+/, "a proportion of a private corpus"],
  [/\bproduction corpus\b/i, "an appeal to a corpus nobody else can open"],
  [/\bin one (?:audited|production|real|measured)\b/i, "an unciteable sample of one"],
  [/\b(?:measured|audited) (?:across|in|over)\b/i, "a measurement a reader cannot reproduce"],
  [/\bcontent (?:dump|export)\b/i, "a private data export as evidence"],
  [
    /\b(?:roughly|approximately|about|~)\s*\d+\s+(?:real\s+|actual\s+)?(?:pages?|components?|blocks?|entries|models?|schemas?)\b/i,
    "a scale figure from a codebase a reader cannot see",
  ],
];

/**
 * References to what a thing used to be. Git holds the past; a reader does not need it, and
 * every line of it is context spent on something that no longer exists. A rejected
 * alternative is NOT this — "X, not Y, because Z" is the reason for the decision and stays.
 */
const HISTORICAL = [
  [/\ban earlier (?:draft|version|design)\b/i, "state the design, not the drafts before it"],
  [/\bused to be (?:called|named|known)\b/i, "git holds the old name"],
  [/\b(?:formerly|previously) (?:called|named|known as)\b/i, "git holds the old name"],
  [/\bwe (?:originally|initially|first) (?:chose|had|proposed|wrote)\b/i, "state what is true now"],
  [/\bthis (?:section|document) (?:predates|was written)\b/i, "delete it or rewrite it"],
  [/^#{1,6}\s+.*\b(?:historical|superseded)\b/i, "delete the section; git holds it"],
];

/**
 * Commitments to future work. A paragraph promising something is a promise nobody is tracking
 * and nobody will delete once it is wrong. Issues close; prose does not.
 */
const FUTURE = [
  [/\bTODO\b/, "open an issue"],
  [/\bcoming soon\b/i, "open an issue"],
  [/\bin a future (?:release|version|phase|iteration)\b/i, "open an issue"],
  [/\bwe (?:will|plan to|intend to) (?:add|build|ship|support)\b/i, "open an issue"],
  [/\bnot yet implemented\b/i, "open an issue, or say what the system does today"],
  [/\bplanned for (?:v?\d|later|a later)\b/i, "open an issue"],
];

/** Filler that signals confidence instead of supplying it. */
const FILLER = [
  [/\bin order to\b/i, "in order to → to"],
  [/\bit (?:should be noted|is worth noting) that\b/i, "delete — say the thing instead"],
  [/(?:^|\.\s+|,\s*)(?:Obviously|Clearly|Of course|Basically|Essentially|Arguably)\b/, "filler"],
  [/(?:^|\.\s+|,\s*)(?:Needless to say|That being said|At the end of the day)\b/, "filler"],
];

/** Fenced blocks, inline code, and link targets are quoted material, not the author's prose. */
function proseOnly(line) {
  return line
    .replace(/`[^`]*`/g, "")
    .replace(/\]\([^)]*\)/g, "]")
    .replace(/<!--[\s\S]*?-->/g, "");
}

async function walk(dir, found) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return found;
  }
  for (const entry of entries) {
    if (entry.name === "node_modules") continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) await walk(full, found);
    else if (entry.name.endsWith(".md")) found.push(full);
  }
  return found;
}

async function collectTargets(explicit) {
  if (explicit.length > 0) return explicit.map((file) => resolve(ROOT, file)).filter(existsSync);
  const found = (await readdir(ROOT, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => join(ROOT, entry.name));
  for (const root of SCAN_ROOTS) {
    const full = join(ROOT, root);
    if (existsSync(full)) await walk(full, found);
  }
  return [...new Set(found)];
}

const args = process.argv.slice(2);
const targets = await collectTargets(args.filter((arg) => !arg.startsWith("--")));

const hits = [];
for (const file of targets) {
  const lines = (await readFile(file, "utf8")).split("\n");
  let inFence = false;
  let inFrontmatter = false;

  lines.forEach((line, index) => {
    if (index === 0 && line.trim() === "---") {
      inFrontmatter = true;
      return;
    }
    if (inFrontmatter) {
      if (line.trim() === "---") inFrontmatter = false;
      return;
    }
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      return;
    }
    if (inFence || EXEMPT_LINE.test(line)) return;

    const text = proseOnly(line);
    for (const [pattern, why] of [...UNVERIFIABLE, ...HISTORICAL, ...FUTURE, ...FILLER]) {
      const match = pattern.exec(text);
      if (match) {
        hits.push(`${relative(ROOT, file)}:${index + 1}  ${why}\n      ${match[0].trim()}`);
        break;
      }
    }
  });
}

if (hits.length === 0) {
  console.log(`✅ Prose clean — ${targets.length} file(s) checked.`);
  process.exit(0);
}

console.log(
  `❌ ${hits.length} prose problem(s). Keep the conclusion, argue it from why it holds —\n` +
    `   or mark a deliberate exception with <!-- prose-ok -->. See .claude/rules/prose.md\n`,
);
for (const hit of hits) console.log(`  ${hit}`);
console.log("");
process.exit(args.includes("--check") ? 1 : 0);
