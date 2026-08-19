---
title: "A document has many roots"
summary: Why a document lists ordered entry elements instead of naming one containing block
status: stable
---

# A document has many roots

`DocumentVersion.roots` is an ordered `readonly string[]`. A marketing page is a stack of
sections — hero, features, testimonial, footer — and no block contains them, so no single id
could name where the page starts. `Artifact.tree` was already an array; it is now what `roots`
denormalizes to, in that order, rather than an array the compiler only ever filled with one
entry.

`validateStructure` refuses a document naming no entry element, seeds cycle detection and
reachability from each one, and names the entry that matches no element. A page with one
entry is `roots: ["stack"]` — the same graph, the same walk order, the same content address —
so adopting this rewrites no composition and moves no artifact. A container block stays legal:
it becomes one shape a page may take rather than the shape every page must take.

## Requiring a container block was rejected

The demo does this today with `SectionStack`, and it is cheap exactly once. Every adopter then
writes the same empty block, it reaches the palette as something an author can nest inside
itself to no effect, and it owns a DOM element belonging to the consumer — `SectionStack`
emits `<main>`, so a host layout emitting its own produces two landmarks in the consumer's
application. That is a WCAG failure caused here and visible only in a rendered page, which no
gate in this repository can see. It shipped: every studio preview route carried nested `<main>`
until [#472](https://github.com/effekt/nubbin/pull/472).

## A one-element tuple for `Artifact.tree` was rejected

Narrowing the array to a tuple is the container block with the type made honest, so it
inherits every cost above and adds one. A page whose top level holds two blocks stops being
expressible at all, rather than merely being awkward to author — and that page is the case
this decision exists to serve.

## Document-level named slots wait

`slots: Record<string, readonly string[]>` on the document is the better long-run shape, and
this widens into it without a migration: an ordered list is one named slot with the naming
left out. It waits on two things. Slot names on a document have to agree with the layout's,
and how a layout and a page reconcile a slot they both fill is
[#13](https://github.com/effekt/nubbin/issues/13) — naming them now decides that silently, in
the shape of the data rather than in the thread that owns it. No `Layout` type exists yet for
such a rule to check against. Named slots also turn `Artifact.tree` into a map, which moves
the address of every artifact ever published.
