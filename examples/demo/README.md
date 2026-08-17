---
title: Demo Marketing Site
summary: A reference Next.js app whose components are shaped exactly as Nubbin blocks, with no dependency on Nubbin itself
status: reference
---

# Demo marketing site

A marketing site for a fictional scheduling product, Tidewell, built from eight components
whose shape already matches what a block requires. It exists so `defineBlock` has something
real to register — ordinary application code first, a Nubbin fixture second.

It does not import Nubbin. Nothing here is a stub or a placeholder for a future API — every
component, schema, and page is ordinary Next.js code that stands on its own.

## What "block-shaped" means here

Each of the eight components in `src/blocks/` follows the constraints a block will need to
satisfy:

- **One root element.** A renderer that attaches an id to the DOM node needs exactly one node
  to attach it to.
- **Serializable props only.** An image is `{ url, alt }`, never a `ReactNode`; a schema value
  is data a database could hold.
- **A colocated zod schema, with props inferred from it.** `type HeroProps = z.infer<typeof
  heroSchema>` — never a hand-written interface beside the schema.
- **A `defaults` export that satisfies the schema.** `src/app/page.tsx` renders every block's
  `defaults` unmodified, which is the same content an author would see dropping a fresh block
  onto a canvas.
- **Flat schemas.** A shared shape — a CTA, an image — is its own file in `src/blocks/shared/`
  or sits beside the block that owns it (`featureItem.schema.ts`), never nested inline inside
  a bigger `z.object()`.

## Pages

- `/` — the eight blocks assembled into one marketing page: `Hero`, `LogoWall`, `FeatureGrid`,
  `StatBand`, `TestimonialQuote`, `FaqAccordion`, `CtaBanner`, `SiteFooter`.
- `/pricing` — reuses `Hero`, `FeatureGrid`, `FaqAccordion`, `CtaBanner`, and `SiteFooter` with
  different props, alongside a plan-comparison table that is ordinary page content rather than
  a block — pricing tables are not one of the eight, and not everything on a page has to be.

## Brand

Colors are Tailwind v4 `@theme` tokens in `src/app/globals.css` — `marine`, `teal`,
`teal-light`, `orange`, `orange-deep`, `brass`, `canvas`. `orange` is a decorative wash only
(the Hero background glow, the pricing illustration); anywhere a surface carries text or a
button, it is `orange-deep`, which is the pair that clears WCAG AA against white.

## Running it

This example is part of the `nubbin` pnpm workspace and needs Node 22+ and pnpm.

```bash
pnpm install
pnpm --filter demo dev
```

Then open `http://localhost:3000`.
