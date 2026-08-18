# Nubbin

**Your components. Their pages.**

A page builder that lives inside your codebase. Developers curate a set of blocks in code;
non-developers compose pages from them. The composition is data, the contract is code, and
publishing compiles a document into an immutable artifact — no bundler, no deploy, no second
source of truth.

Nubbin is deliberately not a general-purpose CMS. It answers one question: how does someone who
does not write code publish pages from components your application already owns?

```bash
npm install @nubbin/core@rc
```

Four packages are published as release candidates; the studio is not built yet — see
[Status](#status). A block declares its schema once, and each field decides for itself whether
it freezes at publish or stays live:

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
Nubbin puts the first in your repository, shipping atomically with the component that reads
it, and the second in a database, where it can change hourly without a build.

That single split is the whole design, and everything below follows from it. Put the schema in
a database instead and you inherit two environments that drift, tooling to reconcile them, and
a cache to survive a round trip on every render.

| Property | What it buys |
|---|---|
| **Schema in code** | Props are inferred from the schema. There is no second definition to drift. |
| **Content as data** | One store, versions instead of environments. Promotion is a pointer move, not a copy. |
| **Immutable artifacts** | Content-addressed, cached forever, rolled back by pointer. Nothing to invalidate at the store; the page cache drops one route on publish. |
| **No deploy to publish** | Compiling validates and serializes. Only a *code* change needs a build. |
| **Precise code-splitting** | An artifact names the blocks a page uses, so the hundredth block costs other pages nothing. |
| **Not in your render path** | Publishing produces an artifact your application serves on its own. A Nubbin outage cannot take down a page that is already published. |
| **Bring your own storage** | Storage, auth and validation are adapters. Artifacts live where you put them — object storage, a database, your deployment output. |
| **Portable core** | `@nubbin/core` depends on nothing but Standard Schema, and runs in a browser, a worker, a server or a CI step. |

Published pages do not call Nubbin. The application reads immutable artifacts from storage you
chose, and the artifact holds the *result* of validating against the schema rather than a
reference back to it. Nubbin is needed to change a page, not to serve one.

## Status

**Four packages are complete and the studio is not started.**

| Package | State |
|---|---|
| `@nubbin/core` | `defineBlock`, `defineCatalog`, `createRegistry`, `compile`, `checkRollback` |
| `@nubbin/store-fs` | A pointer-per-route store, passing a contract suite a third-party adapter can run |
| `@nubbin/next` | Read and write paths — resolve, prebuild params, publish and unpublish |
| `@nubbin/react` | The renderer, the block registry, and hole resolution |

All four are on npm under the `rc` tag; `npm view @nubbin/core dist-tags` is the current answer. Everything is tested against real
schemas rather than mocks, and a build gate fails on any `node:` or framework import inside
`core`, so the claim that it runs anywhere is checked rather than asserted.

The studio runs against the demo: it reads the catalog, previews a draft, edits a field, and
publishes the artifact. [`apps/studio/README.md`](apps/studio/README.md) is its current extent.

The milestone that could invalidate the whole approach has run — five real pages authored as
fixtures against real blocks, with no editor. Weighing the evidence it produced is
[#70](https://github.com/effekt/nubbin/issues/70).

The architecture came first, with the decisions and the alternatives each one beat. It has
been through one adversarial review, which falsified the live postMessage preview and the
single-manifest publish; both were redesigned. That is a reason to trust the design more than
an unreviewed one, not a reason to treat it as finished — [the open
questions](https://github.com/effekt/nubbin/issues/15) are the parts known not to be settled.

Every gate runs on every commit, including the ones that inspect the codebase rather than
trusting a declared convention — package boundaries, dead code, type coverage, and whether a
published package actually installs.

The [roadmap](https://github.com/effekt/nubbin/issues/14) sequences the build. Its first
milestone is deliberately not a feature — it exists to falsify the project's own thesis, by
authoring real pages against real blocks with no editor at all, before anything expensive is
built on top of that assumption.

| Read | For |
|---|---|
| [`docs/architecture.md`](docs/architecture.md) | How the pieces fit |
| [`docs/decisions/`](docs/decisions/README.md) | What is settled, what was rejected, and what is out of scope |
| [`docs/domain-model.md`](docs/domain-model.md) | Every entity and what owns it |
| [`docs/api.md`](docs/api.md) | The API shape |
| [Open design questions](https://github.com/effekt/nubbin/issues/15) | What is still undecided — the best place to disagree |

Every package carries a generated [`CATALOG.md`](packages/core/CATALOG.md) — one row per
file, naming the export, its kind, and its own first line of documentation.

## Contributing

Read [`AGENTS.md`](AGENTS.md) first — it documents the invariants and routes to the rest; the
gates are in [`docs/gates.md`](docs/gates.md).
[`CONTRIBUTING.md`](CONTRIBUTING.md) covers setup and what's worth contributing before any
code exists.

The short version: one unit per file, schemas composed rather than nested, every dependency
pinned, and every nameable step extracted. Quality gates are enforced rather than suggested,
including on prose — documentation rots faster than code and shows no symptoms.

Disagreement about the design is more useful than agreement right now — the
[open questions](https://github.com/effekt/nubbin/issues/15) are where to start.

Governed by the [Contributor Covenant](CODE_OF_CONDUCT.md). Report vulnerabilities per
[`SECURITY.md`](SECURITY.md).

## License

MIT.

**`@nubbin/core` is MIT and will stay MIT.** Commercial Nubbin products may charge for hosted
infrastructure and operational convenience; the contract and the compiler will not move behind
a commercial licence. Pay to have it operated, not for permission to use it.
