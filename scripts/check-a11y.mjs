#!/usr/bin/env node
// Rejects the accessibility failures that are settled by reading the markup — no browser, no
// rendered page, no judgment about what a picture shows or what a colour means.
//
// An accessibility defect is invisible to everyone it does not affect. Nobody on the team files
// it, the page looks finished, and the only signal is a person who cannot use it and does not
// report back. That asymmetry is why these belong in a gate rather than in review: the reviewer
// who would have caught them is the one who never sees the page.
//
// Five failures qualify. An `<img>` with no `alt` attribute at all leaves a screen reader
// announcing the file path — an empty `alt=""` is the correct, deliberate marking for a
// decorative image and is never flagged. An `alt` that is a filename or names the medium
// ("image", "logo") occupies the slot without filling it, which is worse than absent because
// nothing downstream can tell it is missing. `onClick` on a plain element is unreachable by
// keyboard and announced as nothing. A positive `tabIndex` reorders the whole document, not
// just its own element. An `<a>` with no `href` is not focusable and is not announced as a
// link. Removing the focus outline with no focus style near it makes the page unusable by
// keyboard while looking identical to everyone using a mouse.
//
// Everything requiring judgment is deliberately absent: whether alt text describes rather than
// names, whether a heading level was skipped, whether colour is the only carrier of a meaning,
// whether a `<button>` should have been an `<a>`. A regex guessing at those produces false
// positives until people learn to merge past the gate, which costs more than the gate returns.
// They belong to the `PostToolUse` accessibility reviewer and to `.claude/rules/accessibility.md`.
//
// A tag carrying a props spread is skipped entirely — `{...props}` can supply the very
// attribute being checked, and a gate that cannot see it must not guess.
//
// No dependencies, so it runs against a bare checkout in CI alongside the prose gates.
//
// Pass explicit paths to check those; pass none to scan SCAN_ROOTS. `--check` exits 1.

import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SCAN_ROOTS = ["packages", "apps", "examples"];
const JSX_EXT = /\.(tsx|jsx)$/;
const SCANNED_EXT = /\.(tsx|jsx|css)$/;
const EXCLUDED_DIRS = new Set(["node_modules", "dist", ".next", ".turbo", "generated"]);
const EXEMPT_LINE = /a11y-ok/;
const SNIPPET_CHARS = 96;
const FOCUS_WINDOW = 5;

const QUOTES = new Set(['"', "'", "`"]);
const SPREAD = /\{\s*\.\.\./;
const GENERIC_ALT = new Set(["image", "photo", "picture", "icon", "logo", "graphic", "img"]);
const FILENAME_ALT = /\.(png|jpe?g|gif|svg|webp|avif|bmp|ico)$/i;
const TAB_INDEX = /tabindex\s*=\s*(?:\{\s*(-?\d+)\s*\}|"(-?\d+)")/i;

/** Elements the browser already makes focusable and announces with a role. */
const INTERACTIVE = new Set([
  "a",
  "area",
  "audio",
  "button",
  "details",
  "dialog",
  "form",
  "input",
  "label",
  "option",
  "select",
  "summary",
  "textarea",
  "video",
]);

const OUTLINE_REMOVED = /outline\s*:\s*(?:none|0)\b|(?:^|[\s"'`:])outline-none\b/;
/** A focus style that paints something, so the outline is replaced rather than deleted. */
const FOCUS_RESTORED = /focus-visible|focus:ring|focus:outline-(?!none)|focus:(?:border|shadow)/;
const FOCUS_PAINTED = /(?:outline|box-shadow|border)\s*:(?!\s*(?:none|0)\b)/;

/** +1 entering a JSX expression container, -1 leaving one, 0 for everything else. */
function braceDepth(ch) {
  if (ch === "{") return 1;
  return ch === "}" ? -1 : 0;
}

/** The quote delimiter still open after `ch`, or "" outside a string. */
function nextQuote(quote, ch) {
  if (quote) return ch === quote ? "" : quote;
  return QUOTES.has(ch) ? ch : "";
}

/**
 * Offset of the `>` closing a tag, tracking braces and quotes. A naive scan to the first `>`
 * truncates at the arrow in `onClick={() => go()}` and then reports the `role` after it as
 * missing — the exact false positive this gate cannot afford.
 */
function tagEnd(text, start) {
  let depth = 0;
  let quote = "";
  for (let at = start; at < text.length; at += 1) {
    const ch = text[at];
    const next = nextQuote(quote, ch);
    if (quote || next) {
      quote = next;
      continue;
    }
    if (ch === ">" && depth === 0) return at;
    depth += braceDepth(ch);
  }
  return -1;
}

/** Every JSX opening tag as `{ name, attrs, index }`. */
function scanTags(text) {
  const tags = [];
  for (let at = 0; at < text.length; at += 1) {
    if (text[at] !== "<") continue;
    const opener = /^<([a-zA-Z][\w.]*)/.exec(text.slice(at, at + 64));
    if (!opener) continue;
    const start = at + opener[0].length;
    const end = tagEnd(text, start);
    if (end === -1) continue;
    tags.push({ name: opener[1], attrs: text.slice(start, end), index: at });
    at = end;
  }
  return tags;
}

function hasAttribute(attrs, name) {
  return new RegExp(`(?:^|[\\s{])${name}\\s*=`, "i").test(attrs);
}

function altProblem(attrs) {
  if (!hasAttribute(attrs, "alt")) {
    return '<img> with no alt — name what it shows, or alt="" if it is decorative';
  }
  const literal = /(?:^|\s)alt\s*=\s*"([^"]*)"/.exec(attrs);
  const value = literal?.[1].trim().toLowerCase() ?? "";
  if (value === "") return null;
  if (FILENAME_ALT.test(value)) return `alt="${literal[1]}" is a filename, not a name`;
  return GENERIC_ALT.has(value) ? `alt="${literal[1]}" names the medium, not the content` : null;
}

function hrefProblem(attrs) {
  if (hasAttribute(attrs, "href")) return null;
  return "<a> with no href — not focusable, and not announced as a link";
}

function tabIndexProblem(attrs) {
  const match = TAB_INDEX.exec(attrs);
  const value = Number(match?.[1] ?? match?.[2]);
  if (!(value > 0)) return null;
  return `tabIndex={${value}} — a positive value reorders the whole page, not just this element`;
}

function clickProblem(name, attrs) {
  if (!/(?:^|\s)onClick\s*=/.test(attrs)) return null;
  if (!/^[a-z]/.test(name) || INTERACTIVE.has(name)) return null;
  if (hasAttribute(attrs, "role") || hasAttribute(attrs, "tabindex")) return null;
  return `onClick on <${name}> — unreachable by keyboard; use <button> or <a>`;
}

function tagProblems(name, attrs) {
  if (SPREAD.test(attrs)) return [];
  return [
    name === "img" ? altProblem(attrs) : null,
    name === "a" ? hrefProblem(attrs) : null,
    tabIndexProblem(attrs),
    clickProblem(name, attrs),
  ].filter((why) => why !== null);
}

function lineNumber(text, index) {
  let line = 1;
  for (let at = 0; at < index; at += 1) {
    if (text[at] === "\n") line += 1;
  }
  return line;
}

function snippetAt(lines, line) {
  return (lines[line - 1] ?? "").trim().slice(0, SNIPPET_CHARS);
}

function jsxProblems(text, lines) {
  const problems = [];
  for (const tag of scanTags(text)) {
    const line = lineNumber(text, tag.index);
    for (const why of tagProblems(tag.name, tag.attrs)) {
      problems.push({ line, why, snippet: snippetAt(lines, line) });
    }
  }
  return problems;
}

/**
 * Precision over recall: a `:focus` selector counts only when something within the window
 * paints, so `a:focus { outline: none }` is still caught while a replaced ring passes.
 */
function focusRestoredNear(lines, index) {
  const near = lines.slice(Math.max(0, index - FOCUS_WINDOW), index + FOCUS_WINDOW + 1).join("\n");
  return FOCUS_RESTORED.test(near) || (/:focus\b/.test(near) && FOCUS_PAINTED.test(near));
}

function outlineProblems(lines) {
  const problems = [];
  lines.forEach((line, index) => {
    if (!OUTLINE_REMOVED.test(line) || focusRestoredNear(lines, index)) return;
    problems.push({
      line: index + 1,
      why: "focus outline removed with no focus style near it",
      snippet: line.trim().slice(0, SNIPPET_CHARS),
    });
  });
  return problems;
}

/** An escape marks the line itself or the line above it, since a JSX tag spans several. */
function exempt(lines, line) {
  return [lines[line - 1], lines[line - 2]].some(
    (text) => text !== undefined && EXEMPT_LINE.test(text),
  );
}

function problemsIn(file, text) {
  const lines = text.split("\n");
  const found = JSX_EXT.test(file)
    ? [...jsxProblems(text, lines), ...outlineProblems(lines)]
    : outlineProblems(lines);
  return found.filter((problem) => !exempt(lines, problem.line));
}

async function walk(dir, found) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return found;
  }
  for (const entry of entries) {
    if (EXCLUDED_DIRS.has(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) await walk(full, found);
    else if (SCANNED_EXT.test(entry.name)) found.push(full);
  }
  return found;
}

async function collectTargets(explicit) {
  if (explicit.length > 0) {
    return explicit
      .map((file) => resolve(ROOT, file))
      .filter((file) => existsSync(file) && SCANNED_EXT.test(file));
  }
  const found = [];
  for (const root of SCAN_ROOTS) await walk(join(ROOT, root), found);
  return found;
}

const args = process.argv.slice(2);
const targets = await collectTargets(args.filter((arg) => !arg.startsWith("--")));

const hits = [];
for (const file of targets) {
  const text = await readFile(file, "utf8");
  const rel = relative(ROOT, file);
  for (const problem of problemsIn(file, text)) {
    hits.push(`${rel}:${problem.line}  ${problem.why}\n      ${problem.snippet}`);
  }
}

if (hits.length === 0) {
  console.log(`✅ Accessibility clean — ${targets.length} file(s) checked.`);
  process.exit(0);
}

console.log(
  `❌ ${hits.length} accessibility problem(s). Fix the markup —\n` +
    `   or mark a deliberate exception with // a11y-ok. See .claude/rules/accessibility.md\n`,
);
for (const hit of hits) console.log(`  ${hit}`);
console.log("");
process.exit(args.includes("--check") ? 1 : 0);
