---
title: The Next.js Binding
summary: The @nubbin/next surface as shipped — route resolution, static params, hole fetch options, and the two publish calls
status: reference
---

# The Next.js binding

This page describes the shipped surface of `@nubbin/next`: `resolveArtifact`,
`routeFromSlug`, `staticRouteParams`, `holeFetchOptions`, `publishRoute` and `unpublishRoute`.
Every one takes an `ArtifactStore` or a core type and holds no state of its own, so a consumer
substituting a different store or a different framework replaces the binding and keeps the
contract.

## `resolveArtifact`

```ts
function resolveArtifact(
  store: ArtifactStore,
  slug: readonly string[] | undefined,
): Promise<Artifact | null>
```

The whole production read path: one pointer read, then one artifact read.

**`null` means the caller renders a real 404.** An unpublished route has no pointer, which is
what makes unpublishing produce a server 404 rather than an empty page.

## `routeFromSlug`

```ts
function routeFromSlug(slug: readonly string[] | undefined): string
```

Catch-all params to the route string that artifacts and pointers are keyed by. An absent or
empty slug is `"/"`; otherwise the segments are joined under a leading slash.

## `staticRouteParams`

```ts
function staticRouteParams(store: ArtifactStore): Promise<{ slug: string[] }[]>
```

A `generateStaticParams` source. It reads `store.manifest()`, which is advisory and exists for
exactly this — no request is ever served through it.

Pointers whose `matchKind` is not `"exact"` are excluded until pattern routing is settled by
[#5](https://github.com/effekt/nubbin/issues/5).

## `holeFetchOptions`

```ts
function holeFetchOptions(
  spec: FieldHintData,
): RequestInit & { next?: { revalidate: number } }
```

Maps a hole's declared lifecycle onto Next's fetch cache, so the mapping is owned by the binding
rather than re-decided inside every consumer's resolver. `"request"` becomes
`{ cache: "no-store" }`, which also makes a page carrying a request hole dynamic — per-request
resolution is what that hole declared. A `{ revalidate: n }` spec becomes
`{ next: { revalidate: n } }`.

It takes core's `FieldHintData` directly rather than deriving a local spec type from
`ArtifactNode["holes"]`: core exports the type by name, so both packages import it from core.

## `publishRoute` and `unpublishRoute`

```ts
function publishRoute(store: ArtifactStore, route: string, hash: string): Promise<void>
function unpublishRoute(store: ArtifactStore, route: string): Promise<void>
```

**Pointer first, invalidation second.** The reverse order re-caches the outgoing page during the
gap, and the publish then appears to have silently not happened. The store's own `publish`
rejects a hash that was never written, so a failed publish never purges a working page.

`unpublishRoute` removes the pointer and invalidates that one route, so the next request renders
a real 404.

Both import `revalidatePath` from `next/cache.js` rather than `next/cache`. Next ships no
`exports` map and ESM does not do extension resolution, so the bare subpath resolves only
through a bundler — and a publish script run under plain node is a legitimate consumer.
