---
title: Repository Guide
summary: What Nubbin is, its invariants, commands, and gates — loaded by agents automatically
status: stable
---

# AGENTS.md

Guidance for working in this repo. Loaded automatically by coding agents.

## What this is

**Nubbin** — a page builder that lives inside your codebase. Developers curate a set of
blocks in code; non-developers compose pages from them. The composition is data, the
contract is code, and publishing compiles a document into an immutable artifact.

The four packages are built; the studio is settled and unbuilt. See `## Status`.

```
packages/
  core/       @nubbin/core       — defineBlock, registry, compile, artifact types
  react/      @nubbin/react      — render an artifact tree with a block registry
  next/       @nubbin/next       — catch-all route, preview route, draft resolution
  store-fs/   @nubbin/store-fs   — reference storage adapter
apps/
  studio/     the editor — pulled and run alongside your app, never a hosted service
```

`core` is the contract. Everything else is an adapter around it, and a consumer can
replace any of them. Bring your own storage, your own auth, your own framework binding.

## The invariants

These are the reason the project exists. Breaking one is a design change, not a fix.

Each is stated here and argued where it links to. Repeating the argument here would put it in
two places, and the copy is the one that goes stale while the original is corrected.

1. **Schema lives in code.** Block props are inferred *from* the schema, never declared
   alongside it. There is no second definition of a block anywhere, and no schema in a
   database — [Schema in code, content in a
   database](docs/decisions/schema-in-code-content-in-a-database.md).
2. **`core` has no runtime dependencies beyond Standard Schema.** No React, no Next, no
   `node:*`. It runs in a browser, a worker, and a build step unchanged —
   [`core` depends on nothing](docs/decisions/core-depends-on-nothing.md).
3. **Published artifacts are immutable and content-addressed.** Publishing writes a new
   artifact and moves a pointer — [Artifacts are immutable and
   content-addressed](docs/decisions/artifacts-are-immutable-and-content-addressed.md).
4. **Compiling is not building.** Compile validates and serializes a document; publishing and
   previewing never require a deploy — [Why compile at
   publish](docs/architecture.md#why-compile-at-publish).
5. **IO happens in adapters.** `core` computes; adapters read and write.
6. **Artifacts contain data, never code.** What that excludes, and why it is a security and
   performance boundary rather than a preference, is
   [Artifacts contain data, never code](docs/decisions/artifacts-contain-data-never-code.md).
7. **Nubbin knows nothing about the consumer's stack.** It constructs schemas and renders,
   ships no CSS, and holds no opinion about styling — [Layout is ordinary props, and Nubbin
   ships no CSS](docs/decisions/layout-is-ordinary-props-and-nubbin-ships-no-css.md). Any
   feature that requires knowing what is on the other side is the wrong feature.

## Commands

- `pnpm build` — build all packages (tsup → `dist/`)
- `pnpm test` — Vitest across packages

**Run `pnpm test`, not `pnpm --filter <pkg> test`.** `turbo.json` makes `test` depend on
`^build`, so the workspace form builds a package's dependencies first. The filtered form
bypasses turbo and runs against whatever is in `dist/` — which produces failures like
`parseMatchKind is not a function` for a function that exists in the source.
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

Every row in the table below is enforced by a gate that runs on every agent edit
(`.claude/settings.json`), at pre-commit (`lefthook.yml`), or at pre-push. The gates that
read prose check every document; the ones that sweep for accessibility and unpinned
versions read every file git would publish, so a new file type or a new directory is
covered without anyone extending a list.

**Not every rule in `.claude/rules/` has one.** Where a rule states a gate, that gate exists
and has been seen to fail on a violation. Where it says *Gate: none*, the rule is judgment a
reviewer applies — the colocated-test requirement is the largest of these, and what a gate for
it would assert is [#96](https://github.com/effekt/nubbin/issues/96).

| Gate | Enforces |
|---|---|
| `biome` | complexity ≤10, ≤50 lines/function, ≤200 lines/file, no `any`, no non-null assertion, no magic numbers, no barrels, filename === export |
| `noUnknownCast.grit` · `booleanNaming.grit` | no `as unknown as`; booleans read as predicates |
| `check-single-export.mjs` | one unit per file, counting module-private functions |
| `check-schema-depth.mjs` | no nested object schemas — sub-schemas get their own file |
| `check-structure.mjs` | no junk-drawer filenames |
| `jscpd` | 1% duplication, `minTokens: 15` |
| `knip` | no unused files, exports, or dependencies |
| `dependency-cruiser` | package boundaries — `core` stays portable, `react` stays free of node builtins and Next, `store-fs` stays free of frameworks |
| `type-coverage` | ≥99% typed |
| `publint` · `attw` | every publishable package resolves correctly — both iterate `packages/*`, and `attw` runs the `esm-only` profile because these packages are ESM-only by choice |
| `check-tarball.mjs` | no `catalog:`, `workspace:` or `link:` specifier survives into a packed manifest |
| `check-installable.mjs` | every package installs from its own tarball into an empty project and imports |
| `check-peer-deps.mjs` | no package declares a peer dependency nothing in it imports |
| `sync-core-version.mjs` | `NUBBIN_VERSION`, stamped into every artifact, matches the published version |
| `check-package-metadata.mjs` | every publishable package has a README, a licence file and field, a description and a repository |
| `check-docs.mjs` | links and anchors resolve; every document is in the index |
| `check-file-refs.mjs` | a repository file named inside a code span exists, or is gitignored on purpose |
| `check-plan-files.mjs` | no plan-shaped file under `docs/` — a `plans/` directory, a date-stamped filename, or a stem that is the word itself |
| `check-rules.mjs` | rule files carry `paths`, stay under 150 lines, end in a checklist |
| `check-prose.mjs` | claims resting on a corpus no reader can open; references to what a thing used to be; promises of future work; filler |
| `check-prose-dupes.mjs` | one claim, one home — a run of 12 words written into two documents, measured after fences, comments and tables are stripped out |
| `check-pinned-deps.mjs` | no range specifier — every dependency version is exact, so an upgrade arrives only in a commit someone wrote |
| `check-script-invocations.mjs` | a script whose name the package manager also claims is invoked as `pnpm run <name>`, never bare |
| `check-skills-lock.mjs` | `skills-lock.json` and the installed skills agree by name, and by a hash over every file in each skill directory — not just its `SKILL.md` |
| `check-plugins-lock.mjs` | `plugins-lock.json` and the installed plugins agree as a set, by name — versions are recorded but not compared, because a marketplace that publishes none reports `unknown` |
| `check-release-tag.mjs` | a prerelease version cannot be published to the `latest` dist-tag |
| `check-gate-table.mjs` | every gate this table names is reachable from `pnpm verify`, and every gate `verify` runs has a row here — each direction with documented exceptions |
| `check-a11y.mjs` | an `img` with no `alt`; alt that is a filename or names the medium; a click handler on a plain element; positive `tabIndex`; an `a` with no `href`; a focus outline removed with nothing in its place |
| `check-worktree.mjs` | an edit aimed at the primary worktree, or at a linked worktree whose gates cannot run |
| `check-primary-tree.mjs` | an uncommitted path in the primary worktree, whatever wrote it there |

`pnpm verify` runs every gate above except the four named below, and needs a full install.
`check-gate-table.mjs` is what keeps that sentence true in both directions: it fails when a row
here resolves to nothing `verify` reaches, and when `verify` runs a gate with no row here. CI
runs the same set, split in two: one job runs the documentation, prose, accessibility and pinning
gates against a bare checkout, and a second installs the workspace to run lint, typecheck, tests,
build, boundaries, duplication, dead code, type coverage and the publishable gates.

**The two lockfile gates run locally and not in CI**, because the thing they compare against is
not in a checkout. `.agents/` and the plugin cache are ignored the way `node_modules` is, so on
a runner `check-skills-lock.mjs` finds nothing installed and takes its "nothing to compare"
path — it exited 0 on every CI run it was ever wired into, which is the same shape as the gates
in [`gates.md`](.claude/rules/gates.md) that passed while checking nothing. They belong to the
contributor's machine, where the comparison is real.

**The two worktree gates also stay out of `verify`**, for the reason that makes them worth
having: a CI checkout is clean, so a run there would report nothing and read as a pass.
`check-worktree.mjs` fires at a `Write`, `Edit` or `MultiEdit` and refuses those three tool
calls, which is a mechanism — a `>` redirect inside a shell command never meets it, and three
untracked files reached the primary tree while it was active. `check-primary-tree.mjs` asks the
outcome instead, at agent dispatch and at pre-push, and reports without blocking because it
cannot tell whose file it found.

One exception is deliberate and recorded in `check-gate-table.mjs` so it cannot pass as an
oversight: `check-release-tag.mjs` runs only on the release path — every local version is a
prerelease, so including it in `verify` would fail every run on every machine.

**`check-stale-docs.mjs` is advisory** and runs with `continue-on-error` in CI, so it is the
one entry here that cannot block. It flags a document that trails something it links to, which
is worth re-reading and not worth failing a build over.

`check-prose-dupes.mjs` blocks, at a budget of zero because a budget above zero grows quietly as
an allowance and fails whoever next adds prose rather than whoever copies a claim. Every claim
has one home, so a second copy is a defect rather than a backlog item.

`pnpm publishable` is the release subset — the gates that read the artifact a consumer would
install rather than the source. Run it before publishing anything; `verify` includes it.

`core-version` runs **first**, ahead of the build, because `NUBBIN_VERSION` is compiled into
`dist/` and stamped into every artifact as `compiledWith`. It is the one gate here that reads
source, and it is on this list because the release workflow runs `publishable` and not `verify`:
without it a version bump can publish artifacts that misreport what produced them, and no gate
on the release path notices.

**The gates cannot catch everything.** A logger that formats its own timestamp —
[the canonical violation](.claude/rules/single-concern.md#the-canonical-violation) — sits
under every threshold in the table and is still wrong, because a threshold bounds how large a
violation can grow and says nothing about whether one is there. That judgment lives in
`.claude/rules/single-concern.md`, and a `PostToolUse` hook reviews for it. Rules auto-load by
path; read the matching one before writing code.

## Opening an issue

Issues are opened through `scripts/scaffold-issue.mjs`, which searches the open set for one
already covering the ground and checks the draft carries cause, reason, decision, choice and a
close condition:

```bash
pnpm run --silent issue-scaffold --template > /tmp/draft.md
pnpm run issue-scaffold --body-file /tmp/draft.md --title "…" --label enhancement
```

`--silent` on the first line keeps pnpm's own banner out of the redirected draft. Redirected
without it, the banner opens the draft and puts an absolute path from a contributor's machine
into a public issue body. Every run passes an explicit
`--limit`, prints the size of the set it read before anything else, refuses a list that came back exactly full, and corroborates that size against a second
count taken through the search index. `gh issue list` returns its first page with no warning
when no limit is passed, and a duplicate search over the newest half of a tracker reports
"nothing similar" in the same words a complete one uses. `--open` creates the issue, once the
search and the validation have both passed.

It runs at the moment an issue is opened rather than over the tree, which is why `pnpm verify`
and the gate table above — both of which read the working tree — leave it out. The authoring
half is the `issue` skill in `.claude/skills/`.

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

This standard is held in review rather than by a script —
[the decision](docs/decisions/vendor-references-are-a-review-concern-not-a-gate.md) records
why.

**Examples must be self-contained.** Scaffold a clean Next.js application with the
the create-starter generator for fixtures, demos, and manual testing. Never point them
at a codebase that is not part of this repository.

## Testing

Every unit ships a colocated test. A unit that is hard to test directly is usually a unit
that should have been split — extract it, export it, name the file after it, test it.

Adapters are tested against an in-memory implementation; `core` is tested with real
schemas (zod), never mocks. No `as any` or `as unknown as` in tests.

## Findings at exit

A report ends with a `## Findings` section whose every bullet is tagged `[rule]`, `[issue]`,
`[memory]` or `[task-local]`. A `SubagentStop` hook reads that section, routes each finding to the
surface its tag names, and prints what it routed; an untagged bullet is reported as unrouted and
written nowhere. The tags, the routing and the rule that a memory is deleted once it becomes a
repo rule are in `.claude/rules/subagent-findings.md`.

## Documentation & comments

Comment the non-obvious WHY, not the what. Describe what exists now and how to use it.
Do not write:

- negative inventory — absent or intentionally-omitted technologies, repo origin,
  migration history, or speculative future integrations
- comments that restate what the code already says
- verbose prose where a short clause suffices
- a comment for code the same change removed — deleting a function and leaving the paragraph
  that explained it sends a reader hunting for something that does not exist. Where the reason
  still holds, move it onto what remains rather than leaving it above nothing.

Before writing a sentence about the system, ask what would falsify it and how soon. A sentence a
plausible next commit makes wrong should state the durable thing instead, or not exist. Three
forms recurred often enough to be gated — a version literal, an absence claim, and an unowned
promise; `check-prose.mjs` has them, and the judgment is everything it cannot pattern-match.

A `PostToolUse` hook reviews added comments on every edit.

## Status

**Four packages exist and are published under the `rc` tag.** The version in prose would be a
copy of the registry, and the copy is the one that rots — `npm view @nubbin/core dist-tags`.

| Package | Surface |
|---|---|
| `@nubbin/core` | `defineBlock`, `defineCatalog`, `createRegistry`, `compile`, `CompileError`, `checkRollback`, `parseMatchKind` |
| `@nubbin/store-fs` | `createFsArtifactStore`, proven against the shared `ArtifactStore` contract |
| `@nubbin/next` | `resolveArtifact`, `staticRouteParams`, `holeFetchOptions`, `routeFromSlug`, `publishRoute`, `unpublishRoute` |
| `@nubbin/react` | `Renderer`, `defineRegistry`, `loadBlocks`, and the block, hole and renderer types |

Everything is tested against real zod schemas; dependency-cruiser fails the build on any
`node:` or framework import inside `core`, and on a framework import inside either adapter.

**Unbuilt:** the studio.

Read `docs/architecture.md` for the model and `docs/decisions/` for what has already been
settled and why, and treat the open issues labelled `design-question` as the list of things
you may not silently decide.
