---
title: Artifacts, Pointers and Rollback
summary: The Artifact and ArtifactStore contracts as shipped, with the compatibility and rollback checks
status: reference
---

# Artifacts, pointers and rollback

This page describes the shipped output-layer contracts of `@nubbin/core`: the `Artifact`,
`ArtifactNode` and `Holes` shapes `compile` produces, the `ArtifactStore` interface adapters
implement, `RoutePointer` and `Manifest`, and the functions that operate on them — `checkCompatibility`,
`formatCompatibilityReport`, `checkRollback` and `parseMatchKind`. Why artifacts are immutable and addressed by content is
[Artifacts are immutable and content-addressed](../decisions/artifacts-are-immutable-and-content-addressed.md);
what they may contain is
[Artifacts contain data, never code](../decisions/artifacts-contain-data-never-code.md).

## `Artifact`

```ts
interface Artifact {
  hash: string;
  route: string;
  documentId: string;
  documentVersion: number;
  registryFingerprint: string;
  blockVersions: Record<string, number>;
  tree: ArtifactNode[];
  meta: DocumentMeta;
  compiledWith: string;
}
```

| Field | Behaviour as shipped |
|---|---|
| `hash` | The content address, and the identity. Computed over every other field with object keys sorted first, so the same content always produces the same address. |
| `route` | The route this compile targeted, as passed to [`compile`](compile.md#compile). |
| `documentId`, `documentVersion` | Which document version this is the compilation of. |
| `registryFingerprint` | The [registry fingerprint](blocks.md#registry) at compile time — every registered block's name and version. |
| `blockVersions` | Name → version for only the blocks the document uses; a route loads what its artifact lists, so naming unused blocks would load them too. [`checkRollback`](#checkrollback) reads this field. |
| `tree` | The document's `roots`, denormalized — one tree per entry element, in the order `roots` names them. |
| `meta` | The document's `DocumentMeta`, carried through unchanged. |
| `compiledWith` | The `@nubbin/core` version that produced the artifact. |

## `ArtifactNode` and `Holes`

```ts
interface ArtifactNode {
  id: string;
  block: string;
  props: UnknownProps;
  holes?: Holes;
  slots?: Record<string, ArtifactNode[]>;
}

type Holes = Record<string, FieldHintData>;
```

Fully resolved: `slots` hold nested nodes rather than ids, so rendering needs no lookups and
no dangling reference is possible. `props` hold only frozen literal values; each entry in
`holes` records a field the renderer resolves instead, keyed by schema path and carrying the
[`FieldHintData`](catalog.md#fieldhintdata) that says how — see
[Holes: what a `data` hint compiles to](compile.md#holes-what-a-data-hint-compiles-to). How a
hole's value is sourced at render is per-adapter; who may aim one at a data source is the open
design question [#86](https://github.com/effekt/nubbin/issues/86).

## `checkRollback`

```ts
function checkRollback(artifact: Artifact, registry: Registry): RollbackCheck;

type RollbackCheck = { compatible: true } | { compatible: false; drifted: string[] };
```

Compares what the artifact was compiled against — its `blockVersions` — with the registry
live now, before a pointer is moved back to it. It returns rather than throws: the caller
decides whether drift blocks the rollback. The model is
[Rollback](../domain-model.md#rollback).

Derived from `packages/core/src/checkRollback.test.ts`:

```ts
import { checkRollback, createRegistry, defineBlock } from "@nubbin/core";
import type { Artifact } from "@nubbin/core";
import { z } from "zod";

const heroAtV2 = defineBlock({
  name: "Hero",
  schema: z.object({ title: z.string() }),
  component: null,
  version: 2,
  slots: {},
});

const artifact: Artifact = {
  hash: "h",
  route: "/promotions/summer",
  documentId: "promotions-summer",
  documentVersion: 1,
  registryFingerprint: "f",
  blockVersions: { Hero: 1 },
  tree: [],
  meta: { title: "Summer promotion" },
  compiledWith: "0.0.0",
};

checkRollback(artifact, createRegistry([heroAtV2]));
// { compatible: false, drifted: ["Hero"] }
```

`drifted` names every block whose registered version differs from the recorded one — and a
block the registry no longer holds at all counts as drift, because a deleted block is exactly
the failure a rollback must be warned about.

## `checkCompatibility`

```ts
function checkCompatibility(live: readonly LiveRoute[], registry: Registry): CompatibilityReport;

interface LiveRoute {
  pointer: RoutePointer;
  artifact: Artifact | null;
}

interface BlockDrift {
  block: string;
  live: number;
  registered: number | null;
}

type RouteIncompatibility =
  | { route: string; hash: string; reason: "unreadable-artifact" }
  | { route: string; hash: string; reason: "block-drift"; drifted: BlockDrift[] };

interface CompatibilityReport {
  checked: number;
  compatible: boolean;
  incompatible: RouteIncompatibility[];
}
```

The same comparison as `checkRollback`, run over every pointer instead of one artifact, and
reported with the version delta a reader needs to act: which route, which artifact, which block,
what the page was compiled against, and what is registered now. `registered: null` is a block
the registry has lost. A pointer whose hash the store cannot resolve is incompatible on its own,
since that route is broken with no registry change involved.

It takes the pointers and artifacts rather than the store, because passing an `ArtifactStore`
would put IO inside the package whose portability is the point, and would exclude any consumer
whose live state does not sit behind that interface. Reading is three lines and belongs to the
caller:

```ts
const { routes } = await store.manifest();
const live = await Promise.all(
  routes.map(async (pointer) => ({ pointer, artifact: await store.read(pointer.hash) })),
);
const report = checkCompatibility(live, registry);
```

`checked` is on the report because a run that read no pointers is compatible with everything.
A caller asserts on it before trusting the verdict, or a store the check never reached reads as
a pass.

## `formatCompatibilityReport`

```ts
function formatCompatibilityReport(report: CompatibilityReport): string;
```

The report as a log reads it, leading with the count in both directions:

```
2 of 8 live route pointer(s) are incompatible with this registry:
  /  (artifact 4a162726)
    Hero: page needs v1, registry has v2
    LogoWall: page needs v1, no longer in the registry
  /about  (artifact 8be9f4fd)
    Hero: page needs v1, registry has v2
```

## `ArtifactStore`

```ts
interface ArtifactStore {
  read(hash: string): Promise<Artifact | null>;
  write(artifact: Artifact): Promise<void>;
  manifest(): Promise<Manifest>;
  pointer(route: string): Promise<RoutePointer | null>;
  publish(route: string, hash: string): Promise<void>;
  unpublish(route: string): Promise<void>;
}
```

The output layer's whole IO surface. `core` only returns values for it; adapters implement
it — `@nubbin/store-fs` is the reference implementation, and every implementation is proven
against one shared suite, `packages/store-fs/src/testing/runArtifactStoreContract.ts`. The
behaviour that suite pins:

| Guarantee | Meaning |
|---|---|
| `read` of an unknown hash is `null` | Absence is a value, never a throw |
| `write` of an already-stored hash is a no-op | Artifacts are content-addressed, so rewriting identical content changes nothing |
| `publish` parses `matchKind` from the route | Via [`parseMatchKind`](#parsematchkind) — callers never supply it |
| `publish` of a hash that was never written rejects | No pointer may dangle |
| `publish` of the same route and hash twice is a no-op | Republishing is safe |
| `unpublish` removes the pointer and keeps the artifact | Unpublishing takes a route offline; it destroys nothing, and a missing pointer is tolerated |

Publishing never mutates an artifact — it writes a new one and moves the route's pointer,
which is what makes cache invalidation at the store unnecessary.

## `RoutePointer` and `Manifest`

```ts
interface RoutePointer {
  route: string;
  matchKind: "exact" | "param" | "prefix";
  hash: string;
  updatedAt: string;
}

interface Manifest {
  routes: RoutePointer[];
  generatedAt: string;
}
```

The pointer is the single piece of output-layer state that changes in place — each route owns
its own record, naming the artifact currently live there. Why per-route pointers beat one
mutable manifest is [Route pointer](../domain-model.md#route-pointer). `Manifest` is the advisory
aggregation over every pointer — a route list for an editing surface or CI, derived rather
than authoritative.

## `parseMatchKind`

```ts
function parseMatchKind(route: string): "exact" | "param" | "prefix";
```

Derives a pointer's `matchKind` from its route. It lives in `core` so every adapter shares one
implementation — a second parser is free to disagree. Derived from
`packages/core/src/parseMatchKind.test.ts`:

```ts
import { parseMatchKind } from "@nubbin/core";

parseMatchKind("/about"); // "exact"
parseMatchKind("/guides/[city]"); // "param"
parseMatchKind("/collections/*"); // "prefix"
```

A route ending in `/*` is `prefix`; otherwise a route containing a `[bracketed]` segment is
`param`; anything else, including `/`, is `exact`.
