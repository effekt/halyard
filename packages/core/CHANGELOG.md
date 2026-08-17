# @nubbin/core

## 0.1.0-rc.2

### Patch Changes

- a875486: No runtime change. The example application now types its block props with `InferProps` from
  this package rather than zod's `z.infer`, so the reference an adopter copies demonstrates the
  validator-agnostic type.
- 37e20c6: Documentation only. The agent environment record described the `PostToolUse` chain by a count
  that was wrong; it now describes the chain.
- 337fcba: Tooling only. Every package is now installed from its own tarball into an empty project and
  imported before a release, so a package that resolves in the workspace but not on a consumer's
  disk fails a gate rather than a user.
- 0672a37: Tooling only. A package declaring a peer dependency nothing in it imports now fails a gate.
  npm installs peers by default, so an unused one is something a consumer receives for nothing.

## 0.1.0-rc.1

### Minor Changes

- 577550f: The storage and binding halves of the render path.
  
  `@nubbin/store-fs` is a pointer-per-route artifact store, proven against a contract suite any
  adapter can run. `@nubbin/next` resolves an artifact through one pointer read, prebuilds exact
  routes, and publishes or unpublishes a single route with the invalidation that makes an
  unpublish a served 404. `@nubbin/react` resolves declared holes. `@nubbin/core` gains
  `parseMatchKind`, so no adapter derives a route's match kind itself, and `InferProps`.
