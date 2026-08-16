---
title: API sketch
nav_order: 3
---

# API sketch

Shape of `defineBlock` through `compile` and render, and where UI hints live. Pseudocode,
not final signatures. The point is the shape and where each concern lives.

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

**Hybrid, split on "intrinsic to the field" versus "specific to this surface".** This is
what Meshery arrived at in production, running rjsf v6 across 11 form pairs.

| Concern | Lives in | Why |
|---|---|---|
| Type, validation, required, defaults | Schema | It is the contract. Props are inferred from it. |
| Conditional visibility | Schema (discriminated union) | It changes what is *valid*, not merely what is shown. Meshery does this with `allOf`/`if`/`then`/`else` on a discriminator, deliberately not in UI config. |
| Label, placeholder, order, grouping, control choice, row labels | `ui`, keyed by field path | Presentation varies per surface. The same block renders in a sidebar, a modal, and a popover. |
| Static vs. request-time resolution (`data`) | `ui`, keyed by field path | Per-field, not per-block — a hero's headline can freeze while its price stays live. Block-level `data` forced an all-or-nothing choice per block. |

Meshery's convention is a paired file — `import.json` beside `import.ui.json` — with layout
geometry (`x-rjsf-grid-area`) inside the schema because it is stable per field, and widget
choice, `ui:order`, and placeholders outside it because they are not.

### Why not put hints in the schema

The serious counter-proposal is to use each validator's *sanctioned* metadata slot —
`.meta()` on zod v4, `v.metadata()` on valibot, `.configure()` on arktype — behind one
`hField(schema, meta)` adapter. That avoids monkey-patching and keeps hints beside the
field they describe. It loses on three counts.

**1. Zod's registry is keyed by object identity, not by path.** A schema constant carries
one set of metadata everywhere it is referenced. Halyard's own
[schema rule](https://github.com/effekt/halyard/blob/main/.claude/rules/block-schemas.md) *requires* extracting shared
sub-schemas — `ctaSchema` imported by five blocks is the DRY win the rule exists to
produce. Identity-keyed metadata is directly hostile to that: the shared schema cannot
carry a per-use label, and the workaround is to re-wrap at every use site, which
un-shares the thing we deliberately shared.

**2. Standard Schema exposes only `validate()`.** Confirmed against spec source — the
interface is `version`, `vendor`, `types`, `validate`, and nothing else. There is no
cross-validator metadata surface, so in-schema authoring means three adapters and
capability-gating per validator on day one.

**3. The precedent that tried hardest failed.** `uniforms`' channel is prototype
monkey-patching — `z.ZodType.prototype.uniforms = ...` applied as an import side effect.
It is welded to zod v3 internals, has no v4 support, and throws on nullable, union, and
lazy. `@autoform/react` avoided patching only by hijacking the validation chain
(`.check(fieldConfig(...))`) as a no-op metadata carrier.

Formily's embedded `x-component` sidesteps patching but couples the data shape to a
component registry **by string name** — the coupling that would stop blocks being portable.

The pattern across mature systems predicts this: those that **own** their schema format
embed hints (Sanity, Storyblok, Formily); those whose format is **foreign and portable**
keep them separate (rjsf, JSON Forms, Contentful's `EditorInterface`). Halyard's format is
foreign *and* doubles as runtime validation of untrusted props.

## Introspection is still needed, and is per-validator

Hints living outside the schema does not remove the need to read the schema. The editor
must still discover **what fields exist and what type each is** to build a field list at
all, and Standard Schema will not tell us.

```ts
interface SchemaAdapter {
  describe(schema: StandardSchemaV1): FieldNode[];   // path, kind, optional, enum members
}
```

Resolution order, in preference:

1. **`toJSONSchema()`** where the validator offers it. It is a specified, stable output and
   the closest thing to an interop contract. Handle its `unrepresentable` option
   explicitly — the default throws, which would fail block registration mid-build.
2. **Internal traversal** (`._zod.def` on zod v4) only for types JSON Schema cannot express.
   This is documented but carries no stability guarantee, and it has already broken once
   — v3's `._def` was renamed precisely because dependents broke.

Both paths stay behind one adapter module, version-pinned and tested, so the renderer
never touches a validator's internals. **zod is the reference implementation**; valibot and
arktype adapters follow with explicit capability-gating rather than silent degradation.

### Why a parallel structure is safe here

The known failure of parallel UI structures is silent drift — rjsf's `uiSchema` mirrors the
schema positionally and nothing checks that a key refers to a real property.

Meshery solved this with a test (`TestFormSchemasAreSubsetOfCanonical`). **Halyard can do
better, at compile time**, because the schema is TypeScript rather than JSON:

```ts
type FieldHints<S> = { [K in keyof InferProps<S>]?: FieldHint };
//   Not a compile-time guard: a mapped type reaches top-level scalars only, so `cta.label`
//   is not expressible. Every path is resolved against the schema at createRegistry().
```

A CI check covers what types cannot: that every block has a resolvable control for every
prop, so a schema change cannot leave a field un-editable.

JSON Forms issue #2338 asks for exactly this — a type-safe programmatic builder instead of
hand-written JSON — which Halyard gets for free by deriving from zod.

## Control resolution: ranked testers, not a keyed map

Adopted from JSON Forms `packages/core`, which has run this in production for years. A
keyed map (`{ string: TextControl, image: ImagePicker }`) can only dispatch on one
dimension and is closed to extension — the exact complaint in rjsf issue #3960, where
someone wanted a rich picker for a custom format and the `widgetMap` was shut.

A control registers a **tester** that returns a rank; the highest rank wins.

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

Everything that was hand-waved as "resolution order" becomes one mechanism: a structural
default, a format-based override, an explicit hint, and a path-specific special case all
compose through the same ranking, and a consumer adds a control by registering a tester
rather than by us widening a union.

Predicate vocabulary follows JSON Forms: `schemaTypeIs`, `formatIs`, `scopeEndsWith`,
`scopeEndIs`, `optionIs`, `hasOption`, combined with `and` / `or`.

There is still deliberately no default token or colour picker registered. A well-built
block schema exposes semantic unions — `tone: "brand" | "neutral"` — which a select already
serves. The tester above exists to show a consumer *can* register one, not that we ship it.

## Hints are addressed by path, not by a mapped type

An earlier draft claimed `{ [K in keyof InferProps<S>]?: FieldHint }` gave compile-time
protection against a hint naming a field that does not exist. Review showed this holds only
for top-level scalars: `cta.label` is not expressible at all, and
`bullets: { rowLabel: "headnig" }` type-checks happily.

JSON Forms addresses this with a **JSON Pointer scope** — `#/properties/cta/properties/label`
— resolved against the schema by `resolveSchema(schema, schemaPath, rootSchema)`. That is
the mature answer: runtime-resolved paths plus validation, not type-level cleverness.

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

Compile-time safety is therefore **not** claimed. Every path is resolved against the schema
at `createRegistry()` and a path that does not resolve fails registration — the same
guarantee Meshery gets from `TestFormSchemasAreSubsetOfCanonical`, just eagerly rather than
in CI.

Resolution order for a field: explicit `ui.fields[path].control` → registered control for a
named format → structural default from the schema node's type.

## Repeaters

Stolen from JSON Forms' `elementLabelProp`. A collapsed repeater row shows one of its own
fields, never "Item 3":

```ts
ui: { fields: { bullets: { rowLabel: "heading", min: 1, max: 4 } } }
```

## Data lifecycle is a field hint, not a block flag

Block-level `data: "static" | "request"` was all-or-nothing — a hero with a static headline
and a live price could not be expressed without forking the block. `data` is a field hint,
same mechanism as `label` or `control`, resolved by path and validated at
`createRegistry()`:

```ts
ui: {
  fields: {
    headline: {},                            // omitted — static, frozen at compile. The default.
    price:    { data: "request" },           // resolved fresh at every render
    stock:    { data: { revalidate: 60 } },  // stale-while-revalidate
  },
}
```

Three states, not two: static (default), `request` (always live), and
`revalidate: <seconds>` (stale-while-revalidate — the shape real fetching already needs, not
just static-or-live). Editor live-fetch preview is a studio *mode*, orthogonal to this flag —
it previews request-time data in the inspector without changing what the compiler freezes.

`Artifact.tree` reflects the mix at compile: a static field freezes into `ArtifactNode.props`;
a `request` or `revalidate` field compiles to an entry in `ArtifactNode.holes` instead,
resolved by the block at render. See [`Artifact`](domain-model.md#artifact) in
`01-domain-model.md`.

## Where a block sits

A block is an **app-level** component, not a design-system component. It occupies the same
layer as an application's own server components: it composes design-system components and wires
data into them. The artifact substitutes for a query as the data source, and nothing else
about the layer changes.

```
Artifact           serializable data only — an image URL or asset id, never a node
  ↓
Halyard block      app-level. Renders <Image> with the app's own pipeline
  ↓
Design system      pure and framework-agnostic. Receives the rendered node
```

This is why a design system taking `image: ReactNode` rather than `imageUrl: string` is not
in tension with a CMS. The design system refuses the URL *so that it stays portable* — a
component that rendered `next/image` itself would acquire a Next dependency and stop being
usable anywhere else. The block is the adapter between the two, and it is the only layer
that knows about either.

It also explains why a block's props are always plain serializable data. That is not a
limitation to work around; it is what an artifact can contain, and the block is where data
becomes nodes.

## Slots articulate structure

A slot declares what may go in it, not merely that it exists. This is Atomic Design's
"articulate the design's underlying content structure" made enforceable.

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

The compiler enforces these, so a violation is a publish-time error rather than a layout
that renders wrong. The studio reads the same constraints to grey out invalid drop targets
during a drag — the constraint is declared once and serves both.

Reading a slot's live occupancy needs no dedicated API: the constraint comes from
`registry.get(block).slots[name]` and the count is `elements[id].slots[name].length`. This
is a consequence of the document being flat while authoring — in a nested tree it would
have required a traversal, and therefore a helper.

## Validation happens at three tiers, not one

`compile()` was the only validation point in an earlier draft, which meant an author learned
a value was invalid at publish rather than while typing it. Three tiers, cheapest first:

| Tier | When | Scope | Cost |
|---|---|---|---|
| Field | On commit in the inspector | The edited prop against its resolved sub-schema | Local, synchronous |
| Node | On blur / selection change | All of a node's props together | Local |
| Document | `compile()`, at publish | Every node, slots, references, reachability | The publish gate |

Field-level cannot catch cross-field constraints — a `.refine()` on the object needs the
whole node — which is why node-level exists rather than being folded in.

**Validate against the real schema, never against the JSON Schema projection.** Introspection
uses `toJSONSchema()` to *describe* fields for control resolution, but that projection
silently drops `.refine()` / `.superRefine()` / `.transform()`. Standard Schema's `validate()`
runs anywhere and sees everything, so the two concerns use different paths deliberately:
introspection for UI, `validate()` for correctness.

A draft may hold invalid values indefinitely. Blocking a save mid-edit is hostile — an
author is often part-way through a change — so `head` may point at content that will not
compile, and publish is the gate. The same reasoning applies to a delete that would violate
a slot's `min`: the studio warns, compile refuses.

## Catalog and registry are two things

Conflating them is what makes a registry a bundle problem. Split, each has one job:

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

**Not a flat array of components.** Each `import()` is statically analysable, so the bundler
emits a chunk per block, and the route resolves only what the artifact names:

```tsx
const artifact = await resolveArtifact(store, params.slug);
const used = await loadBlocks(registry, artifact.blockVersions);  // only these
return <Renderer artifact={artifact} blocks={used} />;
```

Growing the registry costs pages that do not use the new blocks nothing. Contrast a registry
spread into every render call, where every page carries every component whether or not it
appears — which is why adding one icon set can degrade a whole site and force
`next/dynamic` wrappers onto every component defensively.

The catalog also explains why `core` must not depend on React (invariant 2): CI validating
published artifacts against the current schemas needs the catalog and nothing else.

### Registration should be implicit, but filtered

A design system may hold far more components than are meant to be author-placeable — a
`MenuSeparator` is not a block. A block is an organism, and lives at the application's
composition layer rather than in the design system.

So registration keys off a file convention: a `<Name>.block.ts` beside a component registers
it, and a scaffold generator emits that file for anything intended as a block. Implicit for
what a developer means to expose, absent by default for everything else.

## Registry and compile

```ts
// Compile reads the catalog — schemas and hints. It needs no components.
const artifact = await compile(documentVersion, catalog);
// throws CompileError { issues: [{ nodeId, path, code, message }] }
```

Issue paths point at the offending node, so the studio can select it rather than showing a
wall of text.

## Store adapter

```ts
interface ArtifactStore {
  read(hash: string): Promise<Artifact | null>;
  write(artifact: Artifact): Promise<void>;
  manifest(): Promise<Manifest>;                          // advisory aggregation — every pointer
  pointer(route: string): Promise<RoutePointer | null>;    // single-route read; what a request resolves through
  publish(route: string, hash: string): Promise<void>;     // writes one route pointer — matchKind parsed from `route`
  unpublish(route: string): Promise<void>;
}
```

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

Meshery declares its RJSF types locally rather than importing from `@rjsf/utils`, so that
consumers wanting only the JSON shape do not pull a UI runtime. Same rule here: **block
definitions and the compiler must not drag the editor into a consumer's production bundle.**
`ui` is plain serializable data in `@effekt/halyard`; the controls that read it live in the
studio.

## Failure modes designed against

1. **Custom editors as second-class** — rjsf #3960. Answered by the open control registry.
2. **Per-keystroke re-render on a large tree** — JSON Forms' performance threads, plus its
   FAQ warning that spreading data in `onChange` creates unintended render cycles and can
   loop infinitely. The inspector edits one node by `id`, never the whole document.
3. **Hint drift** — answered by typed `FieldHints<S>` plus the CI completeness check.
4. **Auto-generation degrading at depth** — every library reviewed handles scalars and one
   level of nesting well, then degrades. Hence explicit `rowLabel`, `groups`, and `order`
   rather than hoping structure alone reads well.
5. **Hidden fields retaining stale values.** TinaCMS documents that a conditionally hidden
   field keeps its last saved value with no clearing, so published props end up carrying
   data for fields the author never saw. A field hidden by a discriminated union must have
   its value dropped at compile, not merely skipped in the editor.
6. **Repeater rows keyed by index.** Every mature system has a row-label escape hatch
   (Payload's `RowLabel`, Tina's `ui.itemProps`, JSON Forms' `elementLabelProp`) because
   "Item 1, Item 2" is useless once rows are reordered. Rows also need a stable key
   independent of index, or reordering re-mounts every row and loses focus.
7. **Types JSON Schema cannot express** — bigint, Date, class instances, unions with
   non-trivial discriminants. These need an explicit `control` rather than best-effort
   inference, and registration should fail loudly when one is left un-resolvable.
8. **Validator internals shifting.** `._zod.def` has no stability guarantee and was renamed
   from `._def` once already. Isolated behind the adapter, pinned, and tested.
