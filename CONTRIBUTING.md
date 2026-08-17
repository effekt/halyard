---
title: Contributing
summary: Setup, gates, and what a good contribution looks like before any code exists
status: stable
---

# Contributing

Read [`AGENTS.md`](AGENTS.md) first. It documents the invariants, the commands, and every
quality gate. This file does not repeat it — it covers what AGENTS.md doesn't: getting set
up, and what's actually worth contributing right now.

## Setup

```bash
nvm install && nvm use     # reads .nvmrc
corepack enable pnpm       # activates the pinned pnpm
pnpm install               # installs the git hooks via `prepare`
pnpm verify                # every gate
```

If a git hook later reports `pnpm: command not found`, the toolchain is missing from that
shell's PATH rather than from the machine — the hooks shell out to `pnpm` directly.

The prose gates are plain Node and need no install, which is why CI runs them against a
bare checkout:

```bash
node scripts/check-docs.mjs --check
node scripts/check-prose.mjs --check
node scripts/check-no-vendor-refs.mjs --check
```

Node 22+ (24 pinned in `.nvmrc`) and pnpm are required; `packageManager` in `package.json`
pins the exact pnpm version.

## What's worth contributing right now

`@nubbin/core` is built; the adapters and the studio are not, and the milestone that could
invalidate the approach has not run (see [`README.md`](README.md#status)). That shapes what is
worth doing:

**Disagreement about the design is the most valuable contribution there is.** The
architecture has already been through one adversarial review, which falsified the live
postMessage preview and the single-manifest publish. It should survive more of that before
code gets written on top of it. A
convincing objection to something in `docs/` is worth more right now than any patch.

**Argue in an open question.** They live as issues labelled `design-question`, indexed in
[Open design questions](https://github.com/effekt/nubbin/issues/15). Each records what
deciding it late would cost, because that is usually what settles it. Comment on one, or open
a new one with the Design question template.

**A settled decision can be reopened.** [`docs/decisions.md`](docs/decisions.md) holds what's
already settled and why. If you think one was settled wrong, argue it — reopening a decision
is not a lesser contribution than proposing a new one, it just needs to engage with the
reasoning already on the page, not just the conclusion.

## Documentation changes

Most contributions right now are documentation. Read
[`.claude/rules/documentation.md`](.claude/rules/documentation.md) before editing anything
under `docs/` — it covers frontmatter, which document holds what, and the rule that a rename
leaves no trace of the old name.

## Commits

[Conventional Commits](https://www.conventionalcommits.org/), checked by commitlint on every
PR. Scope is one of `docs`, `repo`, `deps`, `core`, `examples` — the list `commitlint.config.js`
enforces, which grows as packages land.

## Code

`AGENTS.md`'s invariants and gates apply in full: one unit per file, every dependency pinned,
`pnpm verify` green before review. If a gate seems to make correct code impossible to write,
that's worth raising — as an issue, not a workaround.

`pnpm verify` needs a full install. The prose gates above do not, so a documentation-only
change can be checked without one.
