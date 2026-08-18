---
title: Demo Marketing Site
summary: A reference Next.js app whose components are shaped exactly as Nubbin blocks, and which serves published artifacts through a catch-all
status: reference
---

# Demo marketing site

A marketing site for a fictional scheduling product, Tidewell, built from twelve components
whose shape already matches what a block requires. It exists so `defineBlock` has something
real to register — ordinary application code first, a Nubbin fixture second.

Every component, schema, and hand-written page is ordinary Next.js code that stands on its own.
`src/nubbin/` is the thin layer that registers those components with Nubbin and serves compiled
artifacts from the fs store; the components themselves know nothing about it.

## What "block-shaped" means here

Each of the twelve components in `src/blocks/` follows the constraints a block will need to
satisfy:

- **One root element.** A renderer that attaches an id to the DOM node needs exactly one node
  to attach it to.
- **Serializable props only.** An image is `{ url, alt }`, never a `ReactNode`; a schema value
  is data a database could hold.
- **A colocated zod schema, with props inferred from it.** `type HeroProps = InferProps<typeof
  heroSchema>`, with `InferProps` imported from `@nubbin/core` — never a hand-written interface
  beside the schema.
- **A `defaults` export that satisfies the schema.** `src/app/reference/home/page.tsx` renders eight blocks'
  `defaults` unmodified, which is the same content an author would see dropping a fresh block
  onto a canvas.
- **Flat schemas.** A shared shape — a CTA, an image — is its own file in `src/blocks/shared/`
  or sits beside the block that owns it (`featureItem.schema.ts`), never nested inline inside
  a bigger `z.object()`.

## Pages

Five are hand-written, under `src/app/reference/` so that no literal route shadows a published
one; the rest are whatever the store has a pointer for.

- `/reference/home` — eight blocks assembled into one marketing page: `Hero`, `LogoWall`,
  `FeatureGrid`, `StatBand`, `TestimonialQuote`, `FaqAccordion`, `CtaBanner`, `SiteFooter`.
- `/reference/pricing` — reuses `Hero`, `FeatureGrid`, `FaqAccordion`, `CtaBanner`, and
  `SiteFooter` with different props, alongside a plan-comparison table that is ordinary page
  content rather than a block — not everything on a page has to be one.
- `/reference/about`, `/reference/security`, `/reference/changelog` — coded originals that a
  published fixture of the same page is compared against.
- Every published route, `/` included — `src/app/[[...slug]]/page.tsx` reads the route's
  pointer from the fs store and renders the artifact it names. A route with no pointer is a
  real 404. The brackets are doubled because only the optional form matches `/`: a pointer at
  the root yields an empty slug, which the required form cannot accept, and no hand-written
  page competes for `/` any more.

## Serving

`pnpm --filter demo run fixtures:publish` compiles the fixtures in `fixtures/` into the store,
then `pnpm --filter demo run build` prebuilds a page for every pointer `generateStaticParams`
finds. Routes published afterwards are served on demand by the same file.

Three route handlers support that:

- `POST /api/nubbin/publish` `{ route, hash }` and `POST /api/nubbin/unpublish` `{ route }` —
  they move the pointer and invalidate that one route. They exist because `revalidatePath`
  reaches only the cache of the process that runs it, so the call has to arrive as a request.
  They carry no auth: the demo binds to localhost and is never deployed.
- `GET /api/now` — `{ now, served }`, where `served` counts the calls this process has answered.
  It is the single source every hole resolves from, and the counter is what distinguishes a
  fresh render from a cached body.

`src/nubbin/resolveDemoHole.ts` writes a line to `.nubbin/hole-log.txt` for each hole it
resolves, so the file records which routes fetched and which rendered frozen props.

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

Then open `http://localhost:3000/reference/home`.
