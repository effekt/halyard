# @nubbin/next

## 0.1.0-rc.2

### Patch Changes

- 13a978a: The package can now be imported outside a bundler. It imported `next/cache`, a bare subpath
  that resolves only through a bundler — Next ships no `exports` map and ESM does not do
  extension resolution, so plain Node failed at import with `ERR_MODULE_NOT_FOUND`. Because the
  package entry re-exports everything, that took the read-path functions down with it. The
  specifier is now `next/cache.js`, which resolves both ways.
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
