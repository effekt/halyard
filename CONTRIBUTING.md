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
pnpm install
pnpm verify      # every gate
```

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

There is no implementation yet — deliberately (see [`README.md`](README.md#status)). That
changes what's valuable:

**Disagreement about the design is the most valuable contribution there is.** The
architecture has already been through one adversarial review that falsified several of its
early claims. It should survive more of that before code gets written on top of it. A
convincing objection to something in `docs/` is worth more right now than any patch.

**Argue in an open question.** They live as issues labelled `design-question`, indexed in
[Open design questions](https://github.com/effekt/halyard/issues/15). Each records what
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
PR. Scope is one of `docs`, `repo`, `deps`.

## Once there's code

`AGENTS.md`'s invariants and gates apply in full: one unit per file, every dependency pinned,
`pnpm verify` green before review. If a gate seems to make correct code impossible to write,
that's worth raising — as an issue, not a workaround.
