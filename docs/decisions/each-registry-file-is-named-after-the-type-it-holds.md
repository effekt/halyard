---
title: "Each registry file is named after the type it holds"
summary: The naming convention that keeps the compile-side and render-side registries apart
status: stable
---

# Each registry file is named after the type it holds

`@nubbin/core` exports `createRegistry(blocks): Registry`, the compile-side registry that
`compile` validates against. `@nubbin/react` exports `defineRegistry(map): BlockRegistry`, the
render-side map of lazy importers. Two registries exist on purpose — it is the catalog/registry
split as a consumer meets it, and the render path imports only the second.

A consumer's `registry.ts` holds the `Registry`. A consumer's `blockRegistry.ts` holds the
`BlockRegistry`. Two plans crossed these, so `blockRegistry.ts` held a `Registry` and
`registry.ts` held a `BlockRegistry`, and the catch-all went on importing `@/nubbin/registry`
and receiving the wrong kind of object — a mismatch no gate can see, because both files exist
and both typecheck in isolation.

The alternative was letting whichever plan shipped first fix the names by convention. It was
rejected because the names had already diverged across two phases and five dependent tasks, and
a convention nobody can check is how they diverged.

**The earlier phase owns the artifact; the later phase consumes it.** Phase 2 needs the demo's
blocks, catalog, both registries, the publish script and the catch-all to demonstrate its own
thesis, so ownership cannot move to Phase 3 without blocking the earlier phase on the later one.
