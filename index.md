---
title: Home
nav_order: 1
---

# Halyard

Halyard is a public, MIT-licensed page builder. It keeps three concerns apart that most
content systems blur together: a **contract** — the set of registered components and the
schema each one accepts — lives in code, shipped and versioned like any other dependency. A
**document** — which blocks an author placed, in what order, with what props — lives in a
database, editable by non-technical authors without a deploy. And a **published artifact** —
what a visitor's request actually renders — is an immutable, content-addressed record,
compiled once at publish time and never touched again. Rollback is a pointer move. A CI
guardrail keeps a registry change from silently breaking a page that is already live.

There is no implementation yet. That is deliberate — the design is being settled in the
open, before the expensive parts get built on top of it.

## Why this site exists

The [repository](https://github.com/effekt/halyard) keeps a condensed, working set of docs:
an architecture overview and a running log of settled decisions, sized for someone
implementing against them today. This site is the other half — the full, long-form design
record behind those condensed docs. It carries the reasoning, the rejected alternatives, the
evidence that moved a decision one way rather than another, and the open threads that
haven't resolved yet. Nothing here is required reading to build against Halyard; it exists
for whoever wants to know *why* the API sketch or the domain model ended up the shape it did,
or wants to argue that it should end up shaped differently.

Two categories of question were deliberately left out of this site because they've moved
elsewhere: open design questions and roadmap phasing now live in the repository's
[GitHub issues](https://github.com/effekt/halyard/issues), where they can be discussed and
closed rather than sitting static in a document.

## Reading order

`Domain model` and `API sketch` come first — everything else is downstream of the types they
define. `Authoring flows` walks what an author actually does, citing back into both. `Studio`
covers the editing surface's architecture; `Layout contract` covers how an author adjusts
spacing without being able to break a design system; `Studio wireframes` specifies the chrome
— panels, controls, and named states — in detail.

| Page | Covers |
|---|---|
| [Domain model](domain-model.md) | Every entity, what owns it, and where it lives across the contract, content, and output layers |
| [API sketch](api-sketch.md) | The shape of `defineBlock` through `compile` and render, and where UI hints live |
| [Authoring flows](authoring-flows.md) | What an author does, step by step, and where each flow is still unresolved |
| [Studio](studio.md) | How the self-hosted studio canvas, drag-and-drop, and preview are architected |
| [Layout contract](layout-contract.md) | How authors adjust spacing and alignment without breaking the design system |
| [Studio wireframes](wireframes.md) | Panel layout, inspector controls, and key-state specs for the editing screen |

## Repository

The code, the condensed docs, and the issue tracker for open questions and roadmap phasing
all live at **[github.com/effekt/halyard](https://github.com/effekt/halyard)**.
