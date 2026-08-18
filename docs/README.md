---
title: Documentation Index
summary: Reading order for the design, and what each document is responsible for
status: stable
---

# Documentation

The design here is written to survive review before code is written against it. **What is
built is recorded in [`AGENTS.md`](https://github.com/effekt/nubbin/blob/main/AGENTS.md), never here** — a status line in this file
would be a second copy of that, and the copy is the one that rots.

These documents hold the parts an implementer works from: the contracts, the settled
decisions, and the alternatives each one beat. They do not hold the deliberation that
produced them.

| Read | For | Status |
|---|---|---|
| [`architecture.md`](architecture.md) | How the contract/content/output split and the compile-at-publish pipeline fit together. **Start here.** | stable |
| [`environment.md`](environment.md) | The plugins, skills and toolchain this repository is worked on with, and how to reproduce them | stable |
| [`gates.md`](gates.md) | Every gate, what it enforces, which run it belongs to, and the four that stay out of `verify` | stable |
| [`public-repository.md`](public-repository.md) | What may not appear here, and how to publish a finding without its provenance | stable |
| [`releasing.md`](releasing.md) | How a version reaches npm, what decides it, and the two behaviours that surprise people | stable |
| [`decisions/`](decisions/README.md) | Settled choices and the reasoning behind them, one file per decision | stable |
| [`domain-model.md`](domain-model.md) | Every entity, what owns it, and where it lives across the three layers | draft |
| [`api.md`](api.md) | The shape of `defineBlock` through compile and render, and where UI hints live | draft |
| [`authoring-flows.md`](authoring-flows.md) | What an author does step by step, and the failure modes each flow carries | draft |
| [`studio.md`](studio.md) | How the self-hosted canvas, cross-iframe drag, and preview are architected | draft |
| [`reference/blocks.md`](reference/blocks.md) | `defineBlock` and `createRegistry` as shipped — what registration rejects, and what the fingerprint covers | reference |
| [`reference/catalog.md`](reference/catalog.md) | `defineCatalog` as shipped — entries, field hints, defaults, and schema introspection | reference |
| [`reference/compile.md`](reference/compile.md) | `compile` as shipped — the document shape, the two validation passes, and every issue code | reference |
| [`reference/renderer.md`](reference/renderer.md) | `@nubbin/react` as shipped — the `Renderer` server component, the registry types, and the hole resolver | reference |
| [`reference/next.md`](reference/next.md) | `@nubbin/next` as shipped — route resolution, static params, hole fetch options, and the two publish calls | reference |
| [`reference/artifacts.md`](reference/artifacts.md) | The `Artifact` and `ArtifactStore` contracts as shipped, with `checkRollback` and `parseMatchKind` | reference |

`draft` means the shape is expected to move. `stable` means changing it is a design change,
not an edit. `reference` means the page describes the shipped surface — it changes when the
code does.

## What lives elsewhere

Documents are for things that change with the code and get reviewed in a diff. Two kinds of
content are deliberately not here:

| Content | Where | Why |
|---|---|---|
| Open design questions | [Issues labelled `design-question`](https://github.com/effekt/nubbin/issues/15) | They need a thread that closes. A document can hold a question but can never resolve one. |
| Build order and phasing | [The roadmap](https://github.com/effekt/nubbin/issues/14) | Sequencing is tracked work, not a contract. A roadmap in prose goes stale the first time reality disagrees with it. |

[The design site](https://effekt.github.io/nubbin/) is not a third home. It is generated and
published by CI from [the repository's
markdown](decisions/the-site-publishes-the-repositorys-markdown.md), these documents
included — see
[Generated documents are published, never committed](decisions/generated-documents-are-published-never-committed.md).

## Keeping them honest

Prose has no compiler, so a wrong sentence here is caught by nothing but a reader who acts on
it and comes unstuck. Gates run against these files on every commit — links and anchors
resolve, no claim rests on a corpus a reader cannot open, nothing reaches back for a name that
no longer exists, no reference identifies a codebase that is not this one, one claim lives in
one document, and a document that trails something it links to gets flagged for re-reading.

[`.claude/rules/documentation.md`](https://github.com/effekt/nubbin/blob/main/.claude/rules/documentation.md) holds why that is worth
the machinery, and what the gates cannot reach: which document holds what, and the rule that a
decision changes prose in *every* document describing it, in the same commit.
