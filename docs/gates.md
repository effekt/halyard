---
title: Quality Gates
summary: Every gate, what it enforces, where its verdict comes from, and the three that stay local
status: stable
---

# Quality gates

## Contents

- Where a verdict comes from
- The table — every gate and what it enforces
- What `pnpm verify` runs, and how CI splits it
- The gates that stay local, and why
- `pnpm publishable`, and why the version stamp runs first
- What the gates cannot catch

## Where a verdict comes from

A repository invariant is a **test**, run by vitest. A general-purpose concern is a **maintained
tool**, run as a pinned CLI. Nothing in between: a bespoke script that prints a report and chooses
its own exit code is how a check comes to print a tick over files it never read, and how nine of
them once reported success while asserting nothing.

The tests live in `tests/`, in a vitest project called `repo`, and `pnpm test` runs them beside the
package suites. Each one pairs a fixture that proves the detector fires with an assertion over the
whole repository, so a gate that stops detecting anything fails on the fixture rather than passing
quietly on the corpus. `vitest related` is deliberately not used at pre-commit: these read files as
*data* rather than importing them, so it would select none of them and run nothing.

Three scripts remain, and each is a mechanism a test cannot be. `check-worktree.mjs` and
`check-primary-tree.mjs` are agent hooks — they answer a tool call. `check-prose.mjs` and
`check-a11y.mjs` are still scripts because both are queued for a maintained tool (Vale and axe) and
porting them into the suite first would be a rewrite thrown away twice.

| Gate | Enforces |
|---|---|
| `biome` | complexity ≤10, ≤50 lines/function, ≤200 lines/file, no `any`, no non-null assertion, no magic numbers, no barrels, filename === export |
| `noUnknownCast.grit` · `booleanNaming.grit` | no `as unknown as`; booleans read as predicates |
| `jscpd` | 1% duplication, `minTokens: 15` |
| `knip` | no unused files, exports, or dependencies |
| `dependency-cruiser` | package boundaries — `core` stays portable, `react` stays free of node builtins and Next, `store-fs` stays free of frameworks |
| `type-coverage` | ≥99% typed |
| `syncpack` | no range specifier anywhere — in a manifest or in the workspace catalog it resolves through, so an upgrade arrives only in a commit someone wrote |
| `publint` · `attw` | every publishable package resolves correctly — both iterate `packages/*`, and `attw` runs the `esm-only` profile because these packages are ESM-only by choice |
| `tests/oneUnitPerFile.test.mjs` | one unit per file, counting module-private functions |
| `tests/schemaDepth.test.mjs` | no nested object schemas — sub-schemas get their own file |
| `tests/junkDrawerFilenames.test.mjs` | no junk-drawer filenames |
| `tests/documentationStructure.test.mjs` | links and anchors resolve, fences balance, table columns are named, every top-level document is in the index |
| `tests/fileReferencesResolve.test.mjs` | a repository file named inside a code span exists, or is gitignored on purpose |
| `tests/proseDuplication.test.mjs` | one claim, one home — a run of 12 words written twice across `docs/`, `AGENTS.md`, the rules and the skills, measured after fences, comments and tables are stripped out |
| `tests/planFiles.test.mjs` | no plan-shaped file under `docs/` — a `plans/` directory, a date-stamped filename, or a stem that is the word itself |
| `tests/ruleFiles.test.mjs` | rule files carry `paths`, stay under 150 lines, end in a checklist, declare a gate, and glob at least one tracked file |
| `tests/rulesCiteRealGates.test.mjs` | a rule naming a `check-*.mjs` or a skill names one that exists |
| `tests/peerDependencies.test.mjs` | no package declares a peer dependency nothing in it imports |
| `tests/packageMetadata.test.mjs` | every publishable package has a README, a licence file and field, a description and a repository |
| `tests/coreVersionStamp.test.mjs` | `NUBBIN_VERSION`, stamped into every artifact, matches the published version |
| `tests/releaseConfiguration.test.mjs` | release-please releases every publishable package, at the version it is at, as one linked group |
| `tests/skillsLock.test.mjs` | `skills-lock.json` is one a reinstall could use, and — where the skills are on disk — agrees with them by name and by a hash over every file in each skill directory |
| `tests/trackedFiles.test.mjs` | the corpus every assertion above reads is what git would publish, and nothing else |
| `tests/release/packagesInstallFromTarball.test.mjs` | every package packs with no `catalog:`, `workspace:` or `link:` specifier surviving, installs from its own tarball into an empty project, and imports |
| `scripts/check-prose.mjs` | claims resting on a corpus no reader can open; references to what a thing used to be; promises of future work; filler |
| `scripts/check-a11y.mjs` | an `img` with no `alt`; alt that is a filename or names the medium; a click handler on a plain element; positive `tabIndex`; an `a` with no `href`; a focus outline removed with nothing in its place |
| `scripts/check-release-tag.mjs` | a prerelease version cannot be published to the `latest` dist-tag |
| `scripts/check-worktree.mjs` | an edit aimed at the primary worktree, or at a linked worktree whose gates cannot run |
| `scripts/check-primary-tree.mjs` | an uncommitted path in the primary worktree, whatever wrote it there |

`pnpm verify` runs every gate above except the three named below, and needs a full install. It is a
short chain of tools rather than a list of scripts, which is why nothing here reconciles it against
this table: `pnpm test` reaches every row in `tests/` by including the directory, so a new test is
wired in by existing, and a deleted one is a deleted file rather than a silently dropped step.

CI splits the same set in two. One job runs the two remaining zero-dependency scripts against a bare
checkout; the second installs the workspace and runs lint, typecheck, the suites, build, pinning,
boundaries, duplication, dead code, type coverage and the publishable gates.

**Three gates stay out of `verify`.** The two worktree gates stay out for the reason that makes them
worth having: a CI checkout is clean, so a run there would report nothing and read as a pass.
`check-worktree.mjs` fires at a `Write`, `Edit` or `MultiEdit` and refuses those three tool calls,
which is a mechanism — a `>` redirect inside a shell command never meets it, and three untracked
files reached the primary tree while it was active. `check-primary-tree.mjs` asks the outcome
instead, at agent dispatch and at pre-push, and reports without blocking because it cannot tell
whose file it found. `check-release-tag.mjs` runs only on the release path: every local version is a
prerelease, so including it in `verify` would fail every run on every machine.

**Half of `tests/skillsLock.test.mjs` cannot run in CI**, because `.agents/` is ignored the way
`node_modules` is and a runner has no skills installed. That half is *skipped*, and vitest says so —
which is the difference that matters. The gate it replaces printed a tick describing a content hash
it had not computed, so "present in CI" read as "enforced in CI" for a comparison that never ran.

`pnpm publishable` is the release subset — the gates that read the artifact a consumer would install
rather than the source. Run it before publishing anything; `verify` includes it. The tarball install
is its own vitest project, `release`, because its verdict depends on the registry: no cache key can
see that, so it is invoked directly and is registered as no turbo task, and a green run of it can
never be replayed.

`pnpm core-version` runs **first**, ahead of the build, because `NUBBIN_VERSION` is compiled into
`dist/` and stamped into every artifact as `compiledWith`. It is the one release gate that reads
source, and it runs on both paths: the release workflow waits for `verify` to pass on the commit it
is publishing, and then runs `publishable` again against the tree it checked out. Without it a
version bump can publish artifacts that misreport what produced them.

**The gates cannot catch everything.** A logger that formats its own timestamp —
[the canonical violation](https://github.com/effekt/nubbin/blob/main/.claude/rules/single-concern.md#the-canonical-violation) — sits
under every threshold in the table and is still wrong, because a threshold bounds how large a
violation can grow and says nothing about whether one is there. That judgment lives in
`.claude/rules/single-concern.md`, and a `PostToolUse` hook reviews for it. Rules auto-load by
path; read the matching one before writing code.
