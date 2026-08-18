---
title: "Flat while authoring, nested once published"
summary: Why drafts key on id and compile denormalizes into a tree
status: stable
---

# Flat while authoring, nested once published

A draft is `{ root, elements }` keyed by id; an artifact is a resolved tree. Editing wants
random access — selection, patching, undo, and reordering all key on id — while rendering
wants a self-contained structure with no lookups.

Compile is the denormalization, which is also where reference integrity, cycle-freedom, and
reachability get checked. A cyclic graph cannot flatten into a tree, so it fails at publish
rather than looping at render.
