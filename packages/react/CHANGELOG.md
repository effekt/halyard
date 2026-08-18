# @nubbin/react

## 0.1.0-rc.5

### Minor Changes

- fa8d12b: `@nubbin/react` exports `BlockComponent`, `BlockRegistry` and `defineRegistry`. A block author
  names their own component type as `BlockComponent<HeroProps>`; the registry holds
  `BlockComponent<never>`, so a component declaring its own props is assignable to it — function
  parameters are contravariant, and the widest props type is assignable from nothing. Installing
  this package now installs React, because these types import `ReactNode`.
- 388416d: `@nubbin/react` exports `Renderer`, an async server component that walks an artifact's tree,
  loads only the blocks the artifact names, fills each node's holes, and stamps
  `data-nubbin-node` on the root element each block returns. It invokes the block rather than
  creating an element from it, because invoking is what puts that root element in hand to clone —
  so a block is a server component with exactly one root, and no wrapper element is introduced.
  
  `resolveNodeHoles` and `setAtPath` are no longer exported: hole resolution is what `Renderer`
  does with them, and a surface that also exposes the steps invites a second render path that
  stamps nothing. `Renderer`, `defineRegistry` and `loadBlocks` are the runtime surface.

### Patch Changes

- Updated dependencies [1931dd8]
- Updated dependencies [a79f39a]
  - @nubbin/core@0.1.0-rc.5

## 0.1.0-rc.4

### Patch Changes

- Updated dependencies [97144e9]
- Updated dependencies [dd9c3b3]
  - @nubbin/core@0.1.0-rc.4

## 0.1.0-rc.3

### Patch Changes

- b19d23e: Every package now carries a README, a licence and repository metadata. Their npm pages showed
  "ERROR: No README data found!", and three of the four declared no licence at all on an MIT
  project.
- Updated dependencies [8a01bab]
- Updated dependencies [3495902]
- Updated dependencies [cb596fa]
- Updated dependencies [d42f112]
- Updated dependencies [3c65495]
- Updated dependencies [b19d23e]
  - @nubbin/core@0.1.0-rc.3

## 0.1.0-rc.2

### Patch Changes

- 38a0d6c: Installing this package no longer installs React. It declared React as a peer dependency, which
  npm installs by default, while importing nothing from it — the units it ships today resolve
  holes and set values at a path, and neither renders. The peer returns with the renderer, which
  is the point at which it becomes true.
- Updated dependencies [a875486]
- Updated dependencies [37e20c6]
- Updated dependencies [337fcba]
- Updated dependencies [0672a37]
  - @nubbin/core@0.1.0-rc.2

## 0.1.0-rc.1

### Minor Changes

- 577550f: The storage and binding halves of the render path.
  
  `@nubbin/store-fs` is a pointer-per-route artifact store, proven against a contract suite any
  adapter can run. `@nubbin/next` resolves an artifact through one pointer read, prebuilds exact
  routes, and publishes or unpublishes a single route with the invalidation that makes an
  unpublish a served 404. `@nubbin/react` resolves declared holes. `@nubbin/core` gains
  `parseMatchKind`, so no adapter derives a route's match kind itself, and `InferProps`.

### Patch Changes

- Updated dependencies [577550f]
  - @nubbin/core@0.1.0-rc.1
