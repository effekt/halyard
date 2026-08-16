#!/usr/bin/env node
// Flags documents that may have been left behind by a change they depend on.
//
// The failure this catches: a decision lands in one document, and every other document that
// describes the same thing keeps describing the old shape. Nothing breaks, the prose still
// reads as authoritative, and the only signal is a reader acting on it.
//
// The heuristic is link edges plus git time. If A links to B and B was committed after A was
// last touched, A is a candidate for review — it described B's subject at a moment that has
// since moved. This produces false positives (a link to a document that changed elsewhere)
// and that is the correct bias: a review costs a minute, a wrong document costs a decision.
//
// Freshness comes from git rather than a hand-maintained date, so there is nothing to forget
// and nothing that can lie. Uncommitted files are treated as current.
//
// Usage: node scripts/check-stale-docs.mjs [--check]

import { execFile } from "node:child_process";
import { readdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const run = promisify(execFile);
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SCAN_ROOTS = ["docs", ".claude/rules", "README.md", "AGENTS.md"];

/** Commit time of a file's last change, or null when it has never been committed. */
async function lastCommitted(file) {
  try {
    const { stdout } = await run("git", ["log", "-1", "--format=%ct", "--", file], { cwd: ROOT });
    const seconds = Number.parseInt(stdout.trim(), 10);
    return Number.isFinite(seconds) ? seconds : null;
  } catch {
    return null;
  }
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

const files = [];
for (const root of SCAN_ROOTS) {
  const full = join(ROOT, root);
  if (!existsSync(full)) continue;
  if (full.endsWith(".md")) files.push(full);
  else await walk(full, files);
}

const times = new Map();
for (const file of files) times.set(file, await lastCommitted(file));

const suspects = [];
for (const file of files) {
  const own = times.get(file);
  if (own === null) continue;

  const text = await readFile(file, "utf8");
  const seen = new Set();

  for (const match of text.matchAll(/\]\((?!https?:|mailto:|#)([^)\s#]+\.md)/g)) {
    const target = resolve(dirname(file), match[1]);
    if (target === file || seen.has(target)) continue;
    seen.add(target);

    const theirs = times.get(target);
    if (theirs !== null && theirs !== undefined && theirs > own) {
      const days = Math.round((theirs - own) / 86400);
      suspects.push({
        file: relative(ROOT, file),
        target: relative(ROOT, target),
        days,
      });
    }
  }
}

if (suspects.length === 0) {
  console.log(`✅ No documents trailing something they link to (${files.length} checked).`);
  process.exit(0);
}

console.log(
  `⚠️  ${suspects.length} document(s) may trail a change they depend on. Re-read each and\n` +
    `   either update it or touch it to record that it was reviewed.\n`,
);
for (const { file, target, days } of suspects) {
  const age = days === 0 ? "same day" : `${days}d later`;
  console.log(`  ${file}\n      links to ${target}, changed ${age}`);
}
console.log("");
process.exit(process.argv.includes("--check") ? 1 : 0);
