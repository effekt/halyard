#!/usr/bin/env node

// Generates one CATALOG.md per package and per top-level surface, so an agent can see what a
// package holds without grepping it.
//
// Every cell is quoted from the source: the export name from the declaration, the kind from the
// keyword that declares it, the summary from the first sentence of the TSDoc or the frontmatter
// beside it. Nothing here counts, dates, or groups — a derived number is a second copy of a fact
// and goes stale the moment the first one moves.
//
// An export with no doc comment gets an empty cell rather than a placeholder. That blank is the
// only pressure on TSDoc coverage in this repository, and a "TODO" would read as filled in.
//
// The bijection this rests on is three gates, not a convention: `check-single-export.mjs` holds a
// file to one unit, Biome's `useFilenamingConvention` with `filenameCases: ["export"]` holds the
// filename to that unit's name, and `check-structure.mjs` refuses a name that describes nothing.
// Together they make filename → symbol invertible, which is what lets a table be derived rather
// than written.
//
// Usage: node scripts/catalog.mjs [--check]

import { readdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * The surfaces that get a catalog. Named rather than derived: a catalog is a reading surface for
 * a thing someone maintains, and the workspace also holds an example app, a docs site and a
 * landing page, whose readers are not agents looking for a unit.
 */
export const CATALOGS = [
  { dir: "packages/core", kind: "package" },
  { dir: "packages/next", kind: "package" },
  { dir: "packages/react", kind: "package" },
  { dir: "packages/store-fs", kind: "package" },
  { dir: "apps/studio", kind: "package" },
  { dir: ".claude", kind: "claude" },
];

const SUMMARY_LIMIT = 120;
const UNIT = /\.tsx?$/;
const NOT_A_UNIT = /\.test\.tsx?$|(?:^|\/)index\.ts$/;

/**
 * A doc comment, the line comments that may sit between it and the declaration, and the
 * declaration itself. The doc body forbids `*​/` so a comment on an unexported neighbour cannot
 * be stretched across it onto the next export.
 */
const DECLARATION =
  /(?:^\/\*\*((?:(?!\*\/)[\s\S])*)\*\/[ \t]*\n(?:[ \t]*\/\/[^\n]*\n)*)?^export[ \t]+(default[ \t]+)?(?:async[ \t]+)?(?:declare[ \t]+)?(function|const|let|var|class|type|interface|enum)[ \t]+([A-Za-z_$][\w$]*)/gm;

/** Suffixes Biome exempts from `filenameCases: ["export"]`, so the stem is still the subject. */
const ROLE_SUFFIX = /\.(types|constants|schema|block)$/;

/** Minimal frontmatter reader — `key: value` pairs between the leading `---` fences. */
export function readFrontmatter(text) {
  const match = /^---\n([\s\S]*?)\n---/.exec(text);
  if (!match) return {};
  const fields = {};
  for (const line of match[1].split("\n")) {
    const pair = /^([a-zA-Z][\w-]*):\s*(.*)$/.exec(line);
    if (pair) fields[pair[1]] = pair[2].replace(/^["']|["']$/g, "").trim();
  }
  return fields;
}

/** A pipe would end the cell it sits in. */
function escapeCell(text) {
  return text.replace(/\|/g, "\\|");
}

/** The end of the first sentence, or the end of the text. Abbreviations do not end one. */
function sentenceEnd(text) {
  for (const match of text.matchAll(/[.!?](?=\s|$)/g)) {
    const next = text.slice(match.index + 1).trimStart();
    if (next === "" || /^[A-Z0-9`]/.test(next)) return match.index + 1;
  }
  return text.length;
}

/** Cut back to a word boundary, so a truncated summary never ends mid-word. */
function truncate(text, limit) {
  if (text.length <= limit) return text;
  const head = text.slice(0, limit);
  const lastSpace = head.lastIndexOf(" ");
  return `${(lastSpace > 0 ? head.slice(0, lastSpace) : head).trimEnd()}…`;
}

/** The first sentence of a doc comment, on one line, safe to put in a table cell. */
export function firstSentence(text, limit = SUMMARY_LIMIT) {
  if (!text) return "";
  const flat = text.replace(/\s+/g, " ").trim();
  if (flat === "") return "";
  return escapeCell(truncate(flat.slice(0, sentenceEnd(flat)), limit));
}

/** Doc comment body with its leading asterisks and indentation removed. */
function docText(raw) {
  if (raw === undefined) return "";
  return raw
    .split("\n")
    .map((line) => line.replace(/^\s*\*/, "").trim())
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

/** What the declaring keyword says the unit is. A PascalCase function in a `.tsx` is a component. */
function kindOf(keyword, name, fileName) {
  if (keyword === "type" || keyword === "interface") return "type";
  if (keyword === "class" || keyword === "enum") return keyword;
  if (keyword !== "function") return "const";
  return fileName.endsWith(".tsx") && /^[A-Z]/.test(name) ? "component" : "fn";
}

/** Every top-level export a module declares, in declaration order. Re-exports declare nothing. */
export function declaredExports(source, fileName) {
  DECLARATION.lastIndex = 0;
  const found = [];
  for (const [, doc, isDefault, keyword, name] of source.matchAll(DECLARATION)) {
    found.push({
      name,
      kind: kindOf(keyword, name, fileName),
      isDefault: isDefault !== undefined,
      doc: docText(doc),
    });
  }
  return found;
}

/**
 * The export the file is named for, and the rest. The stem wins because the filename gate makes
 * it the file's subject; a default export wins next, because a route or a page is named by its
 * position rather than its symbol.
 */
export function primaryOf(fileName, exported) {
  const stem = fileName.replace(UNIT, "").replace(ROLE_SUFFIX, "").toLowerCase();
  const named = exported.find((one) => one.name.toLowerCase() === stem);
  const primary = named ?? exported.find((one) => one.isDefault) ?? exported[0];
  return { primary, others: exported.filter((one) => one !== primary).map((one) => one.name) };
}

function table(header, rows) {
  return [`| ${header.join(" | ")} |`, `|${header.map(() => "---").join("|")}|`, ...rows].join(
    "\n",
  );
}

/** One row per file: the export it declares, what kind of thing it is, and its own first line. */
export function renderPackage({ name, description, rows }) {
  const body = rows.map((row) => {
    const others = row.others.map((other) => ` \`${other}\``).join("");
    return `| [\`${row.primary.name}\`](${row.path})${others} | ${row.primary.kind} | ${row.summary} |`;
  });
  return `# ${name}\n\n${description}\n\n${table(["Export", "Kind", "Summary"], body)}\n`;
}

/** The three things `.claude` holds, each already carrying the frontmatter that describes it. */
export function renderClaude({ rules, agents, skills }) {
  const ruleRows = rules.map((rule) => {
    const globs = rule.paths
      .split(",")
      .map((glob) => `\`${glob.trim()}\``)
      .join(" ");
    return `| [${basename(rule.path)}](${rule.path}) | ${globs} | ${escapeCell(rule.summary)} |`;
  });
  const linked = (one) => `| [${one.name}](${one.path}) | ${escapeCell(one.description)} |`;
  return [
    "# .claude",
    "",
    "## Rules",
    "",
    table(["Rule", "Loads on", "Enforces"], ruleRows),
    "",
    "## Agents",
    "",
    table(["Agent", "Use when"], agents.map(linked)),
    "",
    "## Skills",
    "",
    table(["Skill", "Use when"], skills.map(linked)),
    "",
  ].join("\n");
}

async function walk(dir, found = []) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return found;
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) await walk(full, found);
    else found.push(full);
  }
  return found;
}

const posix = (path) => path.split(sep).join("/");

async function packageCatalog(root, dir) {
  const base = join(root, dir);
  const pkg = JSON.parse(await readFile(join(base, "package.json"), "utf8"));
  const files = (await walk(join(base, "src")))
    .map((file) => posix(relative(base, file)))
    .filter((file) => UNIT.test(file) && !NOT_A_UNIT.test(file))
    // Case-insensitive: `CompileError.ts` is a unit like any other, and an ASCII sort exiles
    // every PascalCase filename to the top of the table, away from the letter it starts with.
    .sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" }));
  const rows = [];
  for (const path of files) {
    const source = await readFile(join(base, path), "utf8");
    const { primary, others } = primaryOf(basename(path), declaredExports(source, basename(path)));
    if (primary === undefined) continue;
    rows.push({ path, primary, others, summary: firstSentence(primary.doc) });
  }
  return renderPackage({ name: pkg.name, description: pkg.description, rows });
}

async function frontmatterOf(base, relativePath) {
  const meta = readFrontmatter(await readFile(join(base, relativePath), "utf8"));
  return { path: posix(relativePath), ...meta };
}

async function claudeCatalog(root, dir) {
  const base = join(root, dir);
  const names = async (sub) => (await readdir(join(base, sub))).sort();
  const rules = [];
  for (const file of await names("rules"))
    rules.push(await frontmatterOf(base, join("rules", file)));
  const agents = [];
  for (const file of await names("agents"))
    agents.push(await frontmatterOf(base, join("agents", file)));
  const skills = [];
  for (const skill of await names("skills")) {
    skills.push(await frontmatterOf(base, join("skills", skill, "SKILL.md")));
  }
  return renderClaude({ rules, agents, skills });
}

/** Every catalog this repository has, keyed by the path it is written to. */
export async function generate(root) {
  const written = new Map();
  for (const { dir, kind } of CATALOGS) {
    const build = kind === "claude" ? claudeCatalog : packageCatalog;
    written.set(`${dir}/CATALOG.md`, await build(root, dir));
  }
  return written;
}

async function main() {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const checking = process.argv.includes("--check");
  const written = await generate(root);
  const drifted = [];
  for (const [path, content] of written) {
    const onDisk = await readFile(join(root, path), "utf8").catch(() => null);
    if (onDisk === content) continue;
    drifted.push(path);
    if (!checking) await writeFile(join(root, path), content);
  }
  if (checking && drifted.length > 0) {
    console.error(`❌ Catalog out of date — run \`pnpm run catalog\`:\n  ${drifted.join("\n  ")}`);
    process.exit(1);
  }
  const what = checking ? "up to date" : `written (${drifted.length} changed)`;
  console.log(`✅ ${written.size} catalog(s) ${what}.`);
}

if (process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
