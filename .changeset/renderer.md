---
"@nubbin/react": minor
---

`@nubbin/react` exports `Renderer`, an async server component that walks an artifact's tree,
loads only the blocks the artifact names, fills each node's holes, and stamps
`data-nubbin-node` on the root element each block returns. It invokes the block rather than
creating an element from it, because invoking is what puts that root element in hand to clone —
so a block is a server component with exactly one root, and no wrapper element is introduced.

`resolveNodeHoles` and `setAtPath` are no longer exported: hole resolution is what `Renderer`
does with them, and a surface that also exposes the steps invites a second render path that
stamps nothing. `Renderer`, `defineRegistry` and `loadBlocks` are the runtime surface.
