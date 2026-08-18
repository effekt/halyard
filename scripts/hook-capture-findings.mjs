#!/usr/bin/env node
// SubagentStop capture: a subagent's findings exist only in its final report, and the caller is
// the only thing that can promote them. This reads the report at exit, routes each tagged
// finding to the surface `.claude/rules/subagent-findings.md` assigns it, and says what it saw —
// a capture that silently captures nothing reads exactly like one with nothing to capture.
//
// Usage: node scripts/hook-capture-findings.mjs [--dry-run]   (hook payload on stdin)

import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const FINDINGS_HEADING = /^#{1,6}\s+findings\b/i;
const ANY_HEADING = /^#{1,6}\s+/;
const TAGGED_BULLET = /^\s*[-*]\s*\[([a-z-]+)\]\s*(.+)$/i;
const UNTAGGED_BULLET = /^\s*[-*]\s+\S/;
const ROUTES = ["rule", "issue", "memory", "task-local"];

/** Shingle width, and the fraction of a memory's shingles that must appear in the rules. */
const SHINGLE_WORDS = 4;
const RESTATES_A_RULE = 0.1;

const SLUG_WORDS = 8;
const TITLE_LIMIT = 80;

/**
 * Every issue this opens goes through the same front door as one opened by hand, so one duplicate
 * search covers every arrival. Resolved beside this file rather than from the working directory,
 * because the hook runs in whichever worktree the session is in.
 */
const SCAFFOLD = fileURLToPath(new URL("./scaffold-issue.mjs", import.meta.url));

/** The scaffold's own sentence, so the count reported here is the count it read. */
const SEARCH_LINE = /^Searched \d+ open issues[^\n]*?(?=\.?$)/m;
const CANDIDATE_LINE = /^\s*CANDIDATE\s+\d+%\s+#(\d+)/gm;

const isDryRun = process.argv.includes("--dry-run");

function readStdin() {
  return new Promise((done) => {
    let raw = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => {
      raw += chunk;
    });
    process.stdin.on("end", () => done(raw));
  });
}

/** The prose of one transcript record — empty for anything that is not assistant text. */
function assistantText(line) {
  let record;
  try {
    record = JSON.parse(line);
  } catch {
    return "";
  }
  if (record?.type !== "assistant") return "";
  return (record.message?.content ?? [])
    .filter((block) => block?.type === "text")
    .map((block) => block.text)
    .join("");
}

/** The last assistant text in a subagent transcript, used when the payload carries no report. */
function lastAssistantText(transcriptPath) {
  if (!transcriptPath || !existsSync(transcriptPath)) return "";
  let text = "";
  for (const line of readFileSync(transcriptPath, "utf8").split("\n")) {
    const found = assistantText(line);
    if (found.trim()) text = found;
  }
  return text;
}

function reportFrom(payload) {
  const direct = payload?.last_assistant_message;
  if (typeof direct === "string" && direct.trim()) return direct;
  return lastAssistantText(payload?.agent_transcript_path);
}

/** Every line under the report's `## Findings` heading, up to the next heading. */
function findingLines(report) {
  const lines = report.split("\n");
  const start = lines.findIndex((line) => FINDINGS_HEADING.test(line));
  if (start === -1) return null;
  const rest = lines.slice(start + 1);
  const end = rest.findIndex((line) => ANY_HEADING.test(line));
  return end === -1 ? rest : rest.slice(0, end);
}

/** Attaches a continuation line to the finding it belongs to. */
function extend(findings, line) {
  const current = findings.at(-1);
  if (current) current.lines.push(line.trim());
}

function parseFindings(lines) {
  const findings = [];
  const unrouted = [];
  for (const line of lines) {
    const tagged = line.match(TAGGED_BULLET);
    if (tagged && ROUTES.includes(tagged[1].toLowerCase())) {
      findings.push({ route: tagged[1].toLowerCase(), lines: [tagged[2].trim()] });
    } else if (tagged) {
      unrouted.push(`unknown tag [${tagged[1]}]: ${tagged[2].trim()}`);
    } else if (UNTAGGED_BULLET.test(line)) {
      unrouted.push(`untagged: ${line.trim().replace(/^[-*]\s+/, "")}`);
    } else if (line.trim()) {
      extend(findings, line);
    }
  }
  return { findings, unrouted };
}

function headline(finding) {
  return finding.lines[0].replace(/\s+/g, " ").trim();
}

function slugFor(finding) {
  return (
    headline(finding)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim()
      .split(" ")
      .slice(0, SLUG_WORDS)
      .join("-") || "finding"
  );
}

function memoryDoc(finding, payload, slug) {
  return [
    "---",
    `name: ${slug}`,
    `description: ${headline(finding)}`,
    "metadata:",
    "  node_type: memory",
    "  type: feedback",
    `  originSessionId: ${payload.session_id ?? "unknown"}`,
    `  modified: ${new Date().toISOString()}`,
    "---",
    "",
    finding.lines.join("\n"),
    "",
    `Reported by a \`${payload.agent_type ?? "subagent"}\` agent at exit.`,
    "",
  ].join("\n");
}

/** A routing outcome carries the loss as a property, so nothing downstream parses a marker string. */
function routed(line) {
  return { line, wasLost: false };
}

function lostFinding(line) {
  return { line, wasLost: true };
}

function routeToMemory(finding, payload, memoryDir) {
  if (!memoryDir) return lostFinding("memory (no memory directory for this session — not written)");
  const slug = slugFor(finding);
  const file = join(memoryDir, `${slug}.md`);
  if (existsSync(file)) return routed(`memory (already present: ${slug}.md)`);
  if (isDryRun) return routed(`memory (dry run: would write ${file})`);
  return writeMemory(finding, payload, memoryDir, slug, file);
}

/** Guarded: an unwritable memory directory is a lost finding, not a crash that skips the ledger. */
function writeMemory(finding, payload, memoryDir, slug, file) {
  try {
    mkdirSync(memoryDir, { recursive: true });
    writeFileSync(file, memoryDoc(finding, payload, slug));
    const index = join(memoryDir, "MEMORY.md");
    const entry = `- [${headline(finding)}](${slug}.md)\n`;
    writeFileSync(index, existsSync(index) ? readFileSync(index, "utf8") + entry : entry);
  } catch (error) {
    return lostFinding(`memory (FAILED — not written: ${error.message})`);
  }
  return routed(`memory (${file})`);
}

/** An issue title cut at a word rather than mid-word, since it is read in a list. */
function titleFor(finding) {
  const full = headline(finding);
  if (full.length <= TITLE_LIMIT) return full;
  const cut = full.slice(0, TITLE_LIMIT);
  return `${cut.slice(0, cut.lastIndexOf(" "))}…`;
}

function issueBody(finding, payload, route) {
  const preamble =
    route === "rule"
      ? "Routed to a rule: this belongs in `.claude/rules/`, with a gate that has been seen to fail on the violation."
      : "Routed to an issue: a closable question.";
  return [
    preamble,
    "",
    finding.lines.join("\n"),
    "",
    `Reported by a \`${payload.agent_type ?? "subagent"}\` agent at exit, session ${payload.session_id ?? "unknown"}.`,
  ].join("\n");
}

/** The draft goes to a temporary directory, because a repository is not a scratchpad. */
function writeBodyFile(body) {
  const file = join(mkdtempSync(join(tmpdir(), "nubbin-capture-")), "finding.md");
  writeFileSync(file, `${body}\n`);
  return file;
}

/**
 * No label: this knows the tag a report carried and nothing about the surfaces a repository
 * labels by, and a wrong label is read as a decision someone made.
 */
function scaffoldArgs(title, bodyFile) {
  return [
    SCAFFOLD,
    "--body-file",
    bodyFile,
    "--title",
    title,
    "--open",
    "--acknowledge-duplicates",
    "--advisory-validation",
  ];
}

function candidatesIn(output) {
  return [...output.matchAll(CANDIDATE_LINE)].map((match) => `#${match[1]}`);
}

/** The last thing the scaffold printed: the issue's URL, or the reason it stopped. */
function lastLineOf(output) {
  return output.trim().split("\n").at(-1)?.trim() ?? "";
}

function describeOpened(route, searched, output) {
  const candidates = candidatesIn(output);
  const nearby = candidates.length > 0 ? `; may duplicate ${candidates.join(", ")}` : "";
  return `${route} (${searched}${nearby}; ${lastLineOf(output)})`;
}

/**
 * A finding that was never searched must not read as one that was, so a missing search line is
 * reported as loudly as a non-zero exit — it is the shape the defect would take on returning.
 */
function describeStopped(route, searched, output) {
  const why = searched ? "the scaffold opened nothing" : "NO DUPLICATE SEARCH RAN";
  return `${route} (FAILED — ${why}: ${lastLineOf(output) || "no output"})`;
}

function routeToIssue(finding, payload, route) {
  const title = titleFor(finding);
  if (isDryRun) return routed(`${route} (dry run: would scaffold "${title}")`);
  const bodyFile = writeBodyFile(issueBody(finding, payload, route));
  const run = spawnSync(process.execPath, scaffoldArgs(title, bodyFile), { encoding: "utf8" });
  const output = `${run.stdout ?? ""}${run.stderr ?? ""}${run.error?.message ?? ""}`;
  const searched = output.match(SEARCH_LINE)?.[0].trim() ?? null;
  if (run.status !== 0 || searched === null) {
    return lostFinding(describeStopped(route, searched, output));
  }
  return routed(describeOpened(route, searched, output));
}

function routeOne(finding, payload, memoryDir) {
  if (finding.route === "task-local") return routed("dropped (task-local)");
  if (finding.route === "memory") return routeToMemory(finding, payload, memoryDir);
  return routeToIssue(finding, payload, finding.route);
}

/** Lines the way `wc -l` counts them, so a reported total matches the shell. */
function countLines(text) {
  const parts = text.split("\n");
  return parts.at(-1) === "" ? parts.length - 1 : parts.length;
}

function normalizedWords(text) {
  return text
    .replace(/^---\n[\s\S]*?\n---\n/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);
}

function shingles(words) {
  const set = new Set();
  for (let index = 0; index + SHINGLE_WORDS <= words.length; index += 1) {
    set.add(words.slice(index, index + SHINGLE_WORDS).join(" "));
  }
  return set;
}

function markdownIn(dir) {
  if (!dir || !existsSync(dir) || !statSync(dir).isDirectory()) return [];
  return readdirSync(dir)
    .filter((name) => name.endsWith(".md"))
    .map((name) => join(dir, name))
    .filter((file) => statSync(file).isFile());
}

/** The rules a memory could be restating live in the checkout the session is working in. */
function rulesDirFrom(startDir) {
  let dir = resolve(startDir ?? process.cwd());
  for (;;) {
    const candidate = join(dir, ".claude", "rules");
    if (existsSync(candidate)) return candidate;
    const parent = dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

/**
 * How much of each memory is already stated in the rules. Shingle overlap, not meaning: the three
 * memories a reader calls restatements score 0.16–0.19 here and the next one scores 0.04, so the
 * threshold sits in an empty band rather than being tuned to produce a number.
 */
function leanness(memoryDir, rulesDir) {
  const files = markdownIn(memoryDir);
  const lines = files.reduce((total, file) => total + countLines(readFileSync(file, "utf8")), 0);
  const ruleShingles = shingles(
    markdownIn(rulesDir).flatMap((file) => normalizedWords(readFileSync(file, "utf8"))),
  );
  const scored = files.map((file) => {
    const own = shingles(normalizedWords(readFileSync(file, "utf8")));
    const shared = [...own].filter((shingle) => ruleShingles.has(shingle)).length;
    return { name: file.split("/").at(-1), score: own.size ? shared / own.size : 0 };
  });
  return {
    count: files.length,
    lines,
    restating: scored.filter((row) => row.score >= RESTATES_A_RULE),
  };
}

function leannessLine(memoryDir, rulesDir) {
  if (!memoryDir) return "memory: no memory directory resolved for this session";
  const { count, lines, restating } = leanness(memoryDir, rulesDir);
  const named = restating.map((row) => `${row.name} ${Math.round(row.score * 100)}%`).join(", ");
  const versus = rulesDir ? `also stated in ${rulesDir}` : "not compared — no .claude/rules found";
  const tail = restating.length ? `: ${named}` : "";
  return [
    `memory: ${count} file(s), ${lines} line(s) in ${memoryDir}`,
    `${restating.length} ${versus}${tail}`,
    "a memory is deleted when it becomes a repo rule",
  ].join("; ");
}

function tallyOf(findings) {
  return ROUTES.map((route) => {
    const total = findings.filter((finding) => finding.route === route).length;
    return total ? `${total} -> ${route === "task-local" ? "dropped (task-local)" : route}` : null;
  })
    .filter(Boolean)
    .join(", ");
}

function countsLine(findings, results, unrouted) {
  if (findings.length === 0 && unrouted.length === 0) return null;
  const strays = unrouted.length
    ? `; ${unrouted.length} bullet(s) UNROUTED — tag each [rule], [issue], [memory] or [task-local]`
    : "";
  return [
    `captured ${findings.length} finding(s): ${tallyOf(findings)}${strays}`,
    ...results.map((line) => `  ${line}`),
    ...unrouted.map((line) => `  UNROUTED ${line}`),
  ].join("\n");
}

/** What was read, so that "nothing to capture" cannot be mistaken for "nothing captured". */
function sawLine(payload, report, lines) {
  const who = `a \`${payload.agent_type ?? "subagent"}\` subagent`;
  if (!report.trim()) return `saw no final report from ${who} — nothing to capture`;
  const size = `${countLines(report)} line(s)`;
  if (lines === null) {
    return `saw a ${size} report from ${who} with no \`## Findings\` section — nothing captured`;
  }
  return `saw a ${size} report from ${who}`;
}

/** Where this session keeps its memory, which rules a memory could restate, and the ledger. */
function contextOf(payload) {
  return {
    memoryDir: payload.transcript_path ? join(dirname(payload.transcript_path), "memory") : null,
    rulesDir: rulesDirFrom(payload.cwd),
    ledger: payload.agent_transcript_path?.replace(/\.jsonl$/, ".captured.json") ?? null,
  };
}

/** Each finding's text rides beside its status, so a loss is re-filable from the ledger alone. */
function ledgerFindings(findings, outcomes) {
  return findings.map((finding, index) => ({
    route: finding.route,
    text: finding.lines.join("\n"),
    result: outcomes[index].line,
    wasLost: outcomes[index].wasLost,
  }));
}

/** Stops a second firing for the same agent opening the same issue twice. */
function record(ledger, payload, capture) {
  if (!ledger || isDryRun) return;
  const entry = {
    agentId: payload.agent_id,
    at: new Date().toISOString(),
    saw: capture.saw,
    results: capture.outcomes.map((outcome) => outcome.line),
    findings: ledgerFindings(capture.findings, capture.outcomes),
    unrouted: capture.unrouted,
  };
  writeFileSync(ledger, `${JSON.stringify(entry, null, 2)}\n`);
}

/**
 * The moment-of-failure notice scrolls away; the ledger is the durable half. This names what was
 * lost, points at the ledger, and warns that a replay would re-route the successes too.
 */
function lossLine(findings, outcomes, ledger) {
  const lost = findings.filter((_, index) => outcomes[index].wasLost);
  if (lost.length === 0) return null;
  const where = ledger
    ? `their full text is in the ledger (${ledger}) — re-file them by hand`
    : "no ledger path for this agent, so this notice is the only record of them";
  return [
    `${lost.length} finding(s) LOST — ${where}; replaying this hook re-routes the successes too, so a replay must be deliberate`,
    ...lost.map((finding) => `  LOST [${finding.route}] ${headline(finding)}`),
  ].join("\n");
}

function emit(lines, context) {
  const summary = [...lines, leannessLine(context.memoryDir, context.rulesDir)]
    .filter(Boolean)
    .join("\n");
  process.stdout.write(`${JSON.stringify({ systemMessage: summary })}\n`);
  // Repeated on stderr because that reaches the debug log whether or not `systemMessage` renders.
  process.stderr.write(`${summary}\n`);
}

async function main() {
  let payload;
  try {
    payload = JSON.parse(await readStdin());
  } catch {
    const failed = "subagent capture: unreadable hook payload — nothing captured";
    process.stdout.write(`${JSON.stringify({ systemMessage: failed })}\n`);
    return;
  }
  const context = contextOf(payload);
  if (context.ledger && existsSync(context.ledger)) {
    emit(
      [`subagent capture: ${payload.agent_id} was captured already (${context.ledger})`],
      context,
    );
    return;
  }
  const report = reportFrom(payload);
  const lines = report.trim() ? findingLines(report) : null;
  const { findings, unrouted } = lines ? parseFindings(lines) : { findings: [], unrouted: [] };
  const outcomes = findings.map((finding) => routeOne(finding, payload, context.memoryDir));
  const results = outcomes.map((outcome) => outcome.line);
  const saw = sawLine(payload, report, lines);
  record(context.ledger, payload, { saw, findings, outcomes, unrouted });
  emit(
    [
      `subagent capture: ${saw}`,
      countsLine(findings, results, unrouted) ?? (lines ? "captured 0 finding(s)" : null),
      lossLine(findings, outcomes, context.ledger),
    ],
    context,
  );
}

await main();
