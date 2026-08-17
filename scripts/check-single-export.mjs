#!/usr/bin/env node
// Enforces "one unit per file": at most ONE callable unit per source file, counting BOTH
// runtime exports AND module-private functions.
//
// Biome's `useFilenamingConvention: filenameCases:["export"]` enforces that the filename
// MATCHES an export. This enforces the COUNT, which Biome has no rule for.
//
// Why private functions count: an unexported helper cannot be imported by a test, so it is
// only ever exercised through its caller and its edge cases go uncovered while the file
// still reports green. It is also undiscoverable — nothing outside the file can find or
// reuse it. Splitting it out makes it directly testable and shareable by name.
//
// What counts as a unit: exported values, plus top-level unexported functions, classes, and
// `const`s initialised to a function. Plain data `const`s do NOT count — a module-private
// `const KEYS = [...]` is data. Type-only exports do NOT count, so `export function compile`
// beside `export type CompileResult` is one unit.
//
// Usage: node scripts/check-single-export.mjs <files...> [--check]

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const args = process.argv.slice(2);
const CHECK = args.includes("--check");
const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const SCAN_ROOTS = ["packages", "apps", "examples"];
const EXCLUDED_DIRS = new Set(["node_modules", "dist", ".next", ".turbo", ".repomix"]);

/** Every source file under the workspace roots, for when no explicit paths are given. */
function walkSources(dir, found) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return found;
  }
  for (const entry of entries) {
    if (EXCLUDED_DIRS.has(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walkSources(full, found);
    else if (/\.tsx?$/.test(entry.name)) found.push(full);
  }
  return found;
}

/**
 * Passing no paths used to scan nothing and report success, so `pnpm verify` ran this gate
 * against zero files. An empty run is now a full run.
 */
function defaultTargets() {
  const found = [];
  for (const root of SCAN_ROOTS) walkSources(join(REPO_ROOT, root), found);
  return found;
}

const explicit = args.filter((arg) => !arg.startsWith("--"));
const files = explicit.length > 0 ? explicit : defaultTargets();

const EXEMPT_PATTERNS = [
  /\.types\.tsx?$/,
  /\.constants\.ts$/,
  /(^|\/)index\.tsx?$/,
  /\.test\.tsx?$/,
  /\/__tests__\//,
  /\.d\.ts$/,
  /\.config\./,
  /\/generated\//,
  // Next route files only. The bare `/app/` this replaces exempted every file under any
  // directory named `app`, including ordinary components that happen to live there.
  /\/app\/(?:.*\/)?(?:page|layout|route|template|loading|error|not-found|default|global-error)\.tsx?$/,
];

const isExempt = (file) => EXEMPT_PATTERNS.some((pattern) => pattern.test(file));

const hasExportKeyword = (node) =>
  node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword) ?? false;

/** True when a declaration's initialiser is a function — the test for "unit, not data". */
const isFunctionInitialiser = (declaration) =>
  declaration.initializer != null &&
  (ts.isArrowFunction(declaration.initializer) || ts.isFunctionExpression(declaration.initializer));

/** Function-valued names bound by one `const`/`let` statement. */
function functionNamesInVariableStatement(statement) {
  return statement.declarationList.declarations
    .filter(
      (declaration) => isFunctionInitialiser(declaration) && ts.isIdentifier(declaration.name),
    )
    .map((declaration) => declaration.name.text);
}

/** Names of the top-level units one statement keeps to itself. */
function privateUnitNamesIn(statement) {
  if (ts.isFunctionDeclaration(statement) || ts.isClassDeclaration(statement)) {
    return [statement.name?.text ?? "(anonymous)"];
  }
  if (ts.isVariableStatement(statement)) return functionNamesInVariableStatement(statement);
  return [];
}

/** Names of the top-level functions a file keeps to itself. */
function privateUnitNames(source) {
  return source.statements
    .filter((statement) => !hasExportKeyword(statement))
    .flatMap(privateUnitNamesIn);
}

/** Names introduced by an exported runtime declaration. */
function declaredValueExportNames(statement, source) {
  if (!hasExportKeyword(statement)) return [];
  if (ts.isFunctionDeclaration(statement) || ts.isClassDeclaration(statement)) {
    return [statement.name?.text ?? "default"];
  }
  if (ts.isEnumDeclaration(statement)) return [statement.name.text];
  if (ts.isModuleDeclaration(statement)) return [statement.name.getText(source)];
  if (ts.isVariableStatement(statement)) {
    return statement.declarationList.declarations.map((declaration) =>
      ts.isIdentifier(declaration.name) ? declaration.name.text : "(destructured)",
    );
  }
  return [];
}

/** Names introduced by an export assignment or named runtime re-export. */
function forwardedValueExportNames(statement) {
  if (ts.isExportAssignment(statement)) return statement.isExportEquals ? [] : ["default"];
  if (
    !ts.isExportDeclaration(statement) ||
    statement.isTypeOnly ||
    !statement.exportClause ||
    !ts.isNamedExports(statement.exportClause)
  ) {
    return [];
  }
  return statement.exportClause.elements
    .filter((element) => !element.isTypeOnly)
    .map((element) => element.name.text);
}

/** Names of the runtime/value exports declared at the top level of a file. */
function valueExportNames(source) {
  return source.statements.flatMap((statement) => [
    ...declaredValueExportNames(statement, source),
    ...forwardedValueExportNames(statement),
  ]);
}

const offenders = [];
for (const file of files) {
  if (isExempt(file) || !existsSync(file) || !/\.tsx?$/.test(file)) continue;
  const source = ts.createSourceFile(
    file,
    readFileSync(file, "utf8"),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const exported = valueExportNames(source);
  const priv = privateUnitNames(source);
  if (exported.length + priv.length > 1) offenders.push({ file, exported, priv });
}

if (offenders.length === 0) {
  console.log(`✅ One unit per file in ${files.length} checked file(s).`);
  process.exit(0);
}

console.log(
  `❌ ${offenders.length} file(s) declare more than one unit. Split into one file per unit,\n` +
    `   or move shared constants/types into a *.constants.ts / *.types.ts sibling.\n` +
    `   A module-private function is still a unit: split it out and export it so it can be\n` +
    `   tested directly and reused by name.\n`,
);
for (const { file, exported, priv } of offenders) {
  console.log(`  ${file}`);
  if (exported.length > 0) {
    console.log(`        ${exported.length} value export(s): ${exported.join(", ")}`);
  }
  if (priv.length > 0) {
    console.log(`        ${priv.length} private function(s): ${priv.join(", ")}`);
  }
  console.log("");
}

process.exit(CHECK ? 1 : 0);
