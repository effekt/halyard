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

Write `xSchema`, then `type XProps = InferProps<typeof xSchema>`. Full rule and example in [`block-schemas.md`](block-schemas.md#props-are-inferred-never-declared) — a hand-written `interface` beside the schema is invariant 1, and everything below depends on getting this right first.

### `defaults` is required, not optional

```ts
// WRONG — nothing for the palette preview to render; a dropped block starts with `tone` unset
export const heroBlock = defineBlock({ name: "Hero", schema: heroSchema, component: Hero });
// CORRECT — every required field has a value before an author ever touches it
export const heroBlock = defineBlock({
  name: "Hero", schema: heroSchema, component: Hero,
  defaults: { title: "Headline", tone: "light", cta: { label: "Learn more", href: "/" }, bullets: [] },
});
```

`defaults` must pass the schema's own `validate()`. **Gate:** none — not enforced in `defineBlock`'s type, so caught only at review.

### Props name intent, not style

```ts
// WRONG — an open string passed straight to a design-system prop
tone: z.string()
// CORRECT — a closed set the block resolves against the consumer's design system
tone: z.enum(["brand", "neutral"])
```

Same rule as [`07`](../../docs/design/07-layout-contract.md#name-intent-not-style--in-the-schema), applied to the block's own schema — has to be a rule, not a convention: in one audited component set, open `string` fields outnumbered enum-shaped ones roughly thirty to one. **Gate:** none; `check-schema-depth.mjs` checks nesting, not openness.

### A block is an organism, never a primitive

```ts
// WRONG — a design-system atom registered directly
export const buttonBlock = defineBlock({ name: "Button", schema: buttonSchema, component: Button });
// CORRECT — the organism that composes it; Button is used by the block, never placed by an author
export const ctaBannerBlock = defineBlock({ name: "CtaBanner", schema: ctaBannerSchema, component: CtaBanner });
```

`01-domain-model.md`: "registering a `Button` as a block is the shape of misuse to warn against." A content audit shows why: in one corpus, ten hand-built primitives — variant-per-name buttons and cards — existed only inside the CMS, because the real components were never registered and authors rebuilt a design system to fill the gap. **Gate:** none — registration is implicit off the file convention below; this is a review judgment.

### Props must be serializable — never `ReactNode` in a schema

```ts
// WRONG — unserializable; a database can't hold it either
image: z.custom<ReactNode>()
// CORRECT — the schema holds data; the block's component constructs the node
image: z.object({ url: z.string(), alt: z.string() })
// component.tsx: <Image src={image.url} alt={image.alt} />
```

An artifact is inert data (invariant 6) and props are frozen into it — a `ReactNode` can't survive that. Same asymmetry [`07`](../../docs/design/07-layout-contract.md#images) describes for the design system; the block is the only layer allowed to close it. **Gate:** none — `z.custom<ReactNode>()` typechecks and passes every structural gate.

### Slots declare `allow`, `min`, `max`

```ts
// WRONG — declares only that a slot exists
slots: { items: {} }
// CORRECT — articulates the structure the layout actually needs
slots: { items: { allow: ["Testimonial"], min: 1, max: 6 } }
```

An unconstrained slot means the studio can't grey out invalid drop targets, and the compiler can't reject a bad composition. **Gate:** intended to be `createRegistry()`, resolving `allow` against registered names — not built yet, so a typo in `allow` is currently silent.

### Rich text needs an explicitly marked type

```ts
// WRONG — an open string; nothing that scans for rich text can find this field
body: z.string()
// CORRECT — marked, so tooling can find every rich-text field without scanning
body: richText()   // a thin z.string() wrapper, symmetric to responsive()
```

Not stylistic: `html` fields are 8% of in-scope production schemas, and free-form content is where migration risk concentrates — 72 of 122 design-system components expose `ReactNode` fields (`07-layout-contract.md`). **That risk is the consumer's** — marking the field only makes it findable. **Gate:** none.

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

`<Name>.block.ts` beside `<Name>.tsx` registers a block, implicitly, off the file's existence (`02-api-sketch.md`). Add `docs: { figma, storybook }` too — one line, cheap. Ships with: the schema's accept/reject test ([`block-schemas.md`](block-schemas.md#checklist)), a test that `defaults` validates, and a component test if props branch the render ([`testing.md`](testing.md)).

### A block renders one root element

```tsx
// WRONG — two roots; nothing for the renderer to attach data-halyard-node to
export function Hero() { return (<><h1>{title}</h1><p>{body}</p></>); }
// CORRECT — one element the renderer can mark
export function Hero() { return (<section><h1>{title}</h1><p>{body}</p></section>); }
```

The studio learns about the page only through the DOM, so block roots carry `data-halyard-node`. A Fragment with multiple roots leaves nothing to attach it to, and no gate can see the difference. **Gate:** none.

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
