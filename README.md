# Halyard

A page builder that lives inside your codebase.

Developers curate a set of blocks in code. Non-developers compose pages from them. The
composition is data, the contract is code, and publishing compiles a document into an
immutable artifact — no bundler, no deploy, no second source of truth.

There is no package to install yet — see [Status](#status) — but the shape is settled. A
block declares its schema once, and each field decides for itself whether it freezes at
publish or stays live:

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
  component: Hero,        // props are InferProps<typeof heroSchema> — no second definition
  ui: {
    fields: {
      title: { label: "Headline" },  // no `data` — static, frozen at compile. The default.
      price: { data: "request" },    // resolved fresh at every render. Per field, not per block.
    },
  },
});
```

Compiling that document freezes what's static and leaves the rest as a typed hole — the
artifact never carries the schema, only the outcome of validating against it:

```ts
// one node of the compiled Artifact — see docs/design/01-domain-model.md#artifact
{
  id: "n1",
  block: "Hero",
  props: { title: "Sale ends Friday", cta: { label: "Shop now", href: "/sale" } },
  holes: { price: "request" },
}
```

## Why

Hosted visual CMSes put the **schema** in someone else's database. Everything painful
follows from that: two environments that drift, reconciliation tooling to keep them in step,
promotion runbooks, and a caching tier to survive a round trip on every render.

Halyard moves the contract into the repository, where it ships atomically with the component
that consumes it, and leaves only the content — the part that genuinely changes hourly — in
a database.

| | |
|---|---|
| **Schema in code** | Props are inferred from the schema. There is no second definition to drift. |
| **Content as data** | One store, versions instead of environments. Promotion is a pointer move, not a copy. |
| **Immutable artifacts** | Content-addressed, cached forever, rolled back by pointer. Nothing to invalidate. |
| **No deploy to publish** | Compiling validates and serializes. Only a *code* change needs a build. |
| **Precise code-splitting** | An artifact names the blocks a page uses, so the hundredth block costs other pages nothing. |
| **Bring your own everything** | Storage, auth, and validation are adapters. The core depends on nothing but Standard Schema. |

## What it refuses

As much a part of the design as what it does. These are permanent, not deferred:

- **Executable content.** No author-supplied JavaScript, no CSS blocks, no expression
  language, no binding strings evaluated at render. An artifact is inert data validated
  against a schema.
- **Structured data that is not a page.** Rows consumed through typed transforms are a
  database, not a CMS.
- **Templates that generate many routes from bound state.** Those stay coded routes;
  repetition belongs in components, which are reviewed as code.

## Status

**Design, not software.** There is no implementation yet — deliberately.

The architecture is settled and has been through an adversarial review that falsified
several of its early claims. What exists today is the reasoning, the constraints, and the
tooling that will hold an implementation to them. The gates that check documentation,
terminology, and dependency pinning already run on every commit. The ones that check code
are waiting for code.

The first milestone is not a feature. It is migrating two or three real pages with no editor
at all, because that is the cheapest way to find out whether curated blocks are actually
cheaper than the free-form authoring they replace.

| Read | For |
|---|---|
| [`docs/architecture.md`](docs/architecture.md) | How the pieces fit |
| [`docs/decisions.md`](docs/decisions.md) | What is settled, and what was rejected |
| [`docs/design/`](docs/design/) | The model, the API shape, the studio, the roadmap |
| [`docs/design/05-open-questions.md`](docs/design/05-open-questions.md) | What is still undecided — the best place to disagree |

`pnpm catalog` prints every document with a one-line summary.

## Contributing

Read [`AGENTS.md`](AGENTS.md) first — it documents the invariants and the gates.
[`CONTRIBUTING.md`](CONTRIBUTING.md) covers setup and what's worth contributing before any
code exists.

The short version: one unit per file, schemas composed rather than nested, every dependency
pinned, and every nameable step extracted. Quality gates are enforced rather than suggested,
including on prose — documentation rots faster than code and shows no symptoms.

Disagreement about the design is more useful than agreement right now. Open questions are
numbered and stable; cite one.

Governed by the [Contributor Covenant](CODE_OF_CONDUCT.md). Report vulnerabilities per
[`SECURITY.md`](SECURITY.md).

## License

MIT
