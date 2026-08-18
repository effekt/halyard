---
paths: "examples/**, apps/**, packages/**/*.tsx, **/*.html"
title: Accessibility Rules
summary: The accessibility decisions a gate cannot make — names, heading order, focus, colour, semantics, motion
status: stable
---

# Accessibility

> **A page failing any of these looks finished to everyone it does not exclude. The one person who can see the defect is the one who cannot use the page, and they do not file a bug.**

## Why

Most defects announce themselves; these render fine and photograph fine. `check-a11y.mjs` blocks
what is decidable from the source, and the `PostToolUse` accessibility reviewer judges the rest.

## Rules

### Alt text names the content; decorative images take `alt=""`

Alt replaces the image: it says what the image says, not what it is made of. An image adding
nothing the surrounding text already said is decorative, and an empty alt is a decision there.

```tsx
{/* WRONG — describes the pixels instead of naming what the image shows */}
<img src="/hero-board.svg" alt="A blue rectangle with rounded corners and small bars" />

{/* CORRECT — what a reader who cannot see it needs; the wash says nothing, so it says nothing */}
<img src="/hero-board.svg" alt="A schedule board with three lanes of work in progress" />
<div aria-hidden="true" className="absolute h-96 w-96 rounded-full bg-orange blur-3xl" />
```

**Gate:** `check-a11y.mjs` rejects a missing `alt`, a filename, and the generic words.

### Heading levels never skip, and every section has one

Heading level is the outline a screen-reader user navigates by, not a type scale — set the size
with a class and keep the level sequential. A section the design leaves unlabelled still needs a
heading, and a visually hidden one is the right answer there.

```tsx
{/* WRONG — h1 to h3 leaves a hole, and the stat band is unreachable in the outline */}
<h1>Simple pricing</h1>
<h3 className="text-xl">Plans</h3>
<section><ul>{stats.map(renderStat)}</ul></section>

{/* CORRECT — sequential levels; the unlabelled section gets a name only assistive tech reads */}
<h2 className="text-xl">Plans</h2>
<section>
  <h2 className="sr-only">Adoption in numbers</h2>
  <ul>{stats.map(renderStat)}</ul>
</section>
```

**Gate:** none — the level above a component is set by whatever renders it.

### Focus stays visible, and focus order follows reading order

Removing the outline is fine only when something replaces it. Order comes from the DOM, so a
control moved visually by `order-*` or absolute positioning is still focused where it was written.

```tsx
{/* WRONG — the ring is gone with nothing in its place, and focus reaches the link last */}
<button type="button" className="outline-none">Save</button>
<div className="flex flex-col"><p className="order-2">…</p><a className="order-1" href="/x">…</a></div>

{/* CORRECT — outline swapped for a ring; visual order matches the order the markup is read in */}
<button type="button" className="focus:outline-none focus-visible:ring-2">Save</button>
<div className="flex flex-col"><a href="/x">…</a><p>…</p></div>
```

**Gate:** `check-a11y.mjs` catches an outline removed with no focus style near it; order is not.

### Colour alone carries nothing, and neither does a fill

This repository shipped both variants. Links inside prose were set apart by hue alone, so a
reader who cannot separate those colours sees a paragraph with no links in it. A call to action
was a fill with no border — and Windows high contrast drops backgrounds and keeps borders, so
that control flattens into text.

```tsx
{/* WRONG — hue is the link's only signal, and the fill is the button's only affordance */}
<p>Read the <a href="/pricing" className="text-teal">pricing guide</a> first.</p>
<a href={cta.href} className="rounded-md bg-orange-deep px-6 py-3 text-white">{cta.label}</a>

{/* CORRECT — an underline, and a border that outlives the fill; a state also says its word */}
<p>Read the <a href="/pricing" className="text-teal underline">pricing guide</a> first.</p>
<a href={cta.href} className="rounded-md border border-orange-deep bg-orange-deep px-6 py-3">…</a>
```

**Gate:** none — nothing static can tell which of two class strings is a state's only signal.

### Contrast: the settled pairs, failures included

| Pair | Ratio | Use |
|---|---|---|
| White on `#E4572E` (`orange`) | 3.68:1 | Fails AA — decorative wash only, never behind text |
| `#0E5A6B` (`teal`) on `#0B2B33` (`marine`) | 1.91:1 | Fails AA — no teal text on the dark ground |
| White on `#4FB3C7` (`teal-light`) | 2.44:1 | Fails AA — `teal-light` is an ink, never a button fill under white |
| `#E4572E` (`orange`) on `#0B2B33` (`marine`) | 4.05:1 | Fails AA — lighten to `#F0714B` (5.09:1) for accent *text* |
| White on `#BF411D` (`orange-deep`) | 5.26:1 | The accessible twin of `orange`; buttons use it |
| `#4FB3C7` (`teal-light`) on `#0B2B33` | 6.11:1 | The accessible twin of `teal` on dark |
| `#04141A` (`ink`) on `#4FB3C7` | 7.68:1 | Text on a `teal-light` fill — the ground, not white |

A new pair is computed before its token is committed. **Gate:** none.

**A pair is accessible only on the ground it actually lands on.** Two rows above were added after
a dark theme shipped white on a `teal-light` fill (2.44:1) and `orange` as text on `marine`
(4.05:1) — both reasoned against `--bg` while the element sat on a fill or `--panel`. Read the
composited background off the rendered DOM, never the token it inherits from.

### Interactive elements are `button` or `a`, never a `div` with a handler

A `div` with `role` and `tabIndex` re-implements Enter, Space and the disabled state, and usually
gets two of the three. `<button>` performs an action, `<a href>` goes somewhere, and both are
focusable, keyboard-operable and announced with a role for free.

**Gate:** Biome's `a11y` group, seeded and confirmed — `noStaticElementInteractions`,
`useKeyWithClickEvents`, `useValidAnchor`, `noPositiveTabindex`, `useAltText`. `check-a11y.mjs`
adds only what Biome cannot see: an `alt` that is a filename, the generic words outside
`noRedundantAlt`'s set (`logo`, `icon`, `graphic`), and a focus outline dropped in CSS.

### Motion respects `prefers-reduced-motion`

Movement nobody asked for causes nausea and migraine for some readers, and the browser knows
who. **Gate:** none.

```tsx
{/* WRONG — plays for someone who asked the OS for stillness */}
<div className="animate-pulse transition-transform hover:scale-105">…</div>

{/* CORRECT — the motion-safe variant compiles to the media query */}
<div className="motion-safe:animate-pulse motion-safe:transition-transform">…</div>
```

## Escapes

`// a11y-ok` (or `{/* a11y-ok */}`) on the offending line or the one above it, for markup the gate
cannot see through — a props spread supplying `alt`. It records a decision; it does not quiet one.

## Checklist

- [ ] Every image names its content or carries `alt=""` on purpose
- [ ] Heading levels run in sequence; every section has one, hidden if the design shows none
- [ ] Focus is visible everywhere, and tab order matches reading order
- [ ] No state, link, or status is signalled by colour alone
- [ ] Filled controls carry a border that survives forced-colors mode
- [ ] Text pairs meet AA; `orange` and `teal` never sit behind text
- [ ] Every control is a `button` or an `a`
- [ ] Animation is gated on `prefers-reduced-motion`
