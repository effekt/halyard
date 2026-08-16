---
title: Open Questions
summary: Undecided cross-cutting questions and the cost of deciding each one late
status: draft
---

# Open questions

Decisions not yet made, with what is known and what deciding late would cost. Questions
specific to one entity live inline in [`01-domain-model.md`](01-domain-model.md); this file
holds the ones that cut across documents.

Numbers are stable identifiers, cited from other documents. A resolved question keeps its
number and says so; a retired one leaves a gap. Neither is renumbered.

## 1. Where do UI hints live?

A block's schema says a field is `z.string()`. The editor needs more: a label, help text,
placeholder, field order, grouping, conditional visibility, and sometimes a specific
control — an image picker rather than a text box, a token picker rather than free colour.

**Option A — inside the schema**, via validator metadata (`.meta()`, `.describe()`, or an
annotation registry).
**Option B — a parallel structure** on the block, keyed by field path.

### What is verified so far

`uniforms-bridge-zod` was checked against actual source, and it is the cautionary case for
Option A. Its metadata channel is **prototype monkey-patching of zod itself**:

```ts
// uniforms-bridge-zod/src/register.ts
declare module "zod" {
  interface ZodType {
    uniforms(uniforms: UnknownObject | ConnectedField<any>): ZodTypeAny;
    _uniforms: UnknownObject | ConnectedField<any>;
  }
}

z.ZodType.prototype.uniforms = function extend(uniforms) {
  this._uniforms = uniforms;
  return this;
};
```

Typed by TS declaration merging, applied as an import side effect. It globally mutates a
third-party library's prototype, and that is the *cost of putting hints inside a schema
library that has no extension slot*. Standard Schema — which Halyard speaks precisely so
consumers can bring valibot or arktype — appears to expose only `validate()` and no
metadata surface, so the same approach would mean patching each validator separately.

Two further findings point the same way:

- The bridge is welded to zod v3 internals (`_def.checks`, `_def.minLength.value`,
  `.innerType()`, `.removeDefault()`, ~10 `instanceof ZodX` checks) and has **no zod v4
  support**; a source comment reads `// TODO: File an issue to expose a '.getStep'
  function.` They were already reaching past the public API.
- Its `getType` ends in `invariant(false, 'Field "%s" has an unknown type', name)` with no
  case for nullable, nullish, union, lazy, or discriminatedUnion — it throws.

`.describe()` is ignored entirely by that bridge; `_uniforms` is the only channel.

### Resolved — Option B, with a caveat

Two research passes disagreed. One recommended a parallel structure; the other recommended
in-schema authoring through each validator's sanctioned metadata API (`.meta()`,
`v.metadata()`, `.configure()`) behind one adapter — a genuinely reasonable proposal that
avoids monkey-patching.

**The deciding fact is that zod's registry is keyed by object identity, not by path.**
A shared schema constant carries one set of metadata everywhere it is referenced.
[`block-schemas.md`](../../.claude/rules/block-schemas.md) *requires* extracting shared
sub-schemas — `ctaSchema` imported by five blocks is the whole point of the rule. In-schema
hints would force re-wrapping at each use site, un-sharing exactly what we mandated sharing.
Our own DRY rule rules the approach out.

Supporting: Standard Schema exposes only `validate()`, so in-schema means three adapters and
per-validator capability gating; and the mature systems split on whether they own their
schema format — those with a foreign, portable format keep hints separate.

**Caveat that survives the decision:** introspection is still per-validator. Discovering
what fields exist requires `toJSONSchema()` where available and internal traversal
otherwise, behind a pinned adapter. See [`02-api-sketch.md`](02-api-sketch.md).

Recorded in [`02-api-sketch.md`](02-api-sketch.md). Ready to graduate to `docs/decisions.md`.

## 2. Dynamic routes

Does a page own a literal path only, or may it own a pattern such as `/blog/[slug]`?

Patterns mean route pointers carry a match kind rather than a literal path, and precedence has to
be defined and made deterministic. Literal-only is dramatically simpler and covers landing
pages, which is the actual first use case.

**Cost of deciding late:** it changes the stored route format, which is the one thing
artifacts are resolved through.

## 3. Localization

Does a `DocumentVersion` carry one locale or many?

This is the most expensive item on the list to retrofit, because it touches the document
table, the compile step, the route key, and every editor surface at once. It deserves an
explicit decision now — including an explicit "not in v1", which is a legitimate answer and
much better than silence.

**Cost of deciding late:** the highest of anything here.

## 5. Must the studio be same-origin with the app?

Cross-document drag works by the browser's native HTML5 drag session, and every
demonstrated example of it is **same-origin only**. Cross-origin is unsolved in every
library reviewed, including the one we are adopting.

The clean answer is to make same-origin true by construction: the studio mounts as a route
inside the consumer's own application — `/halyard` or similar — rather than running as a
separate server pointed at it. The consumer already installs a package; mounting a route is
no more intrusive than that, and it makes the iframe same-origin without asking anyone to
configure a proxy.

The cost is that the studio then ships inside the consumer's app bundle and must be
excluded from production builds, and it cannot edit an app it is not installed in.

**Cost of deciding late:** it determines whether the drag mechanism works at all, so
everything in [`04-studio-ui.md`](04-studio-ui.md) rests on it.

## 6. "Template" collides with Atomic Design

Brad Frost defines a template as *"page-level objects that place components into a layout
and articulate the design's underlying content structure"*, and a page as *"a specific
instance of a template… with real representative content in place"*.

That is our **Layout**, not our Template. Our Template — a document cloned once as a
starting point, with no ongoing relationship — has no equivalent in Atomic Design, because
propagation is a persistence concern a design methodology never confronts.

Most frontend developers carry Frost's meaning. Shipping a `kind: "template"` that means
"copy once, never propagates" invites exactly the wrong expectation, and the mistake is
silent: someone edits a template expecting pages to update, and nothing happens.

Candidate renames for the copy-once concept: `preset`, `starter`, `blueprint`. `preset`
reads best — it implies a starting configuration with no implied ongoing link.

Leaving `layout` as-is is fine; it is the more common CMS word and does not clash.

**Cost of deciding late:** `kind` is a stored enum. Renaming after documents exist is a
data migration plus a rename across every surface.

## 7. Scheduled publishing

Absent from the design entirely — no `scheduledAt`, no job runner among the adapters, and
`store.publish()` is synchronous. Marketing teams routinely want it, so its absence should be
a decision rather than an oversight.

The artifact model makes it unusually safe if we do want it: the artifact is compiled and
validated *before* the schedule is set, so firing at time T is a pointer move that cannot
fail on a surprise validation error. Contrast a system that compiles at publish time, where
a scheduled publish can fail at 3am with nobody watching.

What it needs: a `scheduledAt` on the pointer, a scheduler adapter (the consumer's — cron,
a queue, a durable timer), and a decision on what happens if the registry changed between
scheduling and firing. That last one is the same check as
the pre-rollback drift check in [`01`](01-domain-model.md#rollback) — the artifact records
`registryFingerprint`, so it is answerable.

**Cost of deciding late:** low. It is additive, and nothing else depends on it.

## 8. Bundle scaling — resolved

Was: nothing described how the block bundle stays bounded as the registry grows past the
~22 blocks that exist today toward a design system's ~122, given that adding components is
the consumer's stated pain and already forces defensive `next/dynamic` wrappers.

**Resolved by splitting catalog from registry.** The catalog is serializable data the studio
fetches; the registry is `Record<string, () => Promise<Component>>`, so the bundler emits a
chunk per block and a route resolves only the blocks its artifact names. Recorded in
[`02-api-sketch.md`](02-api-sketch.md#catalog-and-registry-are-two-things).

Still to confirm in practice: that a dynamic key over a literal map of `import()` calls
code-splits as expected in the target bundler, and whether resolution happens at build or
request for statically-generated routes.

## 9. Is there a primitive that lowers the *rate* of new-block requests?

The stated problem is not only that blocks are expensive to add — it is that marketing keeps
needing new ones. Every design decision so far reduces the cost per block; none reduces the
count.

The measured shape suggests a lever: `object` and `list` with recursive `subFields` dominate
in-scope schemas (~27% combined), so many "new component" requests may be variants of an
existing one rather than genuinely new compositions. A block with a well-designed variant
enum and slots can absorb requests that would otherwise each become a component.

Against that: a variant enum that grows without bound becomes a god-block, which is the
failure the curation model exists to prevent. Where the line sits is a real design question.

Worth measuring before deciding — of the last N component requests, how many were genuinely
new versus a variation on something registered. That evidence exists in the consumer's issue
tracker, not in the content dump.

**Cost of deciding late:** moderate. It is additive, but the wrong answer means Halyard
reduces per-block cost while the block count grows fast enough to cancel it.

## 10. Concurrent editing — lock at the node, not the document

A document-level pessimistic lock is correct but hostile: two authors wanting different
sections of one page block each other for no structural reason.

Because a `DocumentVersion` is `Record<id, Node>`, locking can be per node:

| Mechanism | Scope | Cost |
|---|---|---|
| Presence | Who is in the document | A heartbeat. No conflict resolution, most of the felt value. |
| Node lock | Acquired on selection, released on deselect or timeout | Two authors on different blocks never collide. |
| Structural lock | The **parent** node, for add / delete / reorder | Those mutate the parent's `slots`, so the lock is still local. |

Open within this: lock expiry when a holder closes their laptop, whether a takeover exists,
and whether presence needs a server or can ride the draft store.

**Real concurrent editing stays available later.** `{root, elements}` maps closely onto a
CRDT map-of-records (Yjs `Y.Map`, Automerge); a nested tree is the hard case for both. The
flat shape was chosen for editing ergonomics and preserved this option incidentally — so
CRDT would be a swap of the sync layer rather than a rewrite of the model.

Attribution needs no new storage: `DocumentVersion.createdBy` plus a key-wise diff between
consecutive versions yields per-node authorship, and derived beats stored here because it
cannot go stale.

## 11. The authoring store has no interface

`ArtifactStore` is defined; the authoring side is not. Documents, versions, the autosave
slot, and locks are all described as living "in the authoring store" without one ever being
declared — so the adapter rule that governs it has no contract to point at, and a consumer
cannot substitute their own.

It needs at least: read and write a document, append a version, read and overwrite the
autosave slot, acquire and release a node lock, and list documents for the page index. The
autosave slot is the awkward one — it is the only mutable, high-frequency write in a design
that is otherwise append-only, so it may deserve separation rather than sharing a contract
with version history.

**Cost of deciding late:** moderate. It is additive, but every studio flow already assumes
this store exists, and writing it after the studio would mean retrofitting a boundary rather
than designing one.

## 12. Route syntax is load-bearing and unvalidated

`RoutePointer.matchKind` is derived from the route string, so `[city]` and a trailing `/*`
now carry meaning. Nothing defines what happens when a literal route legitimately contains
one of those characters, how a malformed pattern is rejected, or whether two patterns may
overlap ambiguously.

Precedence is settled (exact, then param, then prefix, most specific first). Validation and
escaping are not.

**Cost of deciding late:** low individually, but it is stored data — a route already
persisted under a loose parser is expensive to reinterpret later.

## 13. Model-level questions

Recorded inline in [`01-domain-model.md`](01-domain-model.md#open-questions): layout slot
merge semantics, version retention, ownership of SEO `meta`, and concurrent editing.
