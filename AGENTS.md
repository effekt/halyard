---
title: Repository Guide
summary: What Halyard is, its invariants, commands, and gates — loaded by agents automatically
status: stable
---

# AGENTS.md

Guidance for working in this repo. Loaded automatically by coding agents.

## What this is

**Halyard** — a page builder that lives inside your codebase. Developers curate a set of
blocks in code; non-developers compose pages from them. The composition is data, the
contract is code, and publishing compiles a document into an immutable artifact.

**None of the following exists yet.** It is the settled layout, recorded so that the first
package lands in the right place rather than wherever it was convenient. See `## Status`.

```
packages/
  core/       @effekt/halyard             — defineBlock, registry, compile, artifact types
  react/      @effekt/halyard-react       — render an artifact tree with a block registry
  next/       @effekt/halyard-next        — catch-all route, preview route, draft resolution
  store-fs/   @effekt/halyard-store-fs    — reference storage adapter
apps/
  studio/     the editor — pulled and run alongside your app, never a hosted service
```

`core` is the contract. Everything else is an adapter around it, and a consumer can
replace any of them. Bring your own storage, your own auth, your own framework binding.

## The invariants

These are the reason the project exists. Breaking one is a design change, not a fix.

1. **Schema lives in code.** Block props are inferred *from* the schema, never declared
   alongside it. There is no second definition of a block anywhere, and no schema in a
   database.
2. **`core` has no runtime dependencies beyond Standard Schema.** No React, no Next, no
   `node:*`. It runs in a browser, a worker, and a build step unchanged.
3. **Published artifacts are immutable and content-addressed.** Publishing writes a new
   artifact and moves a pointer. Nothing mutates in place, so nothing needs invalidating.
4. **Compiling is not building.** Compile validates and serializes a document — it never
   invokes a bundler. Publishing and previewing must never require a deploy.
5. **IO happens in adapters.** `core` computes; adapters read and write.
6. **Artifacts contain data, never code.** No author-supplied JavaScript, no CSS blocks, no
   expression language, no binding strings evaluated at render. Every value in an artifact is
   inert data validated against a schema. Hosted visual CMSes routinely permit all four —
   compiled JavaScript bundles, stylesheet blocks, and string expressions over authoring
   state, all stored as content and evaluated at render — and each is a security and
   performance liability authored by someone with no way to assess either. Repetition and
   logic live in components, which are code, reviewed as code.
7. **Halyard knows nothing about the consumer's stack.** It constructs schemas and renders.
   It ships no CSS, holds no opinion about styling, and makes no assumption about their
   dependencies. A value like `space: "lg"` is passed through as data; what it *means* is
   resolved by the consumer's component, in the consumer's codebase, with the consumer's
   design system. Any feature that requires knowing what is on the other side is the wrong
   feature.

## Commands

- `pnpm build` — build all packages (tsup → `dist/`)
- `pnpm test` — Vitest across packages
- `pnpm typecheck` — `tsc --noEmit` across packages
- `pnpm check` — Biome lint + format, writing fixes
- `pnpm map` — regenerate the repomix codebase map (gitignored, see below)

Node 22+ (24 in `.nvmrc`) and pnpm are required; `packageManager` pins the version.

## Reading the codebase

There is **no committed catalog**. Generate a map on demand instead:

```bash
pnpm map                     # writes .repomix/codebase.json — gitignored
```

Committed catalogs go stale, and every branch that adds a unit conflicts in the same
generated file. Generate when you need the whole picture; otherwise read the tree.

## Quality gates

No rule here is a suggestion — each is enforced by a gate that runs on every agent edit
(`.claude/settings.json`), at pre-commit (`lefthook.yml`), or at pre-push. The gates that
read prose have been checking it since the first commit; the ones that read code are wired
and idle until there is code, which is the order that keeps them honest.

| Gate | Enforces |
|---|---|
| `biome` | complexity ≤10, ≤50 lines/function, ≤200 lines/file, no `any`, no non-null assertion, no magic numbers, no barrels, filename === export |
| `noUnknownCast.grit` · `booleanNaming.grit` | no `as unknown as`; booleans read as predicates |
| `check-single-export.mjs` | one unit per file, counting module-private functions |
| `check-schema-depth.mjs` | no nested object schemas — sub-schemas get their own file |
| `check-structure.mjs` | no junk-drawer filenames |
| `jscpd` | 1% duplication, `minTokens: 15` |
| `knip` | no unused files, exports, or dependencies |
| `dependency-cruiser` | package boundaries — `core` stays portable |
| `type-coverage` | ≥99% typed |
| `publint` · `attw` | the published package resolves correctly |
| `check-docs.mjs` | links and anchors resolve; every document is in the index |
| `check-rules.mjs` | rule files carry `paths`, stay under 150 lines, end in a checklist |
| `check-prose.mjs` | claims resting on a corpus no reader can open; references to what a thing used to be; promises of future work; filler |

`pnpm verify` runs every gate above and needs a full install. CI runs only the subset that
works against a bare checkout — the documentation and prose gates — because the rest need
`node_modules`. Both are real; neither is a superset of the other until a package exists.

**The gates cannot catch everything.** A function that formats a date inline is one
declaration, eight lines, complexity 1 — every gate passes and it is still wrong. That
judgment lives in `.claude/rules/single-concern.md`, and a `PostToolUse` hook reviews for
it. Rules auto-load by path; read the matching one before writing code.

## This repository is public

Contributors work in other codebases, most of them closed. Nothing from those belongs here —
not employer or client names, not internal application or package names, not product-specific
routes, model names, or page titles, and not absolute paths from a developer's machine.

**Keep the conclusion, drop the measurement.** Anonymising a statistic is not enough. "In one
audited corpus, most entries were data models rather than pages" names no one, and a reader
still cannot open that corpus, test the claim, or argue with it — it reads as authority while
supplying none, and it dates the document to one sample taken once.

What a private codebase gives you is a thing you now *know*. Publish that, argued from why it
holds: a visual CMS accumulates structured data models faster than pages because rows are
cheap to add and a page needs a route. That claim stands on its own reasoning, and a reader
who disagrees has something to push against.

`scripts/check-no-vendor-refs.mjs` enforces this on every agent edit and at pre-commit. Its
term list lives in `scripts/vendor-terms.txt`, which is gitignored — a published denylist
defeats its own purpose. See `vendor-terms.example.txt` for the format.

**Examples must be self-contained.** Scaffold a clean Next.js application with the
`@effekt/create-starter` generator for fixtures, demos, and manual testing. Never point them
at a codebase that is not part of this repository.

## Testing

Every unit ships a colocated test. A unit that is hard to test directly is usually a unit
that should have been split — extract it, export it, name the file after it, test it.

Adapters are tested against an in-memory implementation; `core` is tested with real
schemas (zod), never mocks. No `as any` or `as unknown as` in tests.

## Documentation & comments

Comment the non-obvious WHY, not the what. Describe what exists now and how to use it.
Do not write:

- negative inventory — absent or intentionally-omitted technologies, repo origin,
  migration history, or speculative future integrations
- comments that restate what the code already says
- verbose prose where a short clause suffices

A `PostToolUse` hook reviews added comments on every edit.

## Status

**Design, not software.** No package has been written yet. What is in place is the workspace,
the governance, the gates above, and an architecture that has survived an adversarial review.

That makes the invariants unusually cheap to honour and unusually easy to lose — there is no
existing code pulling the first commit toward the right shape. Read `docs/architecture.md`
for the model and `docs/decisions.md` for what has already been settled and why, and treat
the open issues labelled `design-question` as the list of things you may not silently decide.
