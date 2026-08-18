---
title: Repository Guide
summary: What Nubbin is, the invariants that may not be broken, the commands, and where everything else lives
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

These are the reason the project exists. Breaking one is a design change, not a fix. Each is
argued where it links to.

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
- `pnpm map` — write the codebase map to the gitignored `.repomix/codebase.json`, on demand,
  because a committed catalog goes stale and conflicts on every branch that adds a unit

Node 22+ (24 in `.nvmrc`) and pnpm are required; `packageManager` pins the version.

## Where everything else lives

Read the one that matches what you are about to do. Nothing below is repeated here, because a
summary beside a full argument is the copy that goes stale.

| Doing | Read |
|---|---|
| Anything that must pass CI | [`docs/gates.md`](docs/gates.md) — every gate, what `verify` runs, what stays local |
| Writing prose, an example, or a fixture | [`docs/public-repository.md`](docs/public-repository.md) |
| Writing code | the rule under `.claude/rules/` whose `paths` glob matches the file — they load automatically |
| Opening an issue, recording a decision, starting a change | the `issue`, `decision` and `worktree` skills |
| Finishing a subagent report | `.claude/rules/subagent-findings.md` — an untagged finding is written nowhere |

Four agents exist and nothing loads them automatically, so they are named here rather than
found: `planner` audits a ticket against the code and decides nothing, `builder` implements
against a settled design, `adversary` tries to falsify a design or a diff, and `scout` locates
things without spending the caller's context. `.claude/rules/planning.md` argues why the agent
that plans is not the agent that implements.

## Status

Four packages are published under the `rc` tag — `npm view @nubbin/core dist-tags` for the
version, which in prose would be a copy of the registry. `@nubbin/core` carries `defineBlock`,
`defineCatalog`, `createRegistry`, `compile` and the rollback helpers; `@nubbin/react` renders
an artifact tree; `@nubbin/next` resolves and publishes routes; `@nubbin/store-fs` is the
reference storage adapter. Each is described as shipped under [`docs/reference/`](docs/README.md).

**Unbuilt:** the studio.

Read [`docs/architecture.md`](docs/architecture.md) for the model and
[`docs/decisions/`](docs/decisions/README.md) for what is settled, and treat the open issues
labelled `design-question` as the list of things you may not silently decide.
