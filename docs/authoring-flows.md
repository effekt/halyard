---
title: Authoring Flows
summary: What an author does step by step, each flow's failure modes, and how they resolve
status: draft
---

# Authoring flows

What an author does, step by step, against the model in [domain model](domain-model.md)
and the API in [API sketch](api.md), with the canvas described in
[`studio.md`](studio.md). Each flow is Trigger → Steps → System → Failure modes. Several
failure modes are open questions rather than settled behavior, and are marked as such.

## 1. Create a page

**Trigger:** author clicks "New page."

**Steps:** choose a route (a literal path, e.g. `/promotions/summer`); pick a layout (a
`Document` with `kind: "layout"`) or none; optionally start from a preset instead of blank.
"Preset" is the working name here — the stored enum value is still `kind: "template"`, and
renaming it to avoid colliding with Atomic Design's meaning of "template" is an open question.

**System:**
- Blank start: `Document` created with `head: 1` and no route pointer — that absence, not a
  stored field, is what "not yet published" means
  ([domain model](domain-model.md#documentversion)).
- From a preset: the preset's tree is cloned and every node id in the subtree is remapped via
  the shared clone utility in `core`. Ids are never regenerated for an existing document, but
  a clone is a new document, so nothing is shared
  ([domain model](domain-model.md#node--flat-while-authoring-nested-once-published)).

**Failure modes:**

| Mode | Consequence |
|---|---|
| Route collides with another `Document`'s route | Nothing rejects it today — `Artifact.route` is never checked against `Document.route`. Collision surfaces later, silently, as one document evicting the other on publish. |
| Route collides with a coded route in the consumer's app | Undetectable by Halyard — it has no visibility into the app's route tree. Next's file-system routing prefers an explicit route over a catch-all, so the authored page is unreachable with no compile error and no publish error. |
| Route needs a pattern, not a literal | Real content needs this — a single entry often serves a whole family of URLs off a prefix or param rule, with the remaining segment read at render. A literal-only route table can't represent that class at all. Open. |
| Layout reference is stale or wrong | `layoutId` is not validated against an existing layout `Document` anywhere in the current design. |

## 2. Compose

**Trigger:** drag a block from the palette, or act on a selected node.

| Action | Mechanics |
|---|---|
| Place | Allocate a new id, write `Node { id, block, props: defaults }`, insert the id into the target slot's ordered array (or root). |
| Reorder | Reindex the id within its slot array. No id changes. |
| Nest into a slot | Same as place, targeting a non-root slot. |
| Duplicate / paste | Clone the subtree, remap every id via the shared clone utility. |
| Delete | Remove the id from its parent's slot array; the orphaned `elements` entry is detected the same way compile detects unreachable nodes. |

**System:** every operation is `elements[id] = …` against the flat `{ root, elements }` shape,
never a deep tree rebuild. Slot legality is a `SlotConstraint` (`allow` / `min` / `max`)
declared once on the block and read by both the compiler and the canvas — the same
declaration greys out an invalid drop target during drag
([API sketch](api.md#slots-articulate-structure)).

**Failure modes:**

| Mode | Consequence |
|---|---|
| `slot.min` violated by a delete | Not blocked in the editor today. Surfaces at publish as a `CompileError` with a node path. |
| `allow` names a typo'd or renamed block | Silently blocks that slot forever — `allow` has no referential integrity against the registry. Reads as an author-facing bug, not a config error. |
| A pasted/cloned subtree creates a cycle | Not reachable through normal drag; possible via direct API writes. The flat shape makes it detectable — a cycle can't flatten into a tree, so compile fails rather than looping. |
| Cross-document composition (copy a node from one open page into another) | Undesigned. The canvas is one iframe over one document at a time ([`studio.md`](studio.md)). |

## 3. Edit props

**Trigger:** select a node; the inspector renders its fields from `ui.order` / `ui.groups` /
`ui.fields`, control chosen by ranked tester
([API sketch](api.md#control-resolution-ranked-testers-not-a-keyed-map)).

**Steps:** the inspector holds local edit state while the author types; on debounce or blur it
commits — `elements[id].props` is written to the draft store — and the canvas, the real app
in an iframe, reloads from the server against that draft.

**System:** the canvas does not live-patch as you type. A true server component's code never
reaches the browser, so client-side prop patching can't work uniformly — the canvas updates
on commit, not continuously. Preview and canvas are the same server-render path, given a
draft version instead of an artifact.

**Failure modes:**

| Mode | Consequence |
|---|---|
| Invalid value against the block's schema | Validated on commit against the field's own sub-schema, and on blur against the whole node — three tiers ([API sketch](api.md#validation-happens-at-three-tiers-not-one)). A draft may still hold invalid values indefinitely: blocking a save mid-edit is hostile, so publish is the gate, not save. |
| A field hidden by a discriminated union keeps a stale value | The value must be dropped at compile, not merely hidden in the editor — so a draft can look wider than what actually publishes. |
| Repeater rows keyed by index | Reordering an array without a stable per-row key re-mounts every row and drops focus. |
| `data: "request"` blocks | Editing props only edits the block's declared parameters — the live-fetched half of its output can't be previewed without a real request round trip. |

## 4. Preview

**Trigger:** "Preview," or a viewport change.

**Steps:** draft preview is a real server render — the studio's preview route is the same
code path as the public catch-all, given a draft document ([`studio.md`](studio.md)).
Viewport switching reads named presets from the consumer's own breakpoints plus free-drag,
which works because the canvas is a true iframe (CSS2 §9.1.1, "at most one viewport per
canvas"). Preview at content extremes generates values from the schema's own bounds
(`z.string().max(80)` → an 80-char and a 1-char value; `z.array(x).max(4)` → 4, 1, and 0 if
optional) and renders that synthetic document through the same path.

**System:** schema work — validation, control resolution, extreme-value generation — happens
at publish and in the studio only. The production render path never parses a schema; it reads
an already-validated artifact.

**Failure modes:**

| Mode | Consequence |
|---|---|
| `data: "request"` block previewed at extremes | Only the static-declared props vary; the fetched half renders real, unrelated live data next to a synthetic extreme — no static-only preview mode exists. |
| Schema shapes `toJSONSchema()` can't represent | bigint, `Date`, branded types, discriminated unions (which emit `oneOf`, not `if/then/else`) — extreme-value generation for these needs the same explicit-control escape hatch editing needs, and it isn't designed for stress-content generation specifically. |
| Consumer doesn't expose its breakpoint config discoverably | Viewport presets have no defined fallback — falls back to inventing sizes, the exact thing this design was meant to avoid. |
| Preview environment unreachable | No client-only degraded mode — the live postMessage path was removed entirely, so preview fails outright rather than degrading. |

## 5. Publish / unpublish / schedule / rollback

**Trigger:** publish, unpublish, rollback, or (see below) schedule.

**Steps:** `compile(documentVersion, catalog)` → on success, `store.write(artifact)` →
`store.publish(route, hash)` swaps that route's pointer, one atomic record
([domain model](domain-model.md#compile-and-publish)). Unpublish is
`store.unpublish(route)` — the artifact is untouched, so republish and rollback are both
pointer moves, never a recompile.

**Schedule is not modeled.** There is no `scheduledAt` field, no job runner among the
adapters, and `store.publish()` is synchronous. Open — but the artifact model makes it
unusually safe if added, since the artifact is compiled and validated before the schedule is
set, so firing cannot fail on a surprise validation error.

**Failure modes:**

| Mode | Consequence |
|---|---|
| Compile fails | `CompileError { issues: [{ nodeId, path, code, message }] }`; the document stays on its previous artifact. |
| Rollback target no longer validates against the current registry | Rollback is a pointer move with no recompile, so frozen props from an older block version could feed a changed component. **Resolved:** `checkRollback` compares the artifact's `registryFingerprint` and `blockVersions` against the live registry before the swap, and either rejects or recompiles the historical version through the `migrate` chain. |
| A live artifact's block is deleted from the registry | A static block is inert — its data is frozen into the resolved tree, no lookup at render. A request-mode field is not: it needs the registry at request time, so deletion breaks the live page with no republish involved. **Resolved:** the CI guardrail is a required, failing check, and deletion is treated as an incompatible version bump. |
| Route ownership | Unpublish a route, let another `Document` claim it, republish the first — the second is silently evicted. A uniqueness constraint on route → documentId is required and not yet implemented. |
| Concurrent publishes | **Resolved:** route pointers are independently-writable records, one per route, so two publishes to different routes cannot interfere. |
| `Document.publishedVersion` disagreeing with what is live | **Resolved:** `publishedVersion` is derived on read from the route pointer rather than stored, so there is no second copy to diverge. |
| Artifact pruning | Rollback depends on the target artifact still existing. Retention must respect a stated rollback window, and `publish()` must reject a missing hash rather than wiring a dead pointer — see [`adapters.md`](../.claude/rules/adapters.md). No policy is set yet. |

## 6. Layouts vs presets

| | Layout | Preset (`kind: "template"`) |
|---|---|---|
| Editing it | Propagates to every page that references it — in principle | Affects nothing already created; no ongoing link after clone |
| Used at | Every render of a page that references it | Once, at page creation (flow 1) |

Preset cloning has no failure mode beyond what any document already has: a preset's stored
prop shapes get validated fresh at the new page's first compile, same as stale content
anywhere else.

**Layout propagation is unresolved.** Artifacts inline fully resolved content and record no
layout dependency at all — publishing an edited layout, as currently specified, changes
nothing already live: every page compiled against the old layout keeps rendering it, silently,
forever, until something explicitly recompiles it. Two candidates, neither chosen:

| Candidate | Mechanism | Cost |
|---|---|---|
| Draft/preview only | A layout edit shows immediately in the studio; a live page's artifact stays frozen until explicitly republished through a bulk-recompile pinned to each page's `publishedVersion` | Some pages may fail the new slot constraints — a partial rollout with no owner |
| Resolved at render | The artifact stores a `layoutHash`, joined at request time | Every live page changes immediately, with no page-level compile gate — the propagation itself is the incident |

Either way, `Artifact` needs to record a layout dependency the way it already records
`blockVersions`, so staleness is at least detectable.

## 7. Collaboration

**Trigger:** a second author opens a document already open elsewhere.

The minimum viable answer is a pessimistic lock per `Document`, explicitly unconfirmed as
sufficient ([#10](https://github.com/effekt/halyard/issues/10)). Nothing below is designed yet —
no lock entity, no lock/unlock call on `ArtifactStore`, no session heartbeat. Minimally it
needs a lock owner, an acquired-at timestamp, and a release condition (explicit close, or a
heartbeat/TTL for a crashed tab). The second author sees the canvas and inspector render
normally, but every commit is refused and an indicator names who holds the document — they
can read and preview, not edit.

**Failure modes:**

| Mode | Consequence |
|---|---|
| Stale lock | First author's tab crashes without releasing. No TTL/heartbeat is specified, so the document can be locked out indefinitely with no defined "break glass" unlock. |
| Granularity | A document-wide lock blocks two authors editing unrelated nodes in the same page (a hero and a footer) even though the flat `{root, elements}` model doesn't require that granularity — node-level locking or per-node merge is deferred, not ruled out. |
| Direct API writes bypass the lock | Nothing gates `elements[id] = …` behind lock ownership — the lock is a studio-UI convention unless a server enforces it, and that enforcement isn't specified. |
| Interacts with layout propagation | Locking the layout document doesn't stop a page depending on it from publishing mid-edit under the render-time-resolution candidate above — the lock's blast radius is one document, the propagation's is every dependent page. |
