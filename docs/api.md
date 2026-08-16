---
title: API Sketch
summary: Shape of defineBlock through compile and render, and where UI hints live
status: draft
---

# API sketch

Pseudocode, not final signatures. The point is the shape and where each concern lives.

## At a glance

```ts
// cta.schema.ts — a sub-schema, extracted so five blocks can share it
export const ctaSchema = z.object({ label: z.string(), href: z.string() });

// hero.schema.ts
export const heroSchema = z.object({
  title: z.string(),
  tone: z.enum(["light", "dark"]),
  image: z.string(),
  cta: ctaSchema,
  bullets: z.array(bulletSchema).max(4),
});

// hero.block.ts
export const heroBlock = defineBlock({
  name: "Hero",
  schema: heroSchema,
  component: Hero,          // props are InferProps<typeof heroSchema>
  version: 1,
  ui: {
    order: ["title", "tone", "image", "cta", "bullets"],
    groups: [
      { label: "Content", fields: ["title", "image", "cta", "bullets"] },
      { label: "Style", fields: ["tone"] },
    ],
    fields: {
      title: { label: "Headline", placeholder: "Say the thing" },
      image: { control: "image" },        // resolved from the control registry
      bullets: { rowLabel: "heading" },   // collapsed rows read as their own heading
    },
  },
});
```

## Where UI hints live

Hybrid, split on "intrinsic to the field" versus "specific to this surface":

| Concern | Lives in | Why |
|---|---|---|
| Type, validation, required, defaults | Schema | It is the contract. Props are inferred from it. |
| Conditional visibility | Schema (discriminated union) | Changes what is *valid*, not merely what is shown. |
| Label, placeholder, order, grouping, control choice, row labels | `ui`, keyed by field path | Presentation varies per surface — the same block renders in a sidebar, a modal, and a popover. |
| Static vs. request-time resolution (`data`) | `ui`, keyed by field path | Per-field, not per-block — a hero's headline can freeze while its price stays live. |

Rejected: embedding hints via each validator's own metadata slot (zod `.meta()`, valibot
`v.metadata()`, arktype `.configure()`) behind one adapter. See
[Editing hints live beside the schema, not inside it](decisions.md#editing-hints-live-beside-the-schema-not-inside-it).

## Introspection is still needed, and is per-validator

Hints living outside the schema does not remove the need to read it — the editor must still
discover what fields exist and what type each is, and Standard Schema will not tell us.

```ts
interface SchemaAdapter {
  describe(schema: StandardSchemaV1): FieldNode[];   // path, kind, optional, enum members
}
```

Resolution order:

1. **`toJSONSchema()`** where the validator offers it — a specified, stable output. Handle
   its `unrepresentable` option explicitly; the default throws, which would fail block
   registration mid-build.
2. **Internal traversal** (e.g. `._zod.def` on zod v4) only for types JSON Schema cannot
   express. Documented but not stability-guaranteed — zod's v3 `._def` was renamed once
   already, breaking dependents.

Both paths stay behind one adapter module, version-pinned and tested, so the renderer never
touches a validator's internals. zod is the reference implementation; other validators follow
with explicit capability-gating rather than silent degradation.

A parallel `ui` structure risks silent drift: a key that no longer refers to a real property.
Every path is resolved against the schema at `createRegistry()`, so an unresolvable key fails
registration — see below.

A CI check covers what path resolution cannot: every block has a resolvable control for every prop, so
a schema change cannot leave a field un-editable.

## Control resolution: ranked testers, not a keyed map

A keyed map (`{ string: TextControl, image: ImagePicker }`) dispatches on one dimension only
and is closed to extension — a consumer wanting a rich picker for a custom format has nowhere
to register it. Instead, a control registers a **tester** that returns a rank; the highest
rank wins.

```ts
type Tester = (hint: FieldHint, schema: FieldNode, context: Context) => boolean;
type RankedTester = (hint: FieldHint, schema: FieldNode, context: Context) => number;

const rankWith = (rank: number, tester: Tester): RankedTester =>
  (hint, schema, context) => (tester(hint, schema, context) ? rank : NOT_APPLICABLE);
```

```ts
export const controls = registerControls([
  [rankWith(1, schemaTypeIs("string")),                    TextControl],
  [rankWith(2, schemaTypeIs("array")),                     RepeaterControl],
  [rankWith(3, and(schemaTypeIs("string"), formatIs("uri"))), LinkControl],
  [rankWith(4, hintIs("control", "image")),                ImagePickerControl],
  [rankWith(5, scopeEndIs("colour")),                      TokenPickerControl],
]);
```

A structural default, a format-based override, an explicit hint, and a path-specific special
case all compose through one ranking mechanism; a consumer adds a control by registering a
tester rather than by us widening a union. Predicate vocabulary: `schemaTypeIs`, `formatIs`,
`scopeEndsWith`, `scopeEndIs`, `optionIs`, `hasOption`, combined with `and` / `or`.

There is deliberately no default token or colour picker registered. A well-built block schema
exposes semantic unions — `tone: "brand" | "neutral"` — which a select already serves.

## Hints are addressed by path, not by a mapped type

A mapped type (`{ [K in keyof InferProps<S>]?: FieldHint }`) only protects top-level scalars:
`cta.label` is not expressible, and a typo like `bullets: { rowLabel: "headnig" }`
type-checks happily. Hints are addressed instead by a JSON-Pointer-style path, resolved
against the schema at runtime:

```ts
ui: {
  fields: {
    "title":            { label: "Headline" },
    "cta.label":        { label: "Button text" },
    "bullets":          { rowLabel: "heading" },
    "bullets[].icon":   { control: "image" },
    "price":            { data: "request" },
  },
}
```

Compile-time safety is therefore **not** claimed — every path is resolved against the schema
at `createRegistry()`, and one that does not resolve fails registration. Resolution order for
a field: explicit `ui.fields[path].control` → registered control for a named format →
structural default from the schema node's type.

## Repeaters

A collapsed repeater row shows one of its own fields, never "Item 3":

```ts
ui: { fields: { bullets: { rowLabel: "heading", min: 1, max: 4 } } }
```

## Data lifecycle is a field hint, not a block flag

Rejected: block-level `data: "static" | "request"` — all-or-nothing, so a hero with a
static headline and a live price could not be expressed without forking the block. `data` is
a field hint instead, same mechanism as `label` or `control`, resolved by path and validated
at `createRegistry()`. See
[Data lifecycle is per field](architecture.md#data-lifecycle-is-per-field) for the three
states.

```ts
ui: {
  fields: {
    headline: {},                            // omitted — static, frozen at compile. The default.
    price:    { data: "request" },           // resolved fresh at every render
    stock:    { data: { revalidate: 60 } },  // stale-while-revalidate
  },
}
```

Editor live-fetch preview is a studio *mode*, orthogonal to this flag — it previews
request-time data in the inspector without changing what the compiler freezes.

`Artifact.tree` reflects the mix at compile: a static field freezes into `ArtifactNode.props`;
a `request` or `revalidate` field compiles to an entry in `ArtifactNode.holes` instead,
resolved by the block at render. See [`Artifact`](domain-model.md#artifact).

## Where a block sits

A block is an **app-level** component, the same layer as the application's own server
components: it composes design-system components and wires data into them, with the artifact
substituting for a query as the data source.

```
Artifact           serializable data only — an image URL or asset id, never a node
  ↓
Halyard block      app-level. Renders <Image> with the app's own pipeline
  ↓
Design system      pure and framework-agnostic. Receives the rendered node
```

A design system taking `image: ReactNode` rather than `imageUrl: string` is not in tension
with a CMS — it refuses the URL to stay portable, and the block is the adapter between the
two. Block props are therefore always plain serializable data: that is what an artifact can
hold, and the block is where data becomes nodes.

## Slots articulate structure

A slot declares what may go in it, not merely that it exists:

```ts
export const marketingLayout = defineBlock({
  name: "MarketingLayout",
  schema: z.object({}),
  component: MarketingLayout,
  slots: {
    hero: { allow: ["Hero", "VideoHero"], min: 1, max: 1 },
    body: { min: 1, max: 8 },              // any registered block
    aside: { allow: ["CtaCard"], max: 2 },
  },
});
```

The compiler enforces these, so a violation is a publish-time error, not a layout that renders
wrong; the studio reads the same constraints to grey out invalid drop targets during a drag.
Reading a slot's live occupancy needs no dedicated API: the constraint is
`registry.get(block).slots[name]` and the count is `elements[id].slots[name].length`.

## Validation happens at three tiers, not one

| Tier | When | Scope | Cost |
|---|---|---|---|
| Field | On commit in the inspector | The edited prop against its resolved sub-schema | Local, synchronous |
| Node | On blur / selection change | All of a node's props together | Local |
| Document | `compile()`, at publish | Every node, slots, references, reachability | The publish gate |

Field-level cannot catch cross-field constraints — a `.refine()` on the object needs the
whole node — which is why node-level exists rather than being folded in.

**Validate against the real schema, never against the JSON Schema projection.**
Introspection uses `toJSONSchema()` to *describe* fields for control resolution, but that
projection silently drops `.refine()` / `.superRefine()` / `.transform()`. Standard Schema's
`validate()` runs anywhere and sees everything, so introspection and correctness deliberately
use different paths.

A draft may hold invalid values indefinitely — blocking a save mid-edit is hostile, since an
author is often part-way through a change. `head` may point at content that will not compile;
publish is the gate. The same reasoning applies to a delete that would violate a slot's
`min`: the studio warns, compile refuses.

## Catalog and registry are two things

```ts
// Catalog — pure data. Serializable, no components, no React.
// The studio fetches this to build the palette and the inspector.
export const catalog = defineCatalog({
  Hero: { schema: heroSchema, ui: heroUi, defaults: heroDefaults, docs: heroDocs },
  FAQ:  { schema: faqSchema,  ui: faqUi,  defaults: faqDefaults },
});

// Registry — name → lazy importer. The consumer's app holds this.
export const registry = defineRegistry({
  Hero: () => import("./blocks/Hero"),
  FAQ:  () => import("./blocks/FAQ"),
});
```

Not a flat array of components: each `import()` is statically analysable, so the bundler
emits a chunk per block and the route resolves only what the artifact names.

```tsx
const artifact = await resolveArtifact(store, params.slug);
const used = await loadBlocks(registry, artifact.blockVersions);  // only these
return <Renderer artifact={artifact} blocks={used} />;
```

See [Catalog and registry are separate](decisions.md#catalog-and-registry-are-separate) for
why. The catalog is also why `core` must not depend on React (invariant 2): CI validating
artifacts against current schemas needs the catalog and nothing else.

Registration is implicit but filtered: a `<Name>.block.ts` file beside a component registers
it, so only the fraction of a design system meant to be author-placeable is exposed.

## Registry and compile

```ts
// Compile reads the catalog — schemas and hints. It needs no components.
const artifact = await compile(documentVersion, catalog);
// throws CompileError { issues: [{ nodeId, path, code, message }] }
```

Issue paths point at the offending node, so the studio can select it rather than showing a
wall of text.

## Store adapter

Same `ArtifactStore` interface used by the output layer — see
[ArtifactStore](domain-model.md#artifactstore).

## Next wiring

```tsx
// app/[[...slug]]/page.tsx
export default async function Page({ params }) {
  const artifact = await resolveArtifact(store, params.slug);
  if (!artifact) notFound();          // unpublished has no artifact — a real server 404
  const blocks = await loadBlocks(registry, artifact.blockVersions);
  return <Renderer artifact={artifact} blocks={blocks} />;
}
```

## Package boundary this implies

Block definitions and the compiler must not drag the editor into a consumer's production
bundle. `ui` is plain serializable data in the core package; the controls that read it live
in the studio.

## Failure modes designed against

1. **Custom editors as second-class.** Answered by the open control registry.
2. **Per-keystroke re-render on a large tree.** The inspector edits one node by `id`, never
   the whole document.
3. **Hint drift.** Answered by path resolution at `createRegistry()` plus the CI
   completeness check.
4. **Auto-generation degrading at depth.** JSON Forms and react-jsonschema-form both handle
   scalars and one level of nesting well, then degrade — hence explicit `rowLabel`, `groups`,
   and `order` rather than hoping structure alone reads well.
5. **Hidden fields retaining stale values.** A conditionally hidden field that keeps its last
   saved value with no clearing means published props can carry data for fields the author
   never saw. A field hidden by a discriminated union must have its value dropped at compile,
   not merely skipped in the editor.
6. **Repeater rows keyed by index.** "Item 1, Item 2" is useless once rows are reordered;
   rows need a row-label escape hatch and a stable key independent of index, or reordering
   re-mounts every row and loses focus.
7. **Types JSON Schema cannot express** — bigint, Date, class instances, unions with
   non-trivial discriminants. These need an explicit `control` rather than best-effort
   inference, and registration should fail loudly when one is left un-resolvable.
8. **Validator internals shifting.** Internal traversal has no stability guarantee. Isolated
   behind the adapter, pinned, and tested.
