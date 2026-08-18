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

The four packages are built; the studio is growing slice by slice. See `## Status`.

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
argued where its name links to.

1. **[Schema lives in code.](docs/decisions/schema-in-code-content-in-a-database.md)** Props are
   inferred *from* the schema, never declared beside it, and no schema lives in a database.
2. **[`core` depends on nothing.](docs/decisions/core-depends-on-nothing.md)** No React, no Next,
   no `node:*` — it runs in a browser, a worker and a build step unchanged.
3. **[Artifacts are immutable and content-addressed.](docs/decisions/artifacts-are-immutable-and-content-addressed.md)**
   Publishing writes a new artifact and moves a pointer.
4. **[Compiling is not building.](docs/architecture.md#why-compile-at-publish)** Compile validates
   and serializes a document; publishing and previewing never require a deploy.
5. **IO happens in adapters.** `core` computes; adapters read and write.
6. **[Artifacts contain data, never code.](docs/decisions/artifacts-contain-data-never-code.md)**
   It is a security and performance boundary, not a preference.
7. **[Nubbin knows nothing about the consumer's stack.](docs/decisions/layout-is-ordinary-props-and-nubbin-ships-no-css.md)**
   It ships no CSS and holds no opinion about styling. A feature needing to know what is on the
   other side is the wrong feature.

## Commands

- `pnpm build` — build all packages (tsup → `dist/`)
- `pnpm test` — Vitest across packages

**Run `pnpm test`, not `pnpm --filter <pkg> test`.** `turbo.json` makes `test` depend on
`^build`, so the workspace form builds a package's dependencies first. The filtered form
bypasses turbo and runs against whatever is in `dist/` — which produces failures like
`parseMatchKind is not a function` for a function that exists in the source.
- `pnpm typecheck` — `tsc --noEmit` across packages
- `pnpm check` — Biome lint + format, writing fixes
- `pnpm catalog` — regenerate every `CATALOG.md`; `pnpm install` already does it for you

Node 22+ (24 in `.nvmrc`) and pnpm are required; `packageManager` pins the version.

## Where everything else lives

Two pages are surfaced by nothing, and are named here for that reason:

| Doing | Read |
|---|---|
| Anything that must pass CI | [`docs/gates.md`](docs/gates.md) |
| Writing prose, an example, or a fixture | [`docs/public-repository.md`](docs/public-repository.md) |

A hand-maintained list beside a mechanism goes stale, so this page carries none. What it
carries instead is where the generated ones are:

| Asking | Read |
|---|---|
| What a package exports, and what each unit is for | The `CATALOG.md` beside it — `packages/core/CATALOG.md` and its siblings |
| Which rules, agents and skills exist, and when each applies | `.claude/CATALOG.md` |

`scripts/catalog.mjs` writes both from the declarations and frontmatter they describe, and
`pnpm install` runs it — so they are on disk after the install any checkout already performs,
and gitignored, so they never conflict. They are files to open, not context that arrives: no
agent is given one, and a read-only agent receives no rule file either unless an edit matches
its glob. Open one before writing a helper; the thing you are about to add is often there.

One thing has no mechanism at all. **A subagent's report** — it ends in a `## Findings`
section, and the caller decides what each finding becomes.

## Status

Four packages are published under the `rc` tag — `npm view @nubbin/core dist-tags` for the
version, which in prose would be a copy of the registry. [`docs/reference/`](docs/README.md)
documents `core`'s authoring and compile surfaces, the artifact contracts, and the `react`
and `next` bindings as shipped. **The studio** grows slice by slice against the demo:
[`apps/studio/README.md`](apps/studio/README.md) is what it does today, and
[the roadmap](https://github.com/effekt/nubbin/issues/14) is what it does not yet.

Read [`docs/architecture.md`](docs/architecture.md) for the model and
[`docs/decisions/`](docs/decisions/README.md) for what is settled, and treat the open issues
labelled `design-question` as the list of things you may not silently decide.
