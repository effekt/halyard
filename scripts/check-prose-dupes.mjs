#!/usr/bin/env node

// Fails when the same claim is written into two prose files, or twice into one.
//
// A claim about a marker collision went into an issue comment, a pull request body and a rule
// file before anyone checked it. It was wrong. One copy would have been one correction; three
// were three, and the rule file would have outlived the other two. Duplicated prose reads as
// emphasis rather than as duplication, so a reviewer sees two correct-looking sentences instead
// of one claim in two places.
//
// `jscpd` cannot answer this question. Pointed at raw markdown it returns a real number for the
// wrong thing: every clone it finds anchors on ```markdown fences and on the
// `<!-- WRONG — … -->` / `<!-- CORRECT — … -->` scaffolding every rule file uses to show a wrong
// and a right example, and one clone matched a file against itself at identical line ranges.
// That shape is the house style, not a duplicated claim. So the prose is extracted first —
// frontmatter, fenced blocks, HTML comments and tables removed — and the measurement runs on
// what a reader would actually read.
//
// Matching is over word runs rather than lines, because a paragraph copied and re-wrapped shares
// no line with its original while being the same claim.
//
// Usage: node scripts/check-prose-dupes.mjs [--check] [--min-run=N]

import { existsSync } from "node:fs";
import { readdir, readFile, realpath } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * The surfaces a claim can live on. `AGENTS.md` is resolved through its real path so the
 * `CLAUDE.md` symlink beside it cannot enter the corpus as a second file and read as a perfect
 * clone of it.
 */
const SCAN = ["docs", "AGENTS.md"];

/**
 * The shortest run of identical words counted as a copy.
 *
 * Chosen by sweeping the extracted corpus and reading every hit, not by picking a round number:
 *
 * ```
 *   8 words   37 clones   3.90%      10 words   24 clones   2.82%
 *  12 words   10 clones   1.39%      15 words    3 clones   0.48%
 *  20 words    2 clones   0.31%      25 words    0 clones   0.00%
 * ```
 *
 * At 10 and below the hits include a section heading two rule files share and stock sentences
 * about how a gate runs — recurrence that is the repository's voice, not a claim in two homes.
 * At 12 every hit is one claim written into two documents. Twelve is where that boundary
 * measured, so twelve is the setting; anything longer would trade real coverage for the comfort
 * of a smaller number.
 */
const MIN_RUN_WORDS = 12;

/**
 * The duplicated words the corpus is allowed to hold: none. Each of the ten claims that used to
 * live in two documents now has one home and a link from every other mention (#186), so zero is
 * a measurement rather than an aspiration.
 *
 * A word count rather than a percentage, because a share moves when the corpus grows: adding an
 * unrelated document lowers the denominator and silently widens the allowance. Any figure above
 * the measured one is headroom, and headroom is a waiver — `.claude/rules/gates.md` rejects
 * raising a threshold to accommodate a hit, so a clone that appears gets a home and a link.
 *
 * Every clone is at least `MIN_RUN_WORDS` on each side, so a copied claim arrives 24 words at a
 * time and cannot arrive quietly.
 */
const MAX_DUPLICATED_WORDS = 0;

const FENCE = /^\s*(?:```|~~~)/;
const TABLE_ROW = /^\s*\|/;
const LINK_TARGET = /\]\([^)]*\)/g;
const COMMENT = /<!--[\s\S]*?-->/g;
const WORD = /[a-z0-9][a-z0-9'-]*/g;
const CLOSE = "-->";

/** Markdown only — the corpus is prose, and a `.txt` or a `.json` beside it is not. */
async function walk(dir, found) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) await walk(full, found);
    else if (entry.name.endsWith(".md")) found.push(await realpath(full));
  }
  return found;
}

/** Every prose file under `SCAN`, deduplicated by real path so a symlink counts once. */
async function corpusFiles() {
  const found = [];
  for (const target of SCAN) {
    const full = join(ROOT, target);
    if (!existsSync(full)) continue;
    if (full.endsWith(".md")) found.push(await realpath(full));
    else await walk(full, found);
  }
  return [...new Set(found)].sort();
}

/** The index of a document's closing frontmatter fence, or -1 where it has none. */
function frontmatterEnd(lines) {
  return lines[0]?.trim() === "---" ? lines.indexOf("---", 1) : -1;
}

/** Resumes a comment opened on an earlier line, returning whatever follows its close. */
function resumeComment(line, state) {
  const close = line.indexOf(CLOSE);
  if (close === -1) return "";
  state.inComment = false;
  return line.slice(close + CLOSE.length);
}

/** Drops closed comments, and opens a multi-line one where a `<!--` has no close on its line. */
function dropComments(line, state) {
  const closed = line.replace(COMMENT, "");
  const open = closed.indexOf("<!--");
  if (open === -1) return closed;
  state.inComment = true;
  return closed.slice(0, open);
}

/**
 * One line's prose, or "" where the whole line is quoted material.
 *
 * A table is stripped with the fences and comments: its cells are labels and fragments, and two
 * tables listing the same set of gates match on the set rather than on any claim about it.
 */
function proseOf(line, state) {
  if (state.inFence) {
    state.inFence = !FENCE.test(line);
    return "";
  }
  if (FENCE.test(line)) {
    state.inFence = true;
    return "";
  }
  const afterComment = state.inComment ? resumeComment(line, state) : line;
  if (TABLE_ROW.test(afterComment)) return "";
  return dropComments(afterComment, state).replace(LINK_TARGET, "]");
}

/** A document as one prose string per line, "" for every line the extraction removed. */
function extractProse(text) {
  const lines = text.split("\n");
  const state = { inFence: false, inComment: false };
  const opens = frontmatterEnd(lines);
  return lines.map((line, index) => (index <= opens ? "" : proseOf(line, state)));
}

/** Every word of a document's prose, each carrying the line it was read from. */
function tokenize(prose, file) {
  const tokens = [];
  prose.forEach((line, index) => {
    for (const word of line.toLowerCase().matchAll(WORD)) {
      tokens.push({ word: word[0], file, line: index + 1 });
    }
  });
  return tokens;
}

/**
 * Every file's tokens in one array, separated by a marker unique to the boundary it sits on.
 * A window spanning two documents therefore contains a word that occurs exactly once and can
 * never match, which is what keeps a clone inside a single file's text. The `#` cannot begin
 * a word `WORD` produces, so no real token can collide with one.
 */
function joinCorpus(scanned) {
  const all = [];
  for (const file of scanned) {
    all.push(...file.tokens);
    all.push({ word: `#end ${file.rel}`, file: file.rel, line: 0 });
  }
  return all;
}

/** How far two matching windows stay identical, without the later one overrunning the earlier. */
function runLength(all, earlier, later, minRun) {
  let length = minRun;
  while (
    later + length < all.length &&
    earlier + length < later &&
    all[earlier + length].word === all[later + length].word
  ) {
    length += 1;
  }
  return length;
}

/** The window of `minRun` words starting at `at`, as a single comparable key. */
function windowKey(all, at, minRun) {
  let key = "";
  for (let offset = 0; offset < minRun; offset += 1) key += `${all[at + offset].word} `;
  return key;
}

/**
 * Every maximal run of words that occurs twice, and the set of positions any of them covers.
 *
 * A window is only matched against one that ends before it starts, so a phrase repeated inside
 * its own window cannot report itself — the failure mode that had `jscpd` matching
 * `documentation.md` against itself at identical line ranges.
 */
function findClones(all, minRun) {
  const seen = new Map();
  const runs = [];
  const covered = new Set();
  let at = 0;
  while (at + minRun <= all.length) {
    const key = windowKey(all, at, minRun);
    const earlier = seen.get(key);
    if (earlier === undefined || earlier + minRun > at) {
      if (earlier === undefined) seen.set(key, at);
      at += 1;
      continue;
    }
    const length = runLength(all, earlier, at, minRun);
    runs.push({ earlier, later: at, length });
    for (let offset = 0; offset < length; offset += 1)
      covered.add(earlier + offset).add(at + offset);
    at += length;
  }
  return { runs, covered };
}

/** A clone side as `path:first-last`, using the line numbers of the file it came from. */
function where(all, at, length) {
  const start = all[at];
  const end = all[at + length - 1];
  return `${start.file}:${start.line}-${end.line}`;
}

/** The duplicated words themselves, so the reader can see which claim was copied. */
function quote(all, at, length) {
  const words = [];
  for (let offset = 0; offset < length; offset += 1) words.push(all[at + offset].word);
  return words.join(" ");
}

/** Printed on a pass too: a budget whose contents nobody sees is a waiver. */
function report(all, runs) {
  for (const run of runs) {
    const sides = `${where(all, run.earlier, run.length)}  ≡  ${where(all, run.later, run.length)}`;
    console.log(`   ${sides}`);
    console.log(`        ${run.length} words: ${quote(all, run.earlier, run.length)}`);
  }
}

const args = process.argv.slice(2);
const minRun = Number(args.find((arg) => arg.startsWith("--min-run="))?.slice(10) ?? MIN_RUN_WORDS);

const files = await corpusFiles();
const scanned = await Promise.all(
  files.map(async (file) => {
    const rel = relative(ROOT, file);
    const prose = extractProse(await readFile(file, "utf8"));
    return { rel, prose, tokens: tokenize(prose, rel) };
  }),
);

const total = (pick) => scanned.reduce((sum, file) => sum + pick(file), 0);
const words = total((file) => file.tokens.length);
const kept = total((file) => file.prose.filter(Boolean).length);
const stripped = total((file) => file.prose.length) - kept;

const all = joinCorpus(scanned);
const { runs, covered } = findClones(all, minRun);
const share = words === 0 ? 0 : (covered.size / words) * 100;

// A gate that found nothing and a gate that ran nothing print the same tick, so this says what
// it read before it says what it concluded.
const examined =
  `${files.length} file(s), ${kept} prose line(s) compared, ${stripped} line(s) of frontmatter, ` +
  `fence, comment and table stripped, ${words} words, ${runs.length} clone(s), ` +
  `${covered.size} duplicated word(s), ${share.toFixed(2)}%, at a run length of ${minRun} words`;

const limit = "Catches copied claims, not one claim written twice in different words.";
const budget = `budget ${MAX_DUPLICATED_WORDS} word(s)`;

if (covered.size <= MAX_DUPLICATED_WORDS) {
  console.log(`✅ Prose duplication within budget — ${examined}, ${budget}.`);
  report(all, runs);
  console.log(`   ${limit}`);
  process.exit(0);
}

console.log(`\n❌ Prose duplication over budget — ${examined}, ${budget}.\n`);
report(all, runs);
console.log(
  `\n        → a claim lives in one file; everywhere else links to it\n` +
    `        ${limit} See .claude/rules/documentation.md\n`,
);
process.exit(args.includes("--check") ? 1 : 0);
