---
title: Documentation Index
summary: Reading order for the design, and what each document is responsible for
status: stable
---

# Documentation

The design here is written to survive review before code is written against it. **What is
built is recorded in [`AGENTS.md`](../AGENTS.md), never here** — a status line in this file
would be a second copy of that, and the copy is the one that rots.

These documents hold the parts an implementer works from: the contracts, the settled
decisions, and the alternatives each one beat. They do not hold the deliberation that
produced them.

| Read | For | Status |
|---|---|---|
| [`architecture.md`](architecture.md) | How the contract/content/output split and the compile-at-publish pipeline fit together. **Start here.** | stable |
| [`environment.md`](environment.md) | The plugins, skills and toolchain this repository is worked on with, and how to reproduce them | stable |
| [`releasing.md`](releasing.md) | How a version reaches npm, which tool must do it, and the two behaviours that surprise people | stable |
| [`decisions.md`](decisions.md) | Settled choices and the reasoning behind them, so they are not re-litigated | stable |
| [`domain-model.md`](domain-model.md) | Every entity, what owns it, and where it lives across the three layers | draft |
| [`api.md`](api.md) | The shape of `defineBlock` through compile and render, and where UI hints live | draft |
| [`authoring-flows.md`](authoring-flows.md) | What an author does step by step, and the failure modes each flow carries | draft |
| [`studio.md`](studio.md) | How the self-hosted canvas, cross-iframe drag, and preview are architected | draft |

`draft` means the shape is expected to move. `stable` means changing it is a design change,
not an edit.

## What lives elsewhere

Documents are for things that change with the code and get reviewed in a diff. Two kinds of
content are deliberately not here:

| Content | Where | Why |
|---|---|---|
| Open design questions | [Issues labelled `design-question`](https://github.com/effekt/nubbin/issues/15) | They need a thread that closes. A document can hold a question but can never resolve one. |
| Build order and phasing | [The roadmap](https://github.com/effekt/nubbin/issues/14) | Sequencing is tracked work, not a contract. A roadmap in prose goes stale the first time reality disagrees with it. |

[The design site](https://effekt.github.io/nubbin/) is not a third home. It is generated from
these documents and published by CI — see
[Generated documents live only on `gh-pages`](decisions.md#generated-documents-live-only-on-gh-pages).

## Keeping them honest

Documentation rots differently from code: a stale sentence compiles, passes every lint, and
still reads as authoritative. Gates run against these files on every commit — links and
anchors resolve, no claim rests on a corpus a reader cannot open, nothing reaches back for a
name that no longer exists, no reference identifies a codebase that is not this one, and a
document that trails something it links to gets flagged for re-reading.

[`.claude/rules/documentation.md`](../.claude/rules/documentation.md) covers what the gates
cannot: which document holds what, and the rule that a decision changes prose in *every*
document describing it, in the same commit.
