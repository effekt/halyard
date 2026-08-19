---
title: "A schema change is a republish, not a migration"
summary: Why Block carries no migrate, and an old document is rewritten rather than upcast
status: stable
---

# A schema change is a republish, not a migration

`Block` carries no `migrate` field. No node records the block version it was authored against,
and `compile` runs no upcaster. A document whose props no longer satisfy the current schema
fails `compile` with a `CompileError` naming the node and the path; the remedy is to rewrite
that document and publish it again.

Published pages are untouched by this. An artifact's props were validated and frozen against
the version they compiled with, and a static block performs no lookup at render, so it goes on
serving; [`checkRollback`](../reference/artifacts.md#checkrollback) and
[`checkCompatibility`](../reference/artifacts.md#checkcompatibility) already refuse the two
operations that would put a stale document in front of a visitor. Rewriting a corpus is an
adapter concern and the tools are in `core` already —
[document operations](document-operations-live-in-core-beside-compile.md) sit beside `compile`
precisely so an editor, a script or an agent writes a document the same way. A script reads
every targeted `DocumentVersion`, rewrites it, and appends the result as a new version; nothing
mutates a historical version in place.

Keeping `migrate` and adding a `Node.blockVersion` for it to key on is what this displaces, and
it loses three ways. It is a second mechanism for something the version-append rewrite already
solves once and solves better: that pass holds the whole tree, so it expresses the renames,
splits and slot changes a per-node prop reshaper cannot. It reports the wrong thing: a bump is
mandatory for any incompatible schema change but implies nothing about whether a given node's
props are broken, so a recorded version flags nodes that validate perfectly while validation
reports the actual damage. And it is a guess where the alternative is a proof — a lazy upcaster
fires on a version delta, never on the shape in hand.

Leaving `migrate` declared and inert is worse than removing it. A field on a published type
that nothing reads still instructs: the block-authoring rule told authors to write one on every
version bump, and every one written so far did nothing. A required `Node.blockVersion` fails
the same honesty test from the other end — the studio would stamp the registry's current
version as it wrote, recording when a node was last touched rather than what it was authored
against, and nothing downstream could tell the two apart.

This forecloses lazy per-node upcasting permanently. Should a corpus large enough to make batch
rewrites painful appear, the question returns — and it returns needing the version field
declined here, on documents that will not carry it. What bounds the risk is that the failure is
loud: a `CompileError` at publish, never a broken page for a visitor.
