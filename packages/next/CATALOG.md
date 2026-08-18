# @nubbin/next

The Next.js binding for Nubbin: resolve a published artifact for a route, prebuild the ones that exist, and publish or unpublish a single route.

| Export | Kind | Summary |
|---|---|---|
| [`holeFetchOptions`](src/holeFetchOptions.ts) | fn | Maps a hole's declared lifecycle onto Next's fetch cache, so the mapping is owned by the binding rather than re-decided… |
| [`publishRoute`](src/publishRoute.ts) | fn | Pointer first, invalidation second. |
| [`resolveArtifact`](src/resolveArtifact.ts) | fn | The whole production read path: one pointer read, one artifact read. |
| [`routeFromSlug`](src/routeFromSlug.ts) | fn | Catch-all params to the route string artifacts and pointers are keyed by. |
| [`staticRouteParams`](src/staticRouteParams.ts) | fn | generateStaticParams source. manifest() is an advisory read for exactly this — no request ever goes through it. |
| [`SUMMER`](src/testing/artifactFixture.constants.ts) | const | One published page, reused by every read-path test so each asserts on the same shape. |
| [`refuseWrite`](src/testing/refuseWrite.ts) | fn | A write-side method for a store the read path holds. |
| [`stubStore`](src/testing/stubStore.ts) | fn | Read-side methods real, write-side throwing — this binding's read path must never write. |
| [`unpublishRoute`](src/unpublishRoute.ts) | fn | Pointer removed, then that one route invalidated — the next request renders a real 404. |
