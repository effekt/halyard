---
title: Layout Contract
summary: How authors adjust spacing without breaking the design system
status: draft
---

# The layout contract

How an author adjusts spacing and alignment without being able to break the design system.

> Revised after review. An earlier draft generalised from a single component and claimed
> more than the evidence supports. What survived measurement is recorded below; what did
> not has been removed.

## The rule applies to the block schema, not to the design system

This is the correction that makes everything else hold. Two surfaces get confused easily:

| Surface | Who edits it | How constrained |
|---|---|---|
| **Design-system component props** | Developers, in code | As open as the design system likes — `className`, `style`, native attributes, `ReactNode` slots |
| **Block schema** | CMS authors, in the studio | Closed. Every value comes from an enumerated set |

The block sits between them and is the narrowing layer. A design system's grid component may
*require* a raw `desktopGridClassName`; that is satisfied by the block author in code, and
the CMS author never sees it — exactly as an image `ReactNode` slot is satisfied by the
block rendering `<Image>` from a stored URL.

```ts
// The schema — what an author can change. Closed.
schema: z.object({
  title: z.string(),
  space: z.enum(["none", "sm", "md", "lg"]),
})
```

```tsx
// The block — app-level, and where every open prop the design system wants gets supplied
export function ItemGrid({ title, space, items }: ItemGridProps) {
  return (
    <Band gutter="page" hasTopSpacing={space !== "none"}>
      <Heading title={title} />
      <CardGrid desktopGridClassName="grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <Card key={item.id} image={<Image {...item.image} />} {...item} />
        ))}
      </CardGrid>
    </Band>
  );
}
```

An earlier draft asserted that "a well-built component declares everything available as a
closed union." That is false of real design systems and was never the point — 77 of the design system's
122 components expose `className` as their genuine customization surface, and several
require it. The closed union belongs to the **schema**.

## Halyard ships no CSS and owns no tokens

Unchanged, and the reason is unchanged: Halyard passes `space: "lg"` through as data and
the block resolves it with the consumer's own system.

What the earlier draft got wrong was implying no token registry exists. A mature design system runs a
substantial one — `tokens/figma.tokens.json` in DTCG format, compiled by Style Dictionary
into a Tailwind `@theme` block and a typed `dist/tokens.ts` with a `cssVar()` helper, with
`noHexColors` lint-enforced. That registry is upstream infrastructure the block's enums
depend on. Halyard simply does not *own* or *read* it.

Nor is the discipline perfect in practice, which is worth knowing rather than pretending
otherwise: class maps are routinely written as hand-literal utility strings rather than
token references, so nothing keeps them in sync with the registry, and components hardcode
raw hex where the scale has a gap. A design system with gaps is the normal case, and Halyard
is unaffected by them because it never resolves the value.

## Name intent, not style — in the schema

| Write this | Not this |
|---|---|
| `gutter: "page"` | `padding: "20px"` |
| `hasTopSpacing: true` | `marginTop: "lg"` |
| `tone: "brand"` | `color: "#1a4fd8"` |

This constrains what an author can express. It says nothing about the design system's own
props, which are free to be as open as they need.

## No wrapper element

Layout props merge onto the block's own root via **`className`**. The earlier draft said
"`className`/`style`/`ref`"; measured across one 122-component design system, `style` appeared on a single component
and `forwardRef` on **none**. Only `className` is real, and the studio's overlay design
measures bounds from absolutely-positioned siblings, so it never needed `ref` either.

One trap worth naming: `className` must be merged **last** so it can override.
Some components merge it last (`cn(BASE_CLASSES, className)`) while others in the same
package pass it **first** — two conventions side by side. First-merging silently defeats the
override.

The evidence for avoiding a wrapper: in one audited component set, all but one opted out of
the wrapper their CMS imposed — and the exception carried a comment explaining why. Both
Builder.io and Puck shipped a mandatory wrapper first and had to retrofit an opt-out
(`noWrap`, and `inline`/`dragRef` respectively).

What a wrapper breaks: flex and grid direct-child semantics (`gap`, `grid-column`,
`align-self` apply to direct children only); structural pseudo-selectors, so
`section + section { … }` stops matching; margin collapse, changing vertical rhythm
everywhere; sticky positioning, via a new containing block; and list semantics, since a
`<div>` inside a `<ul>` is invalid.

## What the semantic-key guarantee actually covers

An artifact stores `"page"`, not `px-5 lg:px-10`. Redefining what `"page"` means is a CSS
change that updates every published page with no republish.

**This covers enum-valued props and nothing else.** An earlier draft claimed a
design-system change never forces a content migration. That is false, and there is a
counter-example: rich-text bodies that fake paragraphs with doubled `<b>` and `<br>` tags
render correctly under one set of spacing styles and collapse under another. Adopting new
spacing means rewriting the stored markup into real `<p>` blocks — a bulk, rate-limited,
rollback-guarded write across every affected model. A styling change forced a bulk rewrite
of published content.

The migration risk lives in free-form content, and that is the common case, not an edge
case: 72 of the design system's 122 components expose `ReactNode` fields.

→ Rich text needs an explicitly marked schema type, and its migration risk is the
consumer's, not eliminated by this discipline.

## Images

Symmetric to spacing. The schema stores serializable data; the block constructs the node.

```ts
schema: z.object({ image: z.object({ url: z.string(), alt: z.string() }) })
```

```tsx
<Card image={<Image src={image.url} alt={image.alt} loader={imageLoader} />} />
```

Two consequences to accept rather than paper over: an image-bearing block necessarily
carries an **open** string field, so not every prop is enum-valued; and Halyard's asset flow
must feed the consumer's image pipeline, or the optimisation the `ReactNode` slot rule
exists to protect is lost anyway.

## Responsive

```ts
space: responsive(z.enum(["none", "sm", "md", "lg"]))   // "md" | { base: "md", lg: "xl" }
```

A schema helper that widens a value into a sparse, mobile-first per-breakpoint record. No
CSS involved; Halyard learns only that the object may carry keys the consumer named.

## Consequences

- Consistency across blocks is the consumer's design system's job. Halyard cannot enforce
  it without knowing what `"lg"` means.
- The studio renders the consumer's real app in an iframe, so layout previews are correct
  for free.
- Which strings are CMS-editable versus app-owned `t()` catalog entries is a per-block
  judgment call. Getting it wrong either blocks locale rollout or leaves an author unable to
  label their own controls.
