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
to drift. `InferProps<typeof xSchema>` makes drift impossible rather than merely
discouraged.

## Artifacts are immutable and content-addressed

An immutable artifact has no invalidation semantics — nothing to revalidate, no
stale-while-revalidate, no negative cache, no single-flight. Publishing points at a new
hash; rolling back points at the old one.

The only mutable output is a **route pointer**, one atomic record per route. A single
manifest document was the first design and it permitted silent lost updates: two concurrent
publishes read the same snapshot and the second overwrote the first, with no error. A
single-key write is atomic on object storage, a database row, or a filesystem; a
read-modify-write over a whole table is not.

## Artifacts contain data, never code

No author-supplied JavaScript, no CSS blocks, no expression language, no binding strings
evaluated at render. This is a security and performance boundary, not a preference — the
alternative is executable content authored by someone positioned to assess neither risk.

Repetition and logic live in components, which are code and are reviewed as code. A block
that renders a list takes the list as a prop and loops internally; the document never
expresses the loop.

## Layout is ordinary props, and Halyard ships no CSS

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

Four independent systems that faced the same choice — three form libraries and a component
workshop — all keep hints parallel when the schema format is foreign to them.

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

## `core` depends on nothing

It has to run in a browser (the studio validates drafts client-side), a worker, and a CI
step. A single `node:` or `react` import ends that. Enforced by dependency-cruiser rather
than by review.

## Pinned versions and a 3-day cooldown

A range is a standing instruction to install unreviewed code on a schedule set by whoever
holds the publishing token. Pinning removes the automatic upgrade; `minimumReleaseAge`
covers the window where a pin is deliberately bumped to something freshly hijacked. Either
control alone leaks.

3 days, not 7: real npm compromises are caught in hours. Day 3 captures nearly all the
value, and the attacks that survive a week need a window no tolerable cooldown provides.

## No committed catalog of the codebase

A generated index goes stale and conflicts on every branch that adds a unit. `pnpm map`
produces one on demand into a gitignored path instead.

## Gates enforce, rules judge

Anything mechanically checkable is a script or a lint rule, so it cannot be forgotten or
argued with. What remains — whether a step inside a function deserves its own name — is
written down in `.claude/rules/` and reviewed by a hook, because no gate can encode it.

The `logMessage` case is the proof: a function that formats its own timestamp inline is one
declaration, eight lines, complexity 1. Every gate passes it. It is still wrong.
