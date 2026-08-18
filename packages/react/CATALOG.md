# @nubbin/react

The React render path for Nubbin: render a compiled artifact against a block registry.

| Export | Kind | Summary |
|---|---|---|
| [`defineRegistry`](src/defineRegistry.ts) | fn | Identity at runtime. |
| [`HoleContext`](src/holes.types.ts) `HoleResolver` | type |  |
| [`invokeBlock`](src/invokeBlock.ts) | fn | Invokes the block and stamps its root. |
| [`loadBlocks`](src/loadBlocks.ts) | fn | Resolves only the named importers, in parallel. |
| [`BlockComponent`](src/registry.types.ts) `BlockRegistry` | type | `P` is the block's own props, so a block author has a name for their component — `BlockComponent<HeroProps>`. |
| [`Renderer`](src/Renderer.ts) | fn | An async server component. |
| [`RendererProps`](src/renderer.types.ts) `RenderContext` | type | `resolveHole` is written `?: HoleResolver \| undefined` rather than `?: HoleResolver` because… |
| [`renderNode`](src/renderNode.ts) | fn | One node, then its slots, then the block. |
| [`renderSlots`](src/renderSlots.ts) | fn | Slot children reach the block as props: `slots.sections` becomes `props.sections`, an array the block places itself. |
| [`resolveNodeHoles`](src/resolveNodeHoles.ts) | fn | The static path is the fast path: no holes means the frozen props object is returned as-is, with no clone and no… |
