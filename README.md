# Halyard

**Your components. Their pages.**

A page builder that lives inside your codebase. Developers curate a set of blocks in code;
non-developers compose pages from them. The composition is data, the contract is code, and
publishing compiles a document into an immutable artifact — no bundler, no deploy, no second
source of truth.

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
// one node of the compiled Artifact — see docs/domain-model.md
{
  id: "n1",
  block: "Hero",
  props: { title: "Sale ends Friday", cta: { label: "Shop now", href: "/sale" } },
  holes: { price: "request" },
}
```

## Why

A page builder holds two contracts: what a block will accept, and what an author composed.
Halyard puts the first in your repository, shipping atomically with the component that reads
it, and the second in a database, where it can change hourly without a build.

That single split is the whole design, and everything below follows from it. Put the schema in
a database instead and you inherit two environments that drift, tooling to reconcile them, and
a cache to survive a round trip on every render.

| Property | What it buys |
|---|---|
| **Schema in code** | Props are inferred from the schema. There is no second definition to drift. |
| **Content as data** | One store, versions instead of environments. Promotion is a pointer move, not a copy. |
| **Immutable artifacts** | Content-addressed, cached forever, rolled back by pointer. Nothing to invalidate. |
| **No deploy to publish** | Compiling validates and serializes. Only a *code* change needs a build. |
| **Precise code-splitting** | An artifact names the blocks a page uses, so the hundredth block costs other pages nothing. |
| **Bring your own everything** | Storage, auth, and validation are adapters. The core depends on nothing but Standard Schema. |

## Status

**Design, not software.** There is no implementation yet — deliberately.

What exists is the architecture, the decisions and the alternatives each one beat, and the
tooling that will hold an implementation to them. It has been through one adversarial review
that falsified several of its early claims, which is a reason to trust it more than an
unreviewed design and not a reason to treat it as finished — [the open
questions](https://github.com/effekt/halyard/issues/15) are the parts known to still be wrong.

The gates that check documentation, prose, and dependency pinning run on every commit. The
ones that check code are waiting for code.

The [roadmap](https://github.com/effekt/halyard/issues/14) sequences the build. Its first
milestone is deliberately not a feature — it exists to falsify the project's own thesis, by
authoring real pages against real blocks with no editor at all, before anything expensive is
built on top of that assumption.

| Read | For |
|---|---|
| [`docs/architecture.md`](docs/architecture.md) | How the pieces fit |
| [`docs/decisions.md`](docs/decisions.md) | What is settled, what was rejected, and what is out of scope |
| [`docs/domain-model.md`](docs/domain-model.md) | Every entity and what owns it |
| [`docs/api.md`](docs/api.md) | The API shape |
| [Open design questions](https://github.com/effekt/halyard/issues/15) | What is still undecided — the best place to disagree |

`pnpm catalog` prints every document with a one-line summary.

## Contributing

Read [`AGENTS.md`](AGENTS.md) first — it documents the invariants and the gates.
[`CONTRIBUTING.md`](CONTRIBUTING.md) covers setup and what's worth contributing before any
code exists.

The short version: one unit per file, schemas composed rather than nested, every dependency
pinned, and every nameable step extracted. Quality gates are enforced rather than suggested,
including on prose — documentation rots faster than code and shows no symptoms.

Disagreement about the design is more useful than agreement right now — the
[open questions](https://github.com/effekt/halyard/issues/15) are where to start.

Governed by the [Contributor Covenant](CODE_OF_CONDUCT.md). Report vulnerabilities per
[`SECURITY.md`](SECURITY.md).

## License

MIT
