#!/usr/bin/env node

// Opens a GitHub issue only after searching the open set for overlap and checking the draft
// carries the four parts and a close condition.
//
// The count this prints is what makes the search worth believing. `gh issue list` returns 30
// when no `--limit` is passed, writes nothing to stderr, and gives no other sign it stopped
// early — against 57 open issues that is the newest half, and a duplicate search built on it
// reports "nothing similar" in exactly the words a complete search would use. So every run
// here passes an explicit limit, prints the size of the set it read, refuses when the list
// came back exactly full, and corroborates that size against a second count taken a different
// way.
//
// The corpus comes from `gh issue list` rather than `gh api repos/{owner}/{repo}/issues`,
// because the REST endpoint returns pull requests as issues — on `cli/cli`, 32 of the first
// 100 items it returns are pull requests. That inflates the corpus with text no issue search
// should rank against, and it does so only once a pull request is open, so a scaffold built on
// it measures correctly on the day it is written.
//
// An issue with no close condition is a plan wearing an issue's clothes: nothing states the
// state at which it is finished, so nothing ever closes it. See `.claude/rules/planning.md`.
//
// What this cannot catch: whether the paragraph under `## Reason` is a reason, and whether a
// high-scoring candidate is genuinely the same work. It checks that each part is present and
// carries content, and it puts the nearest issues in front of the author.
//
// Usage:
//   node scripts/scaffold-issue.mjs --template > draft.md
//   node scripts/scaffold-issue.mjs --body-file draft.md --title "…" [--label enhancement]
//   node scripts/scaffold-issue.mjs --body-file draft.md --title "…" --open

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

/** Well above the open set, so a full-length result means something is wrong rather than large. */
const DEFAULT_LIMIT = 200;
const NEAREST_SHOWN = 5;
/** Sits in the gap between a restated issue and an unrelated one. It labels; it never filters. */
const CANDIDATE_SCORE = 0.2;
const MIN_SECTION_CHARS = 40;
const MIN_TOKEN_LENGTH = 4;
/** A shared title term is the strongest signal two issues cover the same ground. */
const TITLE_WEIGHT = 3;
const PERCENT = 100;

const PARTS = ["cause", "reason", "decision", "choice"];
const CLOSE_HEADINGS = ["done when", "closes when", "closed when", "close condition"];
const PLACEHOLDER = /^(?:tbd|todo|n\/a|none|xxx|\.\.\.)\b/i;

const FLAGS = new Set(["open", "template", "help", "acknowledge-duplicates"]);

const STOPWORDS = new Set([
  "that",
  "this",
  "with",
  "from",
  "into",
  "have",
  "been",
  "them",
  "they",
  "then",
  "than",
  "what",
  "when",
  "which",
  "were",
  "will",
  "would",
  "there",
  "these",
  "those",
  "their",
  "here",
  "does",
  "each",
  "only",
  "over",
  "some",
  "such",
  "very",
  "also",
  "because",
  "about",
  "every",
  "still",
  "cannot",
  "nubbin",
]);

const TEMPLATE = `## Cause

What forced a decision here at all — a constraint, a failure, a thing that broke.

## Reason

Why this answer follows from that cause.

## Decision

What is being done, stated flatly.

## Choice

What this was chosen over, and why the alternative lost.

## Done when

The state at which this issue closes, written so someone else can tell whether it holds.
`;

const USAGE = `scaffold-issue — search the open issues, check the draft, then open it.

  --template                       print the skeleton to fill in
  --body-file <path>  --title "…"  search and check, opening nothing
  --label <name>                   repeatable
  --limit <n>                      how many open issues to read (default ${DEFAULT_LIMIT})
  --repo <owner/name>              defaults to the repository you are in
  --open                           create it, once the search and the checks pass
  --acknowledge-duplicates         open despite a candidate the search surfaced
`;

function camelCase(key) {
  return key.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

function parseArgs(argv) {
  const args = { labels: [] };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith("--")) continue;
    const key = arg.slice(2);
    if (FLAGS.has(key)) {
      args[camelCase(key)] = true;
      continue;
    }
    const value = argv[index + 1] ?? "";
    index += 1;
    if (key === "label") args.labels.push(value);
    else args[camelCase(key)] = value;
  }
  return args;
}

/** Every `##`-or-deeper heading mapped to the text beneath it, in document order. */
function sections(text) {
  const found = new Map();
  let current = null;
  for (const line of text.split("\n")) {
    const heading = /^#{2,6}\s+(.*\S)\s*$/.exec(line);
    if (heading) {
      current = heading[1];
      found.set(current, "");
      continue;
    }
    if (current !== null) found.set(current, `${found.get(current)}${line}\n`);
  }
  return found;
}

function normalizeHeading(heading) {
  return heading.toLowerCase().replace(/[`*_]/g, "").trim();
}

function findSection(map, matches) {
  for (const [heading, body] of map) {
    if (matches(normalizeHeading(heading))) return body;
  }
  return null;
}

/** A heading is that part when it is the word itself or the word followed by a qualifier. */
function partMatcher(part) {
  return (heading) => heading === part || heading.startsWith(`${part} `);
}

function closeMatcher() {
  return (heading) => CLOSE_HEADINGS.some((alias) => heading.startsWith(alias));
}

/**
 * A heading with nothing under it satisfies a search for the heading and answers none of the
 * question it names, which is the same defect as a gate that scans zero files.
 */
function sectionProblem(label, body) {
  if (body === null) return `no "## ${label}" section`;
  const content = body.replace(/\s+/g, " ").trim();
  if (content.length < MIN_SECTION_CHARS) {
    return `"${label}" carries ${content.length} characters — a heading with nothing under it is not a part`;
  }
  if (PLACEHOLDER.test(content)) return `"${label}" is a placeholder`;
  return null;
}

function titleCase(word) {
  return `${word[0].toUpperCase()}${word.slice(1)}`;
}

function validateDraft(text) {
  const map = sections(text);
  const problems = [];
  for (const part of PARTS) {
    const problem = sectionProblem(titleCase(part), findSection(map, partMatcher(part)));
    if (problem !== null) problems.push(problem);
  }
  const closing = sectionProblem("Done when", findSection(map, closeMatcher()));
  if (closing !== null) {
    problems.push(
      `${closing} — an issue without a close condition is a plan wearing an issue's clothes`,
    );
  }
  return problems;
}

function runGh(args) {
  return execFileSync("gh", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
}

/**
 * A search that could not run must not read as a search that found nothing, so a failed `gh`
 * call ends the run rather than returning an empty set into the ranking.
 */
function gh(args) {
  try {
    return runGh(args);
  } catch (error) {
    const detail = error.stderr?.toString().trim() || error.message;
    console.log(
      `\n❌ \`gh ${args[0]} ${args[1]}\` failed, so nothing was searched.\n\n  ${detail}\n`,
    );
    process.exit(1);
  }
}

function currentRepo() {
  return gh(["repo", "view", "--json", "nameWithOwner", "-q", ".nameWithOwner"]).trim();
}

function openIssues(repo, limit) {
  const fields = "number,title,body,labels,url";
  const raw = gh([
    "issue",
    "list",
    "--repo",
    repo,
    "--state",
    "open",
    "--limit",
    String(limit),
    "--json",
    fields,
  ]);
  return JSON.parse(raw);
}

/**
 * A second count of the same set, taken through the search index rather than the issues
 * connection. Two numbers that agree are what turn "57" from an assertion into a measurement.
 */
function corroboratedCount(repo) {
  try {
    const raw = runGh([
      "api",
      "-X",
      "GET",
      "search/issues",
      "-f",
      `q=repo:${repo} is:issue is:open`,
      "-q",
      ".total_count",
    ]);
    return Number.parseInt(raw.trim(), 10);
  } catch {
    return null;
  }
}

function tokens(text) {
  const found = new Set();
  for (const word of text.toLowerCase().split(/[^a-z0-9]+/)) {
    const stem = word.endsWith("s") ? word.slice(0, -1) : word;
    if (stem.length >= MIN_TOKEN_LENGTH && !STOPWORDS.has(stem)) found.add(stem);
  }
  return found;
}

/** How many open issues each term appears in, so common vocabulary stops dominating the rank. */
function termFrequency(issues) {
  const frequency = new Map();
  for (const issue of issues) {
    for (const token of tokens(`${issue.title} ${issue.body ?? ""}`)) {
      frequency.set(token, (frequency.get(token) ?? 0) + 1);
    }
  }
  return frequency;
}

function weightOf(token, frequency, total) {
  return Math.log(1 + total / (1 + (frequency.get(token) ?? 0)));
}

function emphasisOf(token, titleTokens) {
  return titleTokens.has(token) ? TITLE_WEIGHT : 1;
}

/**
 * Title terms carry the weight on both sides. Two issues sharing a word in their titles are
 * about the same thing far more often than two sharing it somewhere in their bodies, where
 * every issue in this repository says "version", "path" and "publish" eventually.
 */
function scoreAgainst(draft, issue, frequency, total) {
  const titleTokens = tokens(issue.title);
  const bodyTokens = tokens(issue.body ?? "");
  const shared = [];
  let score = 0;
  let ceiling = 0;
  for (const token of draft.all) {
    const weight = weightOf(token, frequency, total) * emphasisOf(token, draft.title);
    ceiling += weight * TITLE_WEIGHT;
    if (!titleTokens.has(token) && !bodyTokens.has(token)) continue;
    score += weight * emphasisOf(token, titleTokens);
    shared.push(token);
  }
  return { issue, shared, score: ceiling === 0 ? 0 : score / ceiling };
}

function rank(title, body, issues) {
  const draft = { title: tokens(title), all: tokens(`${title}\n${body}`) };
  const frequency = termFrequency(issues);
  return issues
    .map((issue) => scoreAgainst(draft, issue, frequency, issues.length))
    .sort((left, right) => right.score - left.score)
    .slice(0, NEAREST_SHOWN);
}

function describeCorroboration(repo, count) {
  const second = corroboratedCount(repo);
  if (second === null) return "second count unavailable — the search endpoint did not answer";
  if (second > count) return `DISAGREES: search/issues reports ${second}, this read ${count}`;
  if (second < count) return `search/issues reports ${second}, behind this run's ${count}`;
  return `corroborated by search/issues: ${second}`;
}

function reportNearest(nearest) {
  for (const { issue, score, shared } of nearest) {
    const percent = Math.round(score * PERCENT);
    const mark = score >= CANDIDATE_SCORE ? "CANDIDATE" : "         ";
    console.log(`  ${mark}  ${percent}%  #${issue.number}  ${issue.title}`);
    console.log(`             shared: ${shared.slice(0, 12).join(", ") || "nothing"}`);
  }
}

function createIssue(repo, args, bodyFile) {
  const command = [
    "issue",
    "create",
    "--repo",
    repo,
    "--title",
    args.title,
    "--body-file",
    bodyFile,
  ];
  for (const label of args.labels) command.push("--label", label);
  console.log(gh(command).trim());
}

/** The command the operator would run, so a dry run ends with something they can act on. */
function printCommand(repo, args, bodyFile) {
  const labels = args.labels.map((label) => ` --label ${label}`).join("");
  console.log(
    `\nTo open it:\n  gh issue create --repo ${repo} --title ${JSON.stringify(args.title)} --body-file ${bodyFile}${labels}`,
  );
}

/** A limit that is not a number would reach `gh` as one, where the default silently applies. */
function parseLimit(value) {
  const limit = Number.parseInt(value ?? String(DEFAULT_LIMIT), 10);
  if (!Number.isInteger(limit) || limit < 1) {
    console.log(`\n❌ --limit takes a positive integer, not ${JSON.stringify(value)}.\n`);
    process.exit(1);
  }
  return limit;
}

function requireArgs(args) {
  const missing = [];
  if (!args.bodyFile) missing.push("--body-file <path>");
  if (!args.title) missing.push('--title "…"');
  if (missing.length > 0) {
    console.log(`❌ Missing: ${missing.join(", ")}. Start from \`--template\`.`);
    process.exit(1);
  }
}

/** Fails rather than ranking against a set that may have been cut off mid-read. */
function requireWholeSet(issues, limit, corroboration) {
  const problems = [];
  if (issues.length >= limit) {
    problems.push(`the list returned exactly the limit (${limit}) — raise --limit and re-run`);
  }
  if (corroboration.startsWith("DISAGREES")) problems.push(corroboration);
  if (problems.length === 0) return;
  console.log("\n❌ The set this searched cannot be trusted:\n");
  for (const problem of problems) console.log(`  ${problem}`);
  process.exit(1);
}

function reportProblems(problems) {
  if (problems.length === 0) return;
  console.log(`\n❌ ${problems.length} problem(s) with the draft — nothing was opened.\n`);
  for (const problem of problems) console.log(`  ${problem}`);
  console.log("\n  See .claude/rules/prose.md for the four parts, .claude/rules/planning.md for");
  console.log("  why the close condition is not optional.\n");
  process.exit(1);
}

function finish(repo, args, nearest) {
  const candidates = nearest.filter((entry) => entry.score >= CANDIDATE_SCORE);
  if (!args.open) {
    printCommand(repo, args, args.bodyFile);
    return;
  }
  if (candidates.length > 0 && !args.acknowledgeDuplicates) {
    const numbers = candidates.map((entry) => `#${entry.issue.number}`).join(", ");
    console.log(`\n❌ ${numbers} may already cover this. Say so with --acknowledge-duplicates.\n`);
    process.exit(1);
  }
  createIssue(repo, args, args.bodyFile);
}

const args = parseArgs(process.argv.slice(2));

if (args.template) {
  console.log(TEMPLATE);
  process.exit(0);
}

if (args.help) {
  console.log(USAGE);
  process.exit(0);
}

requireArgs(args);

const body = readFileSync(args.bodyFile, "utf8");
const repo = args.repo ?? currentRepo();
const limit = parseLimit(args.limit);
const issues = openIssues(repo, limit);
const corroboration = describeCorroboration(repo, issues.length);

console.log(
  `\nSearched ${issues.length} open issues in ${repo} (--limit ${limit}; ${corroboration}).`,
);
requireWholeSet(issues, limit, corroboration);

const nearest = rank(args.title, body, issues);
console.log(`\nNearest ${nearest.length} of ${issues.length}, by weighted term overlap:\n`);
reportNearest(nearest);

reportProblems(validateDraft(body));
console.log(`\n✅ Draft carries all four parts and a close condition.`);
finish(repo, args, nearest);
