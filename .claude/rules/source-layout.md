---
paths: "packages/*/src/**, apps/*/src/**"
title: Source Layout Rules
summary: How files, filenames, and barrels are organized so every unit is testable
status: stable
---

# Source layout

> **One unit per file. The filename is the export's name. The only barrel is a package's `src/index.ts`.**

## Why

A file holding several units hides most of them. A module-private helper cannot be imported
by a test, so it is only ever exercised through its caller — its error branches and cleanup
paths go uncovered while the file reports green — and nothing outside the file can discover
or reuse it. Splitting makes each unit testable directly and findable by name.

## Rules

### One unit per file — counting declarations, not exports

```ts
// WRONG — three units in one file; two of them are untestable
export function compile(doc: Document, registry: Registry) { … }
function walkNodes(nodes: Node[]) { … }
const toIssue = (node: Node) => { … };

// CORRECT — compile.ts, walkNodes.ts, toIssue.ts, each with a sibling test
export function compile(doc: Document, registry: Registry) { … }
```

Plain data `const`s are not units — a module-private `const FNV_PRIME = 0x100000001b3n` is
data. Type-only exports are not units either, so `export function compile` beside
`export type CompileResult` is one unit.

`scripts/check-single-export.mjs` enforces this on every agent edit and on staged files at
pre-commit. Run it directly while working: `node scripts/check-single-export.mjs <file>`.

### Filename equals the export

Biome runs `useFilenamingConvention` with `filenameCases: ["export"]`. `defineBlock` lives
in `defineBlock.ts`; `CompileError` lives in `CompileError.ts`. A type-only module is
`<name>.types.ts`; a constants module is `<name>.constants.ts`. Both are exempt from the
one-unit rule because neither holds a unit.

### No barrels except the package entry

Each package has exactly one `src/index.ts`, and it is the published surface. Internal
modules import each other by path. A mid-tree `index.ts` that re-exports a folder makes the
dependency graph unreadable and defeats tree-shaking. **Gate:** Biome's `noBarrelFile`
and `noReExportAll`.

### Caps

≤200 lines per source file, enforced by Biome's `noExcessiveLinesPerFile` — tests are exempt
by override, and `*.schema.ts` is capped lower at 60.
Over the cap is a signal the file holds more than one unit, not a reason to raise the cap.

### Never a category name

No `utils.ts`, `helpers.ts`, `misc.ts`, `common.ts`, `shared.ts`. A file named for a
category accumulates whatever nobody wanted to name. Name it after the unit.

## Naming

| Kind | Convention |
|---|---|
| Functions returning a derived value | `toX` / `formatX` / `parseX` |
| Predicates | `isX` / `hasX` — booleans read as a predicate (`is`/`has`/`should`/`can`) |
| Reads through an adapter | `readX` / `writeX` |
| Module constants | `SCREAMING_SNAKE` |
| Types | `PascalCase`, colocated with the unit that owns them |

## Checklist

- [ ] The file declares exactly one function, class, or function-valued const
- [ ] The filename matches that unit's exported name exactly
- [ ] A sibling `*.test.ts` exercises it directly
- [ ] No new `index.ts` outside a package root
- [ ] Under 200 lines
