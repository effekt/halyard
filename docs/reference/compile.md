---
title: Compiling a Document
summary: compile and setNodeProp as shipped — the document shape, the two validation passes, and every issue code CompileError can carry
status: reference
---

# Compiling a document

This page describes the shipped behaviour of `compile` and `CompileError`, and the types they
take and raise: `DocumentVersion`, `Node`, `DocumentMeta`, `CompileIssue` and
`CompileIssueCode`. Why compiling happens at publish, and why it is validation rather than a
build, is [Why compile at publish](../architecture.md#why-compile-at-publish).

## `compile`

```ts
function compile(
  version: DocumentVersion,
  catalog: Catalog,
  registry: Registry,
  route: string,
): Artifact;
```

Validates one document version and serializes it into an [`Artifact`](artifacts.md#artifact).
It throws `CompileError` on any failure and performs no IO — reading the document and writing
the artifact belong to adapters.

Validation runs in two passes, and the second runs only if the first found nothing —
prop validation over a document with dangling references would bury the real cause in
cascading noise:

1. **Structure.** Every node names a registered block, every referenced child id exists, the
   graph reaches every element from `root` without cycles, and every filled slot is declared,
   within its `min`/`max` bounds, and holds only blocks its `allow` list admits.
2. **Props.** Every node's props are validated by its catalog entry's schema — the schema's
   own `~standard.validate`, never a projection — and the parsed output is what the artifact
   keeps. A node whose block has no catalog entry is an issue here too.

Derived from `packages/core/src/compile.test.ts`:

```ts
import { compile, createRegistry, defineBlock, defineCatalog } from "@nubbin/core";
import type { DocumentVersion } from "@nubbin/core";
import { z } from "zod";

const heroSchema = z.object({ title: z.string(), price: z.number() });
const cardSchema = z.object({ label: z.string() });

const hero = defineBlock({
  name: "Hero",
  schema: heroSchema,
  component: null,
  version: 1,
  slots: { items: { allow: ["Card"], max: 2 } },
});
const card = defineBlock({
  name: "Card",
  schema: cardSchema,
  component: null,
  version: 1,
  slots: {},
});

const registry = createRegistry([hero, card]);
const catalog = defineCatalog({
  Hero: { schema: heroSchema, ui: { fields: { price: { data: "request" } } } },
  Card: { schema: cardSchema },
});

const version: DocumentVersion = {
  documentId: "d1",
  version: 1,
  root: "n1",
  elements: {
    n1: { id: "n1", block: "Hero", props: { title: "T", price: 10 }, slots: { items: ["n2"] } },
    n2: { id: "n2", block: "Card", props: { label: "L" } },
  },
  meta: { title: "Summer promotion" },
  createdAt: "2026-01-01T00:00:00Z",
  createdBy: "docs",
};

const artifact = compile(version, catalog, registry, "/promotions/summer");

artifact.tree[0]?.props; // { title: "T" }  — static fields, frozen
artifact.tree[0]?.holes; // { price: "request" }  — resolved at render instead
artifact.blockVersions; // { Hero: 1, Card: 1 }
```

Compiling the same document against the same registry yields the same `hash` every time — the
artifact is content-addressed, with key order normalized before hashing so insertion order
cannot change the address.

## Holes: what a `data` hint compiles to

After validation, each node's parsed props are split by the catalog's
[`data` hints](catalog.md#fieldhintdata). A field with no hint freezes into
`ArtifactNode.props`; a field hinted `"request"` or `{ revalidate }` is dropped from props and
recorded in `ArtifactNode.holes` under the same key, carrying the hint as the instruction for
render time. The split happens at the top level of the parsed value: each key of the validated
props lands in exactly one of the two.

## `DocumentVersion`, `Node` and `DocumentMeta`

```ts
interface DocumentVersion {
  documentId: string;
  version: number;
  root: string;
  elements: Record<string, Node>;
  meta: DocumentMeta;
  createdAt: string;
  createdBy: string;
}

interface Node {
  id: string;
  block: string;
  props: UnknownProps;
  slots?: Record<string, readonly string[]>;
}

interface DocumentMeta {
  title: string;
  description?: string;
  robots?: string;
  canonical?: string;
}
```

The authoring shape is flat: `elements` is an index keyed by id, and a node's `slots` hold
ordered child ids rather than nested nodes, so every editor operation addresses a node
directly. Compiling denormalizes it into the artifact's nested tree — the trade is
[Flat while authoring, nested once published](../decisions/flat-while-authoring-nested-once-published.md).

`root` names the single entry element, while `Artifact.tree` is an array. How that boundary
should treat a page of stacked sections — which has no single containing block — is the open
design question [#60](https://github.com/effekt/nubbin/issues/60); this page documents the
shapes as they ship and takes no position on it.

How a `DocumentVersion` is stored is the authoring store, an open design question of its own
([#11](https://github.com/effekt/nubbin/issues/11)) — so the examples here construct one as a
literal, the way the package's own tests do. Editing one is
[`setNodeProp`](#setnodeprop-and-setatpath).

## `setNodeProp` and `setAtPath`

```ts
function setNodeProp(
  version: DocumentVersion,
  nodeId: string,
  path: string,
  value: unknown,
): DocumentVersion;

function setAtPath(
  target: Record<string, unknown>,
  path: string,
  value: unknown,
): Record<string, unknown>;
```

`setNodeProp` is the first document operation: a new `DocumentVersion` with one prop set on
one node, copy-on-write, every untouched node kept by reference. It lives beside `compile`
rather than inside an editor, so every caller — a studio, a script, an agent — writes a
document through one definition of the write
([#134](https://github.com/effekt/nubbin/issues/134)).

Three deliberate absences. It does not validate the value — that is `compile`'s job at the
next compile, which reports an `invalid-props` issue at the offending path. It does not bump
`version` — appending a version belongs to the authoring store
([#11](https://github.com/effekt/nubbin/issues/11)), not to one edit. And it throws on an
unknown `nodeId` and on an `items[]` path, which names every array member rather than one.

`setAtPath` is the copy-on-write descent it writes with — the same one the renderer uses to
fill a resolved hole value into props at render time.

## `CompileError`

```ts
class CompileError extends Error {
  readonly issues: readonly CompileIssue[];
  constructor(issues: readonly CompileIssue[]);
}
```

Carries every issue found in one pass, so an author fixing six problems sees six rather than
six sequential failures. `name` is set to `"CompileError"` explicitly, so a caught error is
identifiable without `instanceof`. The message summarizes one line per issue with a leading
count. Derived from `packages/core/src/compile.test.ts`:

```ts
import { CompileError } from "@nubbin/core";

try {
  compile(version, catalog, registry, "/promotions/summer");
} catch (error) {
  if (error instanceof CompileError) {
    for (const issue of error.issues) {
      console.error(issue.nodeId, issue.path, issue.code, issue.message);
    }
  }
}
```

## `CompileIssue` and `CompileIssueCode`

```ts
interface CompileIssue {
  nodeId: string;
  path: string;
  code: CompileIssueCode;
  message: string;
}
```

`path` locates the problem inside the node: `block`, `root`, `slots.<name>`, a dotted prop
path from the schema's own issue, or `""` when the issue concerns the node as a whole.

| Code | Raised when | Pass |
|---|---|---|
| `unknown-block` | A node names a block the registry lacks, or one with no catalog entry | structure / props |
| `dangling-child` | A slot references an id with no element, or `root` does | structure |
| `cycle` | A node reaches back to an ancestor, so the graph cannot flatten into a tree | structure |
| `unreachable` | No slot reaches the node from the root | structure |
| `slot-not-allowed` | A filled slot the block never declared, or a child whose block the slot's `allow` list rejects | structure |
| `slot-min` | A declared slot holds fewer children than its `min` — an omitted slot counts as holding zero | structure |
| `slot-max` | A slot holds more children than its `max` | structure |
| `invalid-props` | The schema's `validate()` returned issues, or parsed to something other than an object | props |
