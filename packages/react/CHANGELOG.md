# @nubbin/react

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
