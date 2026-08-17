---
paths: "packages/**/*.schema.ts, packages/**/blocks/**, apps/**/blocks/**"
title: Block Schema Rules
summary: How to compose a block's schema from named sub-schemas without duplication
status: stable
---

# Block schemas

> **A schema is composed from named sub-schemas, never nested inline. Props are inferred from the schema; they are never declared twice.**

## Why schemas need their own rule

A large schema evades every other gate. It is one declaration, so `check-single-export`
counts one unit. It has no control flow, so cognitive complexity scores ~0. It is not a
function, so the 50-line function cap does not apply. A 90-line `z.object({…})` passes
everything while being precisely the god-object the rules exist to prevent.

It is also where duplication concentrates. Five blocks that each inline `{ label, href }`
for their CTA are five copies that drift independently — one gains validation, one gains a
`target`, and no two blocks agree on what a CTA is.

## Rules

### Never nest an object schema

```ts
// WRONG — the CTA and each item are sub-schemas hiding inside a bigger one
export const heroSchema = z.object({
  title: z.string(),
  cta: z.object({ label: z.string(), href: z.string().url() }),
  items: z.array(z.object({ icon: z.string(), body: z.string() })),
});

// CORRECT — cta.schema.ts, featureItem.schema.ts, hero.schema.ts
export const heroSchema = z.object({
  title: z.string(),
  cta: ctaSchema,
  items: z.array(featureItemSchema),
});
```

`scripts/check-schema-depth.mjs` enforces this on every agent edit and at pre-commit. It
matches any callee named `object`, so it holds for zod, valibot, or anything else a
consumer brings.

The payoff is immediate: `ctaSchema` is now importable by every block that has a CTA,
testable on its own, and changeable in one place.

### Props are inferred, never declared

```ts
// WRONG — two definitions of the same contract, free to drift
export interface HeroProps { title: string; tone: "light" | "dark" }
export const heroSchema = z.object({ title: z.string(), tone: z.enum(["light", "dark"]) });

import type { InferProps } from "@nubbin/core";

// CORRECT — one definition, the type follows from it
export type HeroProps = InferProps<typeof heroSchema>;
```

This is invariant 1 in `AGENTS.md`. A hand-written props interface beside a schema is the
exact failure this project exists to remove.

### One schema per file, named for the file

`hero.schema.ts` exports `heroSchema`. Schema files are exempt from
`useFilenamingConvention` (the `.schema.ts` suffix), not from one-unit-per-file.

### Reuse before defining

A new field shape is almost never new. Check the existing `*.schema.ts` files first; a
near-match should be reused, or widened with an optional field — not forked. Two schemas
that differ only in a field name are one schema and a rename.

### Constrain, don't open

Expose an enum over a free string wherever the value drives styling or layout. `tone:
z.enum(["light", "dark"])` is a contract the renderer can rely on; `tone: z.string()` is
an open door that puts arbitrary values in published artifacts.

## Mechanical limits

| Gate | Limit |
|---|---|
| `check-schema-depth.mjs` | zero nested object schemas |
| `noExcessiveLinesPerFile` (`*.schema.ts` override) | 60 lines |
| `jscpd` | `minTokens: 15`, 1% — catches a shape copied between blocks |

A schema file over 60 lines is inlining sub-schemas that want names.

## Checklist

- [ ] No `object(…)` appears inside another `object(…)`
- [ ] Every nested shape is an imported, named schema
- [ ] Props are `InferProps<typeof xSchema>` from `@nubbin/core`, never a hand-written interface
- [ ] Searched existing schemas before defining a new shape
- [ ] Styling/layout-driving fields are enums, not open strings
- [ ] The schema has a test asserting both an accepted and a rejected value
