---
title: Settled Decisions
summary: Settled choices and the reasoning behind them, so they are not re-litigated
status: stable
---

# Decisions

Settled choices and the reasoning behind them, so they are not re-litigated. A decision is
reversible; the reasoning is what tells you whether reversing it is safe.

## Schema in code, content in a database

The contract ships with the code that consumes it, so two environments cannot hold
different versions of it. Content does not — it changes hourly, by people without a
checkout, and must publish without a deploy.

Rejected: schema in a hosted service. That is what forces reconciliation tooling, promotion
runbooks, and a caching tier, and it is the failure this project exists to avoid.

## Content is not in git

Considered seriously, because git gives content one identity and one history. Rejected as
the primary store: publishing would become a deploy, non-technical authors would need
repository access, and JSON merge conflicts would be authored by people who cannot resolve
them.

Environment parity does not require git — it requires there to be **one document**. A single
store with per-version status makes "staging" a read perspective rather than a copy, so
drift is unrepresentable.

A one-way mirror to a content repo remains open as an audit and disaster-recovery path. It
is write-only, so it carries none of the costs above.

## Standard Schema, not zod

The pitch is "bring your own integration"; hard-coding a validator contradicts it. Standard
Schema is types-plus-one-method, so the cost is near zero and a consumer can use zod,
valibot, or arktype.

zod is a devDependency because tests must run against a real implementation.

## Props inferred from the schema, never declared

A hand-written props interface beside a schema is a second definition of one contract, free
to drift. `InferProps<typeof xSchema>`, exported by `core`, makes drift impossible rather
than merely discouraged. It resolves to Standard Schema's `InferOutput`, so a component sees
what `validate()` returned rather than what the author typed.

## Artifacts are immutable and content-addressed

An immutable artifact has no invalidation semantics at the store: nothing to revalidate, no
negative cache, no single-flight. (Field-level `revalidate` is data freshness inside an
artifact, not artifact invalidation.) Publishing points at a new hash; rolling back points
at the old one.

The only mutable output is a **route pointer**, one atomic record per route. A single
manifest document was the first design and it permitted silent lost updates: two concurrent
publishes read the same snapshot and the second overwrote the first, with no error. A
single-key write is atomic on object storage, a database row, or a filesystem; a
read-modify-write over a whole table is not.

## Artifacts contain data, never code

No author-supplied JavaScript, no CSS blocks, no expression language, no binding strings
evaluated at render. This is a security and performance boundary, not a preference — the
alternative is executable content authored by someone positioned to assess neither risk.
Hosted visual CMSes routinely permit all four, stored as content and evaluated at render.

Repetition and logic live in components, which are code and are reviewed as code. A block
that renders a list takes the list as a prop and loops internally; the document never
expresses the loop.

## Layout is ordinary props, and Nubbin ships no CSS

A value like `space: "lg"` passes through as data. What it *means* is resolved by the
consumer's component, in their codebase, with their design system.

Rejected: shipping a token scale. It was a smaller opinion than emitting utility classes but
the same category of mistake, and it fails the case that matters — a consumer redefining
what `"lg"` means without regenerating anything.

The constraint that protects the design system lives in the schema instead:
`z.enum(["none","sm","md","lg"])` is a closed set with no path to express anything else.
Crucially it constrains the **block schema**, the author-facing surface — not the design
system's own props, which stay as open as they need to be.

## Editing hints live beside the schema, not inside it

A parallel structure keyed by field path. Considered and rejected: each validator's own
metadata slot behind one adapter — which avoids monkey-patching and reads well.

It loses because a validator's metadata registry is keyed by object identity, so a shared
schema constant carries one set of hints everywhere it is referenced. Extracting shared
sub-schemas is a rule here; identity-keyed hints are hostile to it. Standard Schema also
exposes only `validate()`, so in-schema authoring would mean an adapter per validator.

JSON Forms and react-jsonschema-form both keep a UI schema parallel to the data schema, and
Storybook keeps `argTypes` beside the component — hints stay parallel when the schema format
is foreign to the tool.

## Catalog and registry are separate

The catalog is serializable data the studio reads; the registry maps a block name to a lazy
import the app resolves. A flat array of components makes every page carry every block.

Splitting them means a route loads only what its artifact names, so the hundredth block
costs pages that do not use it nothing — and validation can run in CI with no React present.

## Flat while authoring, nested once published

A draft is `{ root, elements }` keyed by id; an artifact is a resolved tree. Editing wants
random access — selection, patching, undo, and reordering all key on id — while rendering
wants a self-contained structure with no lookups.

Compile is the denormalization, which is also where reference integrity, cycle-freedom, and
reachability get checked. A cyclic graph cannot flatten into a tree, so it fails at publish
rather than looping at render.

## The studio is self-hosted, with optional surfaces on top

A consumer deploys and runs it alongside their own storage and CDN. That is what makes its
iframe canvas unproblematic: the person deploying the studio also controls the site's
headers, so `frame-ancestors` is a configuration line rather than a wall. A hosted vendor
cannot make that assumption, which is why one ships a browser extension whose stated job is
rewriting those headers.

An extension and an in-site script are optional surfaces for editing in place. Both are free.
The rule that lets one bundle serve all three: **learn about the page only through the DOM** —
never a `window` global, never framework internals.

## Free and open source; the business is convenience

The software is free, including the studio, the extension, and the script. Charging for the
editor would make the free tier not a product, and adoption is the point.

What costs money is running it — hosted storage and API, realtime collaboration, SSO,
approval workflows, audit and retention, support. Things that cost real money to operate, or
that only matter at organisational scale.

## What is out of scope, and how firmly

Three things are out of scope by construction rather than by backlog. Each is recorded with
its reason, because a boundary nobody can re-derive is one a later maintainer has to take on
faith — and these have reasons that can be checked.

| Out of scope | Because | How firm |
|---|---|---|
| **Executable content** — author JavaScript, CSS blocks, an expression language, binding strings evaluated at render | Each one lets a person who cannot assess a security or performance risk ship one to production. Accepting any of them means an artifact is no longer inert data. | **Load-bearing.** The rendering and caching model rests on artifacts being inert; removing this means redesigning both. |
| **Structured data that is not a page** — rows consumed through typed transforms | That is a database with an editing UI. A good one is a different product with different primitives, and building both makes each worse. | Scope. A separable concern, not a contradiction. |
| **Templates that generate many routes from bound state** | The route table stops being enumerable, so nothing can answer what URLs exist. | Scope. A design keeping routes enumerable would be worth hearing. |

The distinction matters for contributors: the first cannot move without a different
architecture, while the second and third are judgments about what this project is. Arguing the
latter two is legitimate — open an issue.

## A copy-once document is a preset, not a template

Atomic Design defines a template as page-level structure articulating a layout, and a page as
an instance of one with real content. That is Nubbin's **Layout**. Nubbin's copy-once
document — cloned as a starting point, with no ongoing relationship to its source — has no
Atomic Design equivalent, because propagation is a persistence concern a design methodology
never confronts.

`kind: "preset"` is that value. Most frontend developers carry Frost's meaning, so
`kind: "template"` invites the expectation that editing one updates the pages made from it,
and **the mistake is silent**: nothing happens, and nothing says why.

`starter` and `blueprint` were the other candidates. `preset` won because it implies a
starting configuration with no implied ongoing link, which is exactly the distinction being
protected. `layout` is unchanged — it is the commoner CMS word and it does not clash.

Deciding this after documents exist would cost a data migration on a stored enum plus a rename
across every surface, which is why it was settled before the first phase writes a real `kind`.

## Each registry file is named after the type it holds

`@nubbin/core` exports `createRegistry(blocks): Registry`, the compile-side registry that
`compile` validates against. `@nubbin/react` exports `defineRegistry(map): BlockRegistry`, the
render-side map of lazy importers. Two registries exist on purpose — it is the catalog/registry
split as a consumer meets it, and the render path imports only the second.

A consumer's `registry.ts` holds the `Registry`. A consumer's `blockRegistry.ts` holds the
`BlockRegistry`. Two plans crossed these, so `blockRegistry.ts` held a `Registry` and
`registry.ts` held a `BlockRegistry`, and the catch-all went on importing `@/nubbin/registry`
and receiving the wrong kind of object — a mismatch no gate can see, because both files exist
and both typecheck in isolation.

The alternative was letting whichever plan shipped first fix the names by convention. It was
rejected because the names had already diverged across two phases and five dependent tasks, and
a convention nobody can check is how they diverged.

**The earlier phase owns the artifact; the later phase consumes it.** Phase 2 needs the demo's
blocks, catalog, both registries, the publish script and the catch-all to demonstrate its own
thesis, so ownership cannot move to Phase 3 without blocking the earlier phase on the later one.

## One root element per block, enforced at render

The renderer invokes a block and clones the returned element to stamp `data-nubbin-node`, so a
Fragment root leaves nothing to clone. `invokeBlock` throws when the returned value is not a
clonable element, naming the block and the node.

Static analysis was the alternative — reading each component's return paths from the TypeScript
AST, which the repository already does elsewhere. It was rejected as redundant rather than
wrong: the render-time check catches every case including the conditional and array returns
static analysis cannot prove, and a second mechanism catching a subset of the same class earlier
buys less than it costs to maintain.

The original argument for a gate was that the failure would be silent — a node carrying no
attribute, discovered in the studio phases later. That stopped being true when the renderer
shipped: it throws on first render, in development, naming the block.

## Blocks are server components

A block is invoked and its root cloned. A client reference cannot be invoked on the server, so a
client block does not render at all — React throws `Attempted to call X() from the server`, which
`invokeBlock` lets through untouched because the block's own failure is more informative than
anything the renderer could substitute.

Supporting client blocks would need a second render path emitting `createElement(component, …)`
without invoking, which makes `data-nubbin-node` part of every block's public prop contract and
requires each client block to spread rest props onto its root. That is a contract no gate can
check, failing silently as an unselectable region, in exchange for a case no consumer has asked
for.

The alternative was a wrapper element around each block, which stamps reliably. It was rejected
because it changes the consumer's layout, and Nubbin holds no opinion about styling.

## `core` depends on nothing

It has to run in a browser (the studio validates drafts client-side), a worker, and a CI
step. A single `node:` or `react` import ends that. Enforced by dependency-cruiser rather
than by review.

## Pinned versions and a 3-day cooldown

A range is a standing instruction to install unreviewed code on a schedule set by whoever
holds the publishing token. Pinning removes the automatic upgrade; `minimumReleaseAge`
covers the window where a pin is deliberately bumped to something freshly hijacked. Either
control alone leaks.

3 days, not 7: real npm compromises are caught in hours — the September 2025 `chalk` and
`debug` takeover was detected and removed the same day — and the attacks that survive a week
need a window no tolerable cooldown provides.

## No committed catalog of the codebase

A generated index goes stale and conflicts on every branch that adds a unit. `pnpm map`
produces one on demand into a gitignored path instead.

## Generated documents live only on `gh-pages`

`main` holds hand-written source. CI generates the site from it and publishes to `gh-pages`,
which is build output and is never hand-edited. Generated output that serves a developer
rather than a reader goes to a gitignored path on demand, as
[the codebase catalog does](#no-committed-catalog-of-the-codebase).

A published copy that nothing generates has nothing to compare itself against, which is how
the documents carrying the same name on both branches diverged, and how the site came to
publish prose `check-prose.mjs` rejects.

Rejected: committing generated documents to `main` so that `pnpm docs:generate && git diff
--exit-code` can check them. It reverses the catalog decision above and reintroduces the
per-branch conflicts that decision exists to avoid; worse, while nothing generated is
committed it passes without examining anything, which is a gate reporting success for work it
never did. Idempotence is proven by generating twice and comparing the outputs; drift by
comparing generated output against what is published.

## Gates enforce, rules judge

Anything mechanically checkable is a script or a lint rule, so it cannot be forgotten or
argued with. What remains — whether a step inside a function deserves its own name — is
written down in `.claude/rules/` and reviewed by a hook, because no gate can encode it.

The `logMessage` case is the proof: a function that formats its own timestamp inline is one
declaration, eight lines, complexity 1. Every gate passes it. It is still wrong.

## One origin serves both audiences

`nubbin.io` is canonical. `nubbin.dev` and `nubbin.ca` redirect to it permanently, and are held
rather than allowed to lapse.

A page that sells the product and a page that documents it answer different questions, and one
page attempting both serves neither with force. They are therefore two paths on the same origin,
and moving between them is an ordinary navigation. Each view has an address, so it can be linked,
indexed and sent to someone. A switch held only in client state gives the second view no URL, and
a view nobody can link to is one nobody arrives at.

Rejected: a domain per audience, with the developer site living at `nubbin.dev`. The name says
who it is for and the TLD is on the HSTS preload list, so the reading is right. It loses on two
counts. Cross-document View Transitions are same-origin only, so the switch between the two views
degrades from a transition to a page load exactly when it is the thing being demonstrated. And
inbound links divide across two origins rather than accumulating on one, which costs the newer
surface the most. A redirect supplies the mnemonic without either cost.

Holding `nubbin.io` also settles the collision recorded in
[#74](https://github.com/effekt/nubbin/issues/74), which rested on that name belonging to someone
else.

Where the documentation sits under this origin is settled with the generator, in
[the design-site entry](#the-design-site-runs-docusaurus), because a path and a generator
constrain each other.

## The design site runs Docusaurus

Every defect the site's audits found was the theme's, never the documents': syntax
highlighting below WCAG AA, tables restyled until they lost table semantics, a second `h1`
on every page from the masthead, mermaid patched in through a CDN script in a layout
override, and no search — the full list, with scale, is
[#71](https://github.com/effekt/nubbin/issues/71).

So the site is a workspace, `apps/docs`, running Docusaurus over `docs/` on `main` as its
content root — the documents live once, and
[generated output still goes only to `gh-pages`](#generated-documents-live-only-on-gh-pages).
Mermaid is an official plugin rather than a patched-in script; a broken link fails the
build, and upstream maintains that check; and the site is React, which is what Nubbin
renders — the strongest demo this project can have is a page on this site built from real
Nubbin blocks, and a static generator forecloses it. That argument is the deciding one; the
rest is quality of life.

The site serves at `/docs` on [the canonical origin](#one-origin-serves-both-audiences),
whose root is the landing page. Rejected: `/reference`, a name that fits only the API pages
and misdescribes the corpus the moment a guide lands; and the documentation at the root,
which takes the front door from the page whose job is selling what the documents describe.

Rejected: staying on a static generator and accepting a patch per theme defect. Right while
the site was a handful of documents nobody styled; the defect list is what ended it.

The dependency surface is not an exception to
[the pinning discipline](#pinned-versions-and-a-3-day-cooldown). `check-pinned-deps.mjs`
reads every manifest git tracks plus the workspace catalog, and never walks the transitive
tree — so exactly pinning the site's direct dependencies
satisfies it in full, and the transitive tree answers to the lockfile,
`blockExoticSubdeps` and `minimumReleaseAge` the same way every other dependency's does.
