---
title: System Architecture
summary: How the contract/content/output split and compile-at-publish pipeline work
status: stable
---

# Architecture

## The split

Three things are usually conflated in a CMS. Nubbin separates them and puts each in the
only place it can live without drifting.

| Concern | Lives in | Why there |
|---|---|---|
| **Contract** — what a block accepts | Code | Ships atomically with the component that consumes it. Two environments cannot disagree about it, because there is one commit. |
| **Content** — which blocks, in what order, with what props | A database | It changes hourly, by people without a checkout, and must publish without a deploy. |
| **Published output** — what a request actually renders | An immutable artifact | Content-addressed, so it caches forever and rolls back by pointer. |

Putting the contract in a hosted service is the mistake this project is a reaction to.
That is what forces schema-reconciliation tooling, environment promotion runbooks, and a
caching tier to survive the round trip.

## The pipeline

```
  defineBlock(schema, component)          code, in the consumer's repo
            │
   ┌────────┴────────┐
   ▼                 ▼
 catalog           registry              data the studio reads  ·  lazy imports the app resolves
   │                 │
   ▼                 ▼
 studio          compile(version, catalog, registry, route)
 (compose)             │  validate every node against its block schema
   │                   │  resolve the flat graph into a tree, freeze static values
   │                   ▼
   │             Artifact { hash, tree, holes, blockVersions, registryFingerprint }
   │                   │
   ▼                   ▼
 draft versions   store.write(artifact) → store.publish(route, hash)
 (authoring DB)        │
                       ▼
                  route pointer            one atomic record per route
                       │
                       ▼
                  <Renderer artifact registry />   loads only the blocks it names
```

**Catalog and registry are separate.** The pipeline splits at `defineBlock` for that reason:
one branch is inert data any environment can validate against, the other is a set of importers
a bundler can follow. Chosen over one flat list of components, which forces every page to load
all of them — [the decision](decisions.md#catalog-and-registry-are-separate).

**Documents are flat while authoring, nested once published.** The draft shape is
`{ root, elements }` keyed by id, so an editor addresses a node directly instead of walking a
tree to find it. Compile denormalizes that into the self-contained tree the renderer reads,
checking reference integrity, cycle-freedom and reachability on the way —
[the decision](decisions.md#flat-while-authoring-nested-once-published) has the rest.

## Why compile at publish

Validation at publish means an invalid page cannot be published — the failure surfaces to
the person who caused it, while they are looking at it. The render path does no schema work
per request: frozen fields were proven valid at compile, and hole data is fetched by the
block's own code, outside schema validation.

It also lets the compiler do real work once instead of per request: resolve references,
freeze values that cannot change, and record which block versions the artifact was built
against.

**Compiling is not building.** It validates and serializes; no bundler is involved. Publish
and preview never require a deploy — only a *code* change does.

## Data lifecycle is per field

A field declares whether its value is frozen at publish or resolved per request. Per field,
not per block — a hero's headline can freeze while its price stays live, and forcing that
choice at block level would mean forking the block.

| Mode | Meaning |
|---|---|
| static | Default. Frozen into the artifact. |
| `request` | A typed hole the render path fills on every request. |
| `revalidate: <seconds>` | Cached, refreshed on an interval. |

The artifact therefore holds a fully-resolved tree plus a small number of declared holes,
and the request path fetches only what genuinely varies.

## Serving

For Next.js consumers, a catch-all route pairs with incremental static regeneration:

- `generateStaticParams` enumerates known routes from the route pointers.
- `dynamicParams: true` means a page created minutes ago — absent from that list — is still
  reachable. The catch-all resolves it, renders, and caches. **This is what makes "publish
  without deploy" true in practice rather than in principle.**
- Publishing calls `revalidatePath(route)`, invalidating exactly one page.

A recommendation for the Next binding, not a requirement of `core`.

## Artifacts contain data, never code

Every value an artifact holds is inert data validated against a schema, so the render path
evaluates nothing it loads and a published page cannot execute anything its author typed. The
list of what that rules out, and the security and performance case for it, is
[the decision](decisions.md#artifacts-contain-data-never-code).

## Preview

The studio is not a re-implementation of the app. The canvas is the real app,
server-rendered, so what an author sees is what the app renders.

There is **one** preview mode, not two. Every page renders through the server catch-all, so
a draft preview is that same code path given a draft version instead of a published
artifact. Client-side re-render from a posted tree is impossible for a server component —
its code never reaches the browser — so the canvas updates **on commit**: the inspector
holds local state while typing, a committed change is written to the draft store, and the
canvas re-renders from the server.

See [`studio.md`](studio.md) for the canvas and its delivery surfaces.

## Versioning and the guardrail

Every artifact records the block versions and registry fingerprint it was compiled against.

That makes the guardrail possible, and it is a **required, failing check** rather than a
report: if a registry change would invalidate any artifact a live route pointer references,
CI fails. Deleting a block is treated exactly like an incompatible version bump. An advisory
check that engineers can merge past reproduces the failure it exists to prevent.

The same comparison runs before a rollback, since moving a pointer back to an older artifact
can otherwise feed frozen props to a component that has since changed.
