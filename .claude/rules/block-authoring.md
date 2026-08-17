---
paths: "packages/**/*.block.ts, apps/**/*.block.ts, packages/**/blocks/**, apps/**/blocks/**"
title: Block Authoring Rules
summary: How to define a whole block correctly — defaults, slots, version, docs
status: stable
---

# Block authoring

> **A block is registered code, not a component with an extra file. [`block-schemas.md`](block-schemas.md) governs one schema's shape; this covers the whole block — defaults, slots, version, docs.**

## Rules

### Schema first, props inferred — never declared twice

Write `xSchema`, then `type XProps = InferProps<typeof xSchema>`, importing `InferProps` from `@nubbin/core`. Full rule and example in [`block-schemas.md`](block-schemas.md#props-are-inferred-never-declared) — a hand-written `interface` beside the schema is invariant 1, and everything below depends on getting this right first.

### `defaults` is required, and belongs in the catalog entry

```ts
// WRONG — defaults on the block ties data the studio needs to the component-bearing half
export const heroBlock = defineBlock({
  name: "Hero", schema: heroSchema, component: Hero,
  defaults: { title: "Headline", tone: "light" },
});

// CORRECT — the catalog is the serializable half, and defaults are serializable data
export const catalog = defineCatalog({
  Hero: { schema: heroSchema, ui: heroUi, defaults: heroDefaults, docs: heroDocs },
});
```

`defaults` is what a freshly dropped block renders with, so the **studio** is what needs it —
and the studio fetches the catalog precisely because the catalog carries no components. Putting
defaults on the block would make the studio load a component to learn a default, which is the
coupling [the catalog/registry split](../../docs/decisions.md#catalog-and-registry-are-separate)
exists to prevent.

`defaults` must pass the schema's own `validate()`. **Gate:** `defineCatalog()`, which runs `assertValidDefaults` and throws naming the failing paths. Registration refuses them, because defaults that fail their own schema produce a block that is invalid the instant it is placed. The type does not express it — `defineBlock` cannot, since `defaults` is not on the block.

### Props name intent, not style

```ts
// WRONG — an open string passed straight to a design-system prop
tone: z.string()
// CORRECT — a closed set the block resolves against the consumer's design system
tone: z.enum(["brand", "neutral"])
```

Name intent, not style — the same rule the layout contract applies, here applied to the block's own schema. It has to be a rule rather than a convention, because the default pull is always toward an open `string`: it is faster to write, accepts anything an author asks for, and only reveals its cost once the values are stored and someone wants to change what they mean. **Gate:** none; `check-schema-depth.mjs` checks nesting, not openness.

### A block is an organism, never a primitive

```ts
// WRONG — a design-system atom registered directly
export const buttonBlock = defineBlock({ name: "Button", schema: buttonSchema, component: Button });
// CORRECT — the organism that composes it; Button is used by the block, never placed by an author
export const ctaBannerBlock = defineBlock({ name: "CtaBanner", schema: ctaBannerSchema, component: CtaBanner });
```

[`domain-model.md`](../../docs/domain-model.md): "registering a `Button` as a block is the shape of misuse to warn against." The failure it prevents is authors rebuilding a design system inside the CMS — once primitives are placeable, a variant-per-name sprawl of hand-built buttons and cards accumulates, none of it the real component and none of it reviewed as code. **Gate:** none — registration is implicit off the file convention below; this is a review judgment.

### Props must be serializable — never `ReactNode` in a schema

```ts
// WRONG — unserializable; a database can't hold it either
image: z.custom<ReactNode>()
// CORRECT — the schema holds data; the block's component constructs the node
image: z.object({ url: z.string(), alt: z.string() })
// component.tsx: <Image src={image.url} alt={image.alt} />
```

An artifact is inert data (invariant 6) and props are frozen into it — a `ReactNode` can't survive that. A design system may reasonably accept rendered children; a block may not, and the block is the only layer allowed to close that gap. **Gate:** none — `z.custom<ReactNode>()` typechecks and passes every structural gate.

### Slots declare `allow`, `min`, `max`

```ts
// WRONG — declares only that a slot exists
slots: { items: {} }
// CORRECT — articulates the structure the layout actually needs
slots: { items: { allow: ["Testimonial"], min: 1, max: 6 } }
```

An unconstrained slot means the studio can't grey out invalid drop targets, and the compiler can't reject a bad composition. **Gate:** `compile()` rejects a child the list forbids, and `createRegistry()` refuses to register a block whose `allow` names nothing in the registry, reporting every unresolvable entry with its block and slot. The list resolves once the whole array is ingested, so a block may name a sibling declared after it.

### Rich text needs an explicitly marked type

```ts
// WRONG — an open string; nothing that scans for rich text can find this field
body: z.string()
// CORRECT — marked, so tooling can find every rich-text field without scanning
body: richText()   // a thin z.string() wrapper, symmetric to responsive()
```

Not stylistic. Free-form rich text is where migration risk concentrates: stored markup encodes assumptions about the styles that rendered it, so a design-system change can force a bulk rewrite of published content. **That risk is the consumer's** — marking the field only makes it findable. **Gate:** none.

### Version bumps aren't optional

```ts
// WRONG — a prop renamed in place; live artifacts' frozen props now disagree with the schema that will render them
schema: z.object({ heading: z.string() })   // was `title`
// CORRECT — bump the version, migrate the old shape
export const heroBlock = defineBlock({
  name: "Hero", schema: heroSchema, component: Hero, version: 2,
  migrate: { 2: (props) => ({ ...props, heading: props.title }) },
});
```

Artifacts are immutable and content-addressed (invariant 3) — frozen props were valid against the version they compiled with. Any rename, retype, or requiredness change needs a bump. `migrate` reshapes props on one node only — never `slots`, never a split into two blocks. **Gate:** none.

### File convention, `docs`, and the tests a block ships

`<Name>.block.ts` beside `<Name>.tsx` registers a block, implicitly, off the file's existence ([`api.md`](../../docs/api.md)). Add `docs: { figma, storybook }` too — one line, cheap. Ships with: the schema's accept/reject test ([`block-schemas.md`](block-schemas.md#checklist)), a test that `defaults` validates, and a component test if props branch the render ([`testing.md`](testing.md)).

### A block renders one root element

```tsx
// WRONG — two roots; nothing for the renderer to attach data-nubbin-node to
export function Hero() { return (<><h1>{title}</h1><p>{body}</p></>); }
// CORRECT — one element the renderer can mark
export function Hero() { return (<section><h1>{title}</h1><p>{body}</p></section>); }
```

The studio learns about the page only through the DOM, so block roots carry `data-nubbin-node`. A Fragment with multiple roots leaves nothing to attach it to, and no gate can see the difference. **Gate:** none.

## Checklist

- [ ] Schema written first; `type XProps = InferProps<typeof xSchema>`, no hand-written interface
- [ ] `defaults` is present and passes the schema's own `validate()`
- [ ] Every styling- or layout-driving prop is an enum, not a string
- [ ] The block composes existing components — it is not a single design-system primitive
- [ ] No schema field is `ReactNode`, a component, or otherwise unserializable
- [ ] Every slot declares `allow`, `min`, and `max`
- [ ] Rich text fields use the marked rich-text type, not a plain string
- [ ] `docs` links are present if they exist; a schema-shape change bumped `version`
- [ ] `<Name>.block.ts` exists beside the component; defaults and schema each have a test
- [ ] The component returns exactly one root element
