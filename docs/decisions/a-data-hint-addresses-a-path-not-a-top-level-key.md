---
title: "A `data` hint addresses a path, not a top-level key"
summary: Why a hole is keyed by the dotted path its hint names, and why overlapping hints are refused
status: stable
---

# A `data` hint addresses a path, not a top-level key

`ui.fields` is keyed by schema path throughout — `title`, `cta.label`, `items[].icon` — and
`label` and `control` have always read every one of them. `data` did not. The compiler split a
node's validated props by walking the value's own top-level keys, so a hint on `cta.label`
matched nothing: it registered, it compiled, and the whole of `cta` froze into `props` with no
hole recorded and no error at registration, at compile or at render.

A hole addresses one object field, and `cta.label` is one object field. `partitionProps`
therefore splits by the full dotted path the hint names: the leaf leaves `props`, the rest of
its parent stays frozen, and the hole is recorded under `"cta.label"`. The render half needed
nothing — `resolveNodeHoles` has always filled a hole with `setAtPath(props, path, value)`,
which walks dotted segments.

`[]` stays refused. It names every member of an array, so it has no single target, and that is
a different claim from a path being nested.

Two `data` hints on the same block whose paths nest — `cta` and `cta.label` — are refused at
registration. Two holes over one value have no defined order of application, and picking one
silently would make the artifact depend on the order the hints were written in.

Rejected: refusing a nested `data` hint at registration instead. It would make `data` the only
hint kind that cannot speak the path vocabulary the rest of the hint system uses, contradict
the reason the array-member check gives for itself, and withdraw a capability the renderer
already has.
