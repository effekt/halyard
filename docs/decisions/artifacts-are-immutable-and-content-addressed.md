---
title: "Artifacts are immutable and content-addressed"
summary: Why publishing writes a new hash and moves one atomic pointer
status: stable
---

# Artifacts are immutable and content-addressed

An immutable artifact has no invalidation semantics at the store: nothing to revalidate, no
negative cache, no single-flight. (Field-level `revalidate` is data freshness inside an
artifact, not artifact invalidation.) Publishing points at a new hash; rolling back points
at the old one.

The only mutable output is a **route pointer**, one atomic record per route. A single
manifest document was the first design and it permitted silent lost updates: two concurrent
publishes read the same snapshot and the second overwrote the first, with no error. A
single-key write is atomic on object storage, a database row, or a filesystem; a
read-modify-write over a whole table is not.
