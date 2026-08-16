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

import { existsSync, readFileSync } from "node:fs";
import ts from "typescript";

const args = process.argv.slice(2);
const CHECK = args.includes("--check");
const files = args.filter((arg) => !arg.startsWith("--"));

const EXEMPT_PATTERNS = [
  /\.types\.tsx?$/,
  /\.constants\.ts$/,
  /(^|\/)index\.tsx?$/,
  /\.test\.tsx?$/,
  /\/__tests__\//,
  /\.d\.ts$/,
  /\.config\./,
  /\/generated\//,
  /\/app\//,
];

const isExempt = (file) => EXEMPT_PATTERNS.some((pattern) => pattern.test(file));

const hasExportKeyword = (node) =>
  node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword) ?? false;

/** True when a declaration's initialiser is a function — the test for "unit, not data". */
const isFunctionInitialiser = (declaration) =>
  declaration.initializer != null &&
  (ts.isArrowFunction(declaration.initializer) ||
    ts.isFunctionExpression(declaration.initializer));

/** Names of the top-level functions a file keeps to itself. */
function privateUnitNames(source) {
  const names = [];
  for (const statement of source.statements) {
    if (hasExportKeyword(statement)) continue;

    if (ts.isFunctionDeclaration(statement) || ts.isClassDeclaration(statement)) {
      names.push(statement.name?.text ?? "(anonymous)");
    } else if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (isFunctionInitialiser(declaration) && ts.isIdentifier(declaration.name)) {
          names.push(declaration.name.text);
        }
      }
    }
  }
  return names;
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
