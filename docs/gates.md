---
title: Quality Gates
summary: Every gate, what it enforces, which run it belongs to, and the four that stay out of verify
status: stable
---

# Quality gates

## Contents

- The table — every gate and what it enforces
- What `pnpm verify` runs, and how CI splits it
- The gates that stay local, and why
- `pnpm publishable`, and why `core-version` runs first
- What the gates cannot catch


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
| `check-stale-docs.mjs` | a document last touched before something it links to is flagged for review — advisory, reported without blocking |
| `check-plan-files.mjs` | no plan-shaped file under `docs/` — a `plans/` directory, a date-stamped filename, or a stem that is the word itself |
| `check-rules.mjs` | rule files carry `paths`, stay under 150 lines, end in a checklist, declare a gate, and glob at least one tracked file |
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
in [`gates.md`](https://github.com/effekt/nubbin/blob/main/.claude/rules/gates.md) that passed while checking nothing. They belong to the
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
[the canonical violation](https://github.com/effekt/nubbin/blob/main/.claude/rules/single-concern.md#the-canonical-violation) — sits
under every threshold in the table and is still wrong, because a threshold bounds how large a
violation can grow and says nothing about whether one is there. That judgment lives in
`.claude/rules/single-concern.md`, and a `PostToolUse` hook reviews for it. Rules auto-load by
path; read the matching one before writing code.
