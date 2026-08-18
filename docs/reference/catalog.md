---
title: The Catalog
summary: defineCatalog as shipped — entries, field hints, defaults, and the schema introspection types
status: reference
---

# The catalog

This page describes the shipped behaviour of `defineCatalog` and the types around it:
`Catalog`, `CatalogEntry`, `BlockUi`, `FieldHint`, `FieldHintData`, `BlockDocs`, and the
introspection contract `SchemaAdapter` with its `FieldNode` and `FieldKind`. Why the catalog
exists apart from the registry is
[Catalog and registry are separate](../decisions/catalog-and-registry-are-separate.md); why
hints sit beside the schema rather than inside it is
[Editing hints live beside the schema, not inside it](../decisions/editing-hints-live-beside-the-schema-not-inside-it.md).

## `defineCatalog`

```ts
function defineCatalog(entries: Record<string, CatalogEntry>): Catalog;
```

Returns its argument after checking everything checkable at registration, because a bad hint
or bad defaults are silent at every later point. Derived from
`packages/core/src/defineCatalog.test.ts` and the demo's
`examples/demo/src/nubbin/catalog.ts`:

```ts
import { defineCatalog } from "@nubbin/core";
import { z } from "zod";

const statBandSchema = z.object({
  heading: z.string(),
  stats: z.array(z.object({ label: z.string(), value: z.string() })),
});

export const catalog = defineCatalog({
  StatBand: {
    schema: statBandSchema,
    defaults: { heading: "By the numbers", stats: [] },
    ui: { fields: { stats: { data: "request" } } },
  },
});
```

It throws on:

| Rejected | Why |
|---|---|
| A `ui.fields` key naming a path the schema does not define | An unresolvable hint is invisible at runtime — the inspector falls back to a default treatment and renders something plausible. The error names the block, every bad path, and the paths the schema does define |
| `defaults` that fail the entry's own schema | Defaults are what a freshly dropped block renders with, so invalid defaults produce a block that is broken the instant it is placed |

Hint paths are resolved by reading the schema through the Standard JSON Schema converter the
schema itself exposes (`~standard.jsonSchema`, Standard Schema spec 1.1) — the package calls
no validator function and imports no validator. Two consequences, both thrown at
registration:

- a schema that does not expose the converter is rejected when its entry carries `ui.fields`;
- a field JSON Schema cannot express is rejected rather than degraded, because the converter
  runs with `unrepresentable: "throw"`.

`defaults` are validated with the schema's own `~standard.validate`, which must be
synchronous — an async validator is refused with an error.

An entry carrying only `schema` is stored as-is; both checks run only when the fields they
check are present.

## `Catalog` and `CatalogEntry`

```ts
type Catalog = Record<string, CatalogEntry>;

interface CatalogEntry {
  schema: unknown;
  ui?: BlockUi;
  defaults?: UnknownProps;
  docs?: BlockDocs;
}
```

Keys are block names — the same names the [registry](blocks.md#createregistry) resolves. The
entry is serializable data only: schema, hints, defaults, docs, and never a component. That is
the catalog/registry split — an editing surface and CI read the catalog; rendering needs the
registry.

`schema` is typed `unknown` rather than `StandardSchemaV1` because the capability actually
required — the JSON Schema converter — is narrower than the validation interface, and the
runtime check happens either way.

## `BlockUi` and `FieldHint`

```ts
interface BlockUi {
  fields?: Record<string, FieldHint>;
}

interface FieldHint {
  label?: string;
  control?: string;
  data?: FieldHintData;
}
```

`fields` is keyed by schema path in dotted form, with `[]` addressing array members:
`title`, `cta.label`, `items[].icon`. Every key must resolve against the entry's schema —
see the registration checks above. Why paths rather than a mapped type, and how a control is
chosen from a hint, are argued in [`api.md`](../api.md).

## `FieldHintData`

```ts
type FieldHintData = "request" | { revalidate: number };
```

How a field's value resolves at render. An absent `data` hint means static: the value freezes
into the artifact's props at compile. `"request"` resolves fresh on every render;
`{ revalidate: n }` is stale-while-revalidate. The three states and the reasoning are
[Data lifecycle is per field](../architecture.md#data-lifecycle-is-per-field); what the
compiler does with the hint is on the [compile page](compile.md#holes-what-a-data-hint-compiles-to).

## `BlockDocs`

```ts
interface BlockDocs {
  summary?: string;
  usage?: string;
}
```

Prose for an editing surface's palette and inspector. The package stores it and reads none of
it.

## `SchemaAdapter`, `FieldNode` and `FieldKind`

```ts
interface SchemaAdapter {
  describe(schema: unknown): FieldNode[];
}

interface FieldNode {
  path: string;
  kind: FieldKind;
  optional: boolean;
  members?: readonly string[];
}

type FieldKind =
  | "string"
  | "number"
  | "boolean"
  | "enum"
  | "array"
  | "object"
  | "union"
  | "unknown";
```

`SchemaAdapter` is the contract for reading a schema's field structure: `describe` returns
one `FieldNode` per addressable path, in the same dotted form hint keys use. The schema root
itself has no path, so the result is exactly the set of paths a hint may target. `members` is
present only when `kind` is `"enum"`. `defineCatalog` resolves hint paths through an internal
adapter built on the Standard JSON Schema converter; the type is exported so a consumer can
describe schemas with the same shape.
