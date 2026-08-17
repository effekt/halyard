# @nubbin/store-fs

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
