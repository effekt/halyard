// One unit per file: at most ONE callable unit per source file, counting BOTH runtime exports AND
// module-private functions.
//
// Biome's `useFilenamingConvention: filenameCases:["export"]` enforces that the filename MATCHES
// an export. This enforces the COUNT, which Biome has no rule for.
//
// Why private functions count: an unexported helper cannot be imported by a test, so it is only
// ever exercised through its caller and its edge cases go uncovered while the file still reports
// green. It is also undiscoverable — nothing outside the file can find or reuse it.
//
// What counts as a unit: exported values, plus top-level unexported functions, classes, and
// `const`s initialised to a function. Plain data `const`s do NOT count — a module-private
// `const KEYS = [...]` is data. Type-only exports do NOT count, so `export function compile`
// beside `export type CompileResult` is one unit.
//
// What the count buys beyond decomposition: with one unit per file and Biome holding the filename
// to that unit's name, filename → symbol is invertible. That is what lets `scripts/catalog.mjs`
// derive a package's table from its own source instead of anyone maintaining one. Relaxing this
// does not just permit a crowded file — it takes the catalog with it.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";
import { REPO_ROOT } from "./support/repoRoot.mjs";
import { sourceFiles } from "./support/sourceFiles.mjs";

const EXEMPT = [
  /\.types\.tsx?$/,
  /\.constants\.ts$/,
  /(^|\/)index\.tsx?$/,
  /\.test\.tsx?$/,
  /\/__tests__\//,
  /\.d\.ts$/,
  /\.config\./,
  /\/generated\//,
  // Next route files only. The bare `/app/` this replaces exempted every file under any directory
  // named `app`, including ordinary components that happen to live there.
  /\/app\/(?:.*\/)?(?:page|layout|route|template|loading|error|not-found|default|global-error)\.tsx?$/,
];

const hasExportKeyword = (node) =>
  node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword) ?? false;

/** True when a declaration's initialiser is a function — the test for "unit, not data". */
const isFunctionInitialiser = (declaration) =>
  declaration.initializer != null &&
  (ts.isArrowFunction(declaration.initializer) || ts.isFunctionExpression(declaration.initializer));

/** Names of the top-level units one statement keeps to itself. */
function privateUnitNamesIn(statement) {
  if (ts.isFunctionDeclaration(statement) || ts.isClassDeclaration(statement)) {
    return [statement.name?.text ?? "(anonymous)"];
  }
  if (!ts.isVariableStatement(statement)) return [];
  return statement.declarationList.declarations
    .filter(
      (declaration) => isFunctionInitialiser(declaration) && ts.isIdentifier(declaration.name),
    )
    .map((declaration) => declaration.name.text);
}

/** Names introduced by an exported runtime declaration. */
function declaredValueExportNames(statement, source) {
  if (!hasExportKeyword(statement)) return [];
  if (ts.isFunctionDeclaration(statement) || ts.isClassDeclaration(statement)) {
    return [statement.name?.text ?? "default"];
  }
  if (ts.isEnumDeclaration(statement)) return [statement.name.text];
  if (ts.isModuleDeclaration(statement)) return [statement.name.getText(source)];
  if (!ts.isVariableStatement(statement)) return [];
  return statement.declarationList.declarations.map((declaration) =>
    ts.isIdentifier(declaration.name) ? declaration.name.text : "(destructured)",
  );
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

/** Every unit a file declares: value exports plus the functions it keeps to itself. */
function unitsIn(file, text) {
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const exported = source.statements.flatMap((statement) => [
    ...declaredValueExportNames(statement, source),
    ...forwardedValueExportNames(statement),
  ]);
  const priv = source.statements
    .filter((statement) => !hasExportKeyword(statement))
    .flatMap(privateUnitNamesIn);
  return { exported, priv };
}

describe("the detector", () => {
  it("counts a module-private function as a unit beside an export", () => {
    const { exported, priv } = unitsIn("a.ts", "function helper() {}\nexport function main() {}\n");
    expect(exported).toEqual(["main"]);
    expect(priv).toEqual(["helper"]);
  });

  it("does not count a module-private data const", () => {
    const { exported, priv } = unitsIn("a.ts", "const KEYS = [1, 2];\nexport function main() {}\n");
    expect(priv).toEqual([]);
    expect(exported).toEqual(["main"]);
  });

  it("does not count a type-only export", () => {
    const text = "export type CompileResult = { ok: boolean };\nexport function compile() {}\n";
    expect(unitsIn("a.ts", text).exported).toEqual(["compile"]);
  });

  it("counts two exported functions as two units", () => {
    const { exported } = unitsIn("a.ts", "export function a() {}\nexport const b = () => {};\n");
    expect(exported).toEqual(["a", "b"]);
  });
});

describe("every source file", () => {
  it("declares at most one unit", () => {
    const files = sourceFiles().filter((path) => !EXEMPT.some((pattern) => pattern.test(path)));
    expect(files.length).toBeGreaterThan(20);
    const offenders = [];
    for (const rel of files) {
      const { exported, priv } = unitsIn(rel, readFileSync(join(REPO_ROOT, rel), "utf8"));
      if (exported.length + priv.length > 1) {
        offenders.push(`${rel}  exports: ${exported.join(", ")}  private: ${priv.join(", ")}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});
