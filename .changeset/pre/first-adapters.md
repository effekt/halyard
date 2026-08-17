---
"@nubbin/core": minor
"@nubbin/react": minor
"@nubbin/next": minor
"@nubbin/store-fs": minor
---

The storage and binding halves of the render path.

`@nubbin/store-fs` is a pointer-per-route artifact store, proven against a contract suite any
adapter can run. `@nubbin/next` resolves an artifact through one pointer read, prebuilds exact
routes, and publishes or unpublishes a single route with the invalidation that makes an
unpublish a served 404. `@nubbin/react` resolves declared holes. `@nubbin/core` gains
`parseMatchKind`, so no adapter derives a route's match kind itself, and `InferProps`.
