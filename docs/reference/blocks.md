---
title: Blocks and the Registry
summary: defineBlock and createRegistry as shipped — signatures, what registration rejects, and what the fingerprint covers
status: reference
---

# Blocks and the registry

This page describes the shipped behaviour of `defineBlock` and `createRegistry` and the types
they take and return: `Block`, `InferProps`, `SlotConstraint`, `UnknownProps` and `Registry`.
The source of record is `packages/core/src/index.ts`; the reasoning behind the shape lives in
[`api.md`](../api.md) and [the decisions](../decisions/README.md).

## `defineBlock`

```ts
function defineBlock<Schema extends StandardSchemaV1, Component>(
  block: Block<Schema, Component>,
): Block<Schema, Component>;
```

At runtime it returns its argument unchanged. Its job is to fix the two generic parameters at
the call site, so the component's props are derived from the schema — see
[Props inferred from the schema, never declared](../decisions/props-inferred-from-the-schema-never-declared.md).

Derived from `packages/core/src/defineBlock.test.ts` and the demo's
`examples/demo/src/blocks/Hero.block.ts`:

```ts
import { defineBlock } from "@nubbin/core";
import type { InferProps } from "@nubbin/core";
import { z } from "zod";

const heroSchema = z.object({
  headline: z.string(),
  tone: z.enum(["light", "dark"]),
});

type HeroProps = InferProps<typeof heroSchema>;
// { headline: string; tone: "light" | "dark" }

const Hero = (props: HeroProps) => null;

export const heroBlock = defineBlock({
  name: "Hero",
  schema: heroSchema,
  component: Hero,
  version: 1,
  slots: {},
});
```

`defineBlock` throws on the mistakes the type system cannot catch:

| Rejected | Why |
|---|---|
| A `version` that is not an integer of 1 or more | Artifacts record the block versions they compiled against, and a version below 1 has no artifact that could record it |
| A slot whose `min` exceeds its `max` | No composition could satisfy it |

## `Block`

```ts
interface Block<Schema extends StandardSchemaV1 = StandardSchemaV1, Component = unknown> {
  name: string;
  schema: Schema;
  component: Component;
  version: number;
  status?: "active" | "deprecated";
  slots: Record<string, SlotConstraint>;
}
```

| Field | Behaviour as shipped |
|---|---|
| `name` | The stable identity every document node resolves through. Renaming it is a migration, not an edit. |
| `schema` | Any [Standard Schema](https://standardschema.dev). Validation always calls the schema's own `~standard.validate`; a schema that validates asynchronously is refused with an error, because compile and registration are synchronous. |
| `component` | Opaque to `core`, which imports no rendering library. `@nubbin/react` narrows it. |
| `version` | Bumped when the schema changes incompatibly. Recorded per block into every artifact — see [`checkRollback`](artifacts.md#checkrollback). |
| `status` | A deprecated block still resolves and still compiles. The field is data for an editing surface. |
| `slots` | Declared per name; a slot a document fills without declaring is a compile error (`slot-not-allowed`). |

## `InferProps`

```ts
type InferProps<Schema extends StandardSchemaV1> = StandardSchemaV1.InferOutput<Schema>;
```

The output side of the schema, not the input side: a component receives what `validate()`
returned, so a field a transform reshaped arrives in its transformed form.

## `SlotConstraint`

```ts
interface SlotConstraint {
  allow?: readonly string[];
  min?: number;
  max?: number;
}
```

`allow` lists the block names permitted in the slot; omitted means any registered block. `min`
and `max` bound how many children the slot holds, and both are checked at compile — a declared
slot the document leaves unfilled counts as holding zero, so a `min` is enforced even on a
slot the document never mentions.

## `UnknownProps`

```ts
type UnknownProps = Record<string, unknown>;
```

Props before validation has run — what a document node carries, and what a document operation
writes.

## `createRegistry`

```ts
function createRegistry(blocks: readonly Block[]): Registry;
```

Derived from `packages/core/src/createRegistry.test.ts`:

```ts
import { createRegistry, defineBlock } from "@nubbin/core";
import { z } from "zod";

const pageBlock = defineBlock({
  name: "Page",
  schema: z.object({ title: z.string() }),
  component: null,
  version: 1,
  slots: { items: { allow: ["Testimonial"] } },
});

const testimonialBlock = defineBlock({
  name: "Testimonial",
  schema: z.object({ quote: z.string() }),
  component: null,
  version: 1,
  slots: {},
});

const registry = createRegistry([pageBlock, testimonialBlock]);

registry.get("Page")?.name; // "Page"
registry.get("Nope"); // undefined
registry.names(); // ["Page", "Testimonial"]
```

Slot `allow` lists resolve only once every block is in, so an entry may reference a block
that appears later in the array — its order carries no meaning.

`createRegistry` throws on:

| Rejected | Why |
|---|---|
| Two blocks sharing a `name` | Names are the identity nodes resolve through, so a duplicate would make resolution depend on order |
| An `allow` entry naming no registered block | The slot would silently reject every child, including the one the author meant. Every unresolvable entry is reported at once, quoted as `"entry" (Block.slot)` |

## `Registry`

```ts
interface Registry {
  get(name: string): Block | undefined;
  names(): string[];
  fingerprint(): string;
}
```

The fingerprint hashes every block's `name` and `version` and nothing else. Its observed
properties, each pinned by a test in `packages/core/src/createRegistry.test.ts`:

- registration order does not change it — the pairs are sorted before hashing;
- changing any block's `version` changes it;
- a slot constraint, a `status`, or any other field changes nothing, so unrelated edits do
  not invalidate artifacts compiled before them.

`compile` stamps the fingerprint into each artifact as `registryFingerprint` — see
[`Artifact`](artifacts.md#artifact).
