---
title: Home
nav_order: 1
hide_site_header: true
---

<style>
  /* Home page only — this <style> ships with index.md and no other page includes it.
     Palette: Deep Marine #0B2B33 · Halyard Teal #0E5A6B · Teal Light #4FB3C7 ·
     Signal Orange #E4572E · Orange Deep #BF411D · Brass #C08A3E · Canvas #F1F4F3.
     Measured ratios are noted where a pairing is load-bearing. */

  .hy-hero,
  .hy-band {
    background: #0B2B33;
    color: #F1F4F3;              /* 13.48:1 */
    border-radius: 6px;
    max-width: 100%;
    box-sizing: border-box;
  }

  .hy-hero {
    padding: clamp(1.75rem, 6vw, 3.25rem) clamp(1.25rem, 5vw, 3rem) 0;
    margin: 0 0 2.5rem;
    overflow: hidden;
  }

  .hy-wordmark {
    font-size: 0.8rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #4FB3C7;              /* 6.11:1 — the only teal readable on this ground */
    margin: 0 0 0.75rem;
  }

  .hy-hero h1 {
    font-size: clamp(2rem, 7vw, 3.5rem);
    line-height: 1.05;
    letter-spacing: -0.02em;
    margin: 0 0 1rem;
    color: #F1F4F3;
    border-bottom: 0;
    padding-bottom: 0;
  }

  .hy-lede {
    font-size: clamp(1.05rem, 2.4vw, 1.3rem);
    line-height: 1.5;
    max-width: 52ch;
    margin: 0 0 1.25rem;
  }

  .hy-status {
    display: inline-block;
    border-left: 3px solid #C08A3E;   /* brass as hardware, never as text */
    padding-left: 0.75rem;
    margin: 0 0 1.75rem;
    font-size: 0.98rem;
    color: #F1F4F3;
    max-width: 46ch;
  }

  .hy-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin: 0 0 2rem;
  }

  .hy-actions a {
    display: inline-block;
    padding: 0.7em 1.15em;
    border-radius: 4px;
    text-decoration: none;
    font-weight: 600;
    line-height: 1.2;
  }

  .hy-btn-primary { background: #4FB3C7; color: #0B2B33; }      /* 6.11:1 */
  .hy-btn-quiet   { background: transparent; color: #F1F4F3; border: 1px solid #C08A3E; }
  .hy-actions a:hover { text-decoration: underline; }

  /* The one bright line of rope. Decorative — the hero says all of this in words. */
  .hy-rope { display: block; width: 100%; height: auto; margin-top: 0.5rem; }

  .hy-split {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
    gap: 1.25rem;
    margin: 1.5rem 0;
  }

  .hy-card {
    border: 1px solid #d7dedd;
    border-top: 3px solid #0E5A6B;
    border-radius: 4px;
    padding: 1.1rem 1.25rem;
    background: #F1F4F3;
    max-width: 100%;
    box-sizing: border-box;
  }

  .hy-card p { margin: 0.5rem 0 0; }
  .hy-card p:first-child { margin-top: 0; }

  .hy-card-title {
    font-weight: 700;
    color: #0E5A6B;              /* 7.04:1 on Canvas */
    letter-spacing: 0.01em;
  }

  .hy-band {
    padding: 1.1rem 1.25rem;
    margin: 1.5rem 0 0;
  }
  .hy-band p { margin: 0; max-width: 62ch; }
  .hy-band strong { color: #4FB3C7; }

  .hy-refusals { display: grid; gap: 1.5rem; margin-top: 1.5rem; }
  .hy-refusals h3 {
    margin: 0 0 0.4rem;
    padding-top: 0.9rem;
    border-top: 2px solid #C08A3E;
    font-size: 1.05rem;
    color: #0B2B33;
  }
  .hy-refusals p { margin: 0 0 0.6rem; max-width: 68ch; }

  .hy-caption {
    font-size: 0.95rem;
    color: #55696E;              /* 5.22:1 on Canvas, 5.78:1 on white */
    max-width: 68ch;
  }

  /* Halyard Teal reads at 7.8:1 on white; the layout already underlines links in main,
     so colour is never the only indicator. */
  main a { color: #0E5A6B; }
  .hy-hero a, .hy-band a { color: #4FB3C7; }
  .hy-actions a.hy-btn-primary { color: #0B2B33; }
  .hy-actions a.hy-btn-quiet { color: #F1F4F3; }

  main a:focus-visible { outline: 3px solid #BF411D; outline-offset: 2px; }
  .hy-hero a:focus-visible, .hy-band a:focus-visible { outline-color: #E4572E; }

  main h2 {
    border-bottom: 0;
    border-top: 2px solid #C08A3E;
    padding-top: 0.9rem;
    margin-top: 2.75rem;
    color: #0B2B33;
  }

  main p { max-width: 72ch; }

  /* No horizontal body scroll at 320px: long cells wrap rather than push the table wide.
     `display: table` also holds the theme's `display: block` off, which would otherwise
     drop the table's semantics and open a scroll region with nothing focusable in it. */
  main table { display: table; width: 100%; max-width: 100%; }
  main table th, main table td { overflow-wrap: anywhere; }
  main pre, main img, main svg { max-width: 100%; }
  /* Wrap code rather than open a horizontal scroll region, which reflows at 320px and
     leaves no scrollable area a keyboard user cannot reach. Lines here are short enough
     that wrapping only takes effect on a narrow screen. */
  main pre { overflow-x: auto; }
  main pre, main pre > code { white-space: pre-wrap; overflow-wrap: anywhere; }
</style>

<div class="hy-hero">
  <p class="hy-wordmark">Halyard</p>
  <h1>Your components.<br>Their pages.</h1>
  <p class="hy-lede">
    A page builder that lives inside your codebase. Developers curate a set of blocks in
    code; non-developers compose pages from them. The composition is data, the contract is
    code, and publishing compiles a document into an immutable artifact — no bundler, no
    deploy, no second source of truth.
  </p>
  <p class="hy-status">
    Design, not software. There is no implementation yet, deliberately — the architecture is
    being settled in the open, before anything expensive is built on top of it.
  </p>
  <p class="hy-actions">
    <a class="hy-btn-primary" href="{{ '/domain-model.html' | relative_url }}">Read the design record</a>
    <a class="hy-btn-quiet" href="https://github.com/effekt/halyard/issues/15">Open design questions ↗</a>
  </p>
  <svg class="hy-rope" viewBox="0 0 800 48" aria-hidden="true" focusable="false">
    <path d="M0 38 H300 C420 38 440 6 356 6 C292 6 296 38 400 38 H800"
          fill="none" stroke="#E4572E" stroke-width="3" stroke-linecap="round"/>
  </svg>
</div>

## One split, and everything follows

A page builder holds two contracts: what a block will accept, and what an author composed.
Halyard puts the first in your repository, shipping atomically with the component that reads
it, and the second in a database, where it can change hourly without a build.

<div class="hy-split">
  <div class="hy-card">
    <p class="hy-card-title">Schema in code</p>
    <p>
      A block declares its schema once, beside the component that consumes it. Props are
      inferred from that schema, so there is no second definition to drift out of step with
      the first. Changing it is a code change, reviewed as code.
    </p>
  </div>
  <div class="hy-card">
    <p class="hy-card-title">Content in a database</p>
    <p>
      Which blocks an author placed, in what order, with what values. One store and versions
      rather than environments, so promoting a page is a pointer move instead of a copy
      between two systems that can disagree.
    </p>
  </div>
</div>

<div class="hy-band">
  <p>
    Publishing compiles a document against the schema it validates under and writes an
    <strong>immutable, content-addressed artifact</strong>. The pointer for a route then
    moves to it. Nothing mutates in place, so nothing needs invalidating, and a rollback is
    the same pointer moving back.
  </p>
</div>

Put the schema in a database instead and you inherit two environments that drift, tooling to
reconcile them, and a cache to survive a round trip on every render.

## A block declares its schema once

Each field decides for itself whether it freezes at publish or stays live. That decision is
per field, not per block, so a headline can be frozen into the artifact while the price
beside it is resolved fresh on every request.

```ts
// hero.schema.ts — sub-schemas are extracted so blocks can share them
export const heroSchema = z.object({
  title: z.string(),
  price: z.number(),
  cta: ctaSchema,
});

// hero.block.ts
export const heroBlock = defineBlock({
  name: "Hero",
  schema: heroSchema,
  // props are InferProps<typeof heroSchema> — no second definition
  component: Hero,
  ui: {
    fields: {
      // no `data` — static, frozen at compile. The default.
      title: { label: "Headline" },
      // resolved fresh at every render. Per field, not per block.
      price: { data: "request" },
    },
  },
});
```

Compiling a document freezes what is static and leaves the rest as a typed hole. The artifact
never carries the schema, only the outcome of validating against it:

```ts
// one node of the compiled artifact
{
  id: "n1",
  block: "Hero",
  props: { title: "Sale ends Friday", cta: { label: "Shop now", href: "/sale" } },
  holes: { price: "request" },
}
```

<p class="hy-caption">
  Compiling validates and serializes. It never invokes a bundler, which is why publishing and
  previewing never require a deploy — only a <em>code</em> change needs a build.
</p>

## What the split buys

| Property | What it buys |
|---|---|
| **Schema in code** | Props are inferred from the schema. There is no second definition to drift. |
| **Content as data** | One store, versions instead of environments. Promotion is a pointer move, not a copy. |
| **Immutable artifacts** | Content-addressed, cached forever, rolled back by pointer. Nothing to invalidate. |
| **No deploy to publish** | Compiling validates and serializes. Only a *code* change needs a build. |
| **Precise code-splitting** | An artifact names the blocks a page uses, so the hundredth block costs other pages nothing. |
| **Bring your own everything** | Storage, auth, and validation are adapters. The core depends on nothing but Standard Schema. |

## What it refuses

Three capabilities that visual editors commonly ship are out of scope here. The first is
load-bearing — the rendering and caching model rests on artifacts staying inert data; the
second and third are judgments about what this project is.

<div class="hy-refusals">
  <div>
    <h3>Executable content</h3>
    <p>
      No author-supplied JavaScript, no CSS blocks, no expression language, no binding
      strings evaluated at render. Every value in an artifact is inert data validated against
      a schema.
    </p>
    <p>
      Hosted visual editors routinely permit all four, stored as content and evaluated at
      render, and each is a security and performance liability authored by someone with no
      way to assess either. Repetition and logic live in components, which are code, reviewed
      as code.
    </p>
  </div>
  <div>
    <h3>Structured data that is not a page</h3>
    <p>
      A visual editor accumulates data models faster than pages, because a row is cheap to
      add and a page needs a route. Follow that demand and you are building a general content
      store with a page renderer attached — a different product with a different shape.
    </p>
    <p>
      Halyard composes pages. Data that is not a page stays in whatever already owns it, and
      a block reads it at render through a field marked <code>data</code>.
    </p>
  </div>
  <div>
    <h3>Templates that generate routes from bound state</h3>
    <p>
      A template that fans out into many routes from a bound query is an expression language
      under another name: an author writes logic, the system evaluates it at render, and no
      review stands between the two.
    </p>
    <p>
      A route is a decision an author makes once, recorded as one enumerable pointer. A
      template fanning routes out of a bound query is logic no review sees, and the route
      table stops being answerable.
    </p>
  </div>
</div>

## Design, not software

What exists is the architecture, the decisions and the alternatives each one beat, and the
tooling that will hold an implementation to them. It has been through one adversarial review
that falsified its live postMessage preview and its single-manifest publish — a reason to trust it more than an unreviewed
design, and not a reason to treat it as finished.

The [roadmap](https://github.com/effekt/halyard/issues/14) sequences the build. Its first
milestone is deliberately not a feature: it exists to falsify the project's own thesis, by
authoring real pages against real blocks with no editor at all, before anything expensive is
built on that assumption.

The [open design questions](https://github.com/effekt/halyard/issues/15) are the parts known
to still be wrong. Disagreement about the design is more useful than agreement right now, and
that issue is where to start.

## The design record

The [repository](https://github.com/effekt/halyard) keeps a condensed working set of docs,
sized for someone implementing against them. This site is the other half: the long-form
record behind them, carrying the reasoning, the rejected alternatives, and the threads that
have not resolved.

`Domain model` and `API sketch` come first — everything else is downstream of the types they
define. `Authoring flows` walks what an author actually does, citing back into both.

| Page | Covers |
|---|---|
| [Domain model](domain-model.md) | Every entity, what owns it, and where it lives across the contract, content, and output layers |
| [API sketch](api-sketch.md) | The shape of `defineBlock` through `compile` and render, and where UI hints live |
| [Authoring flows](authoring-flows.md) | What an author does, step by step, and where each flow is still unresolved |
| [Studio](studio.md) | How the self-hosted studio canvas, drag-and-drop, and preview are architected |
| [Layout contract](layout-contract.md) | How authors adjust spacing and alignment without breaking the design system |
| [Studio wireframes](wireframes.md) | Panel layout, inspector controls, and key-state specs for the editing screen |

Open questions and roadmap phasing are not on this site. They live in the repository's
[GitHub issues](https://github.com/effekt/halyard/issues), where they can be discussed and
closed rather than sitting static in a document.
