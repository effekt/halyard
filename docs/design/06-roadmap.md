---
title: Roadmap
summary: Phasing and dependency order for what ships, and what v1 refuses permanently
status: draft
---

# Roadmap

Phasing for what ships, in what order, and why. Sequence and dependency only — no dates, no
effort estimates. Those don't survive contact with reality; dependency does. One phase is
there specifically to falsify the project's thesis before the expensive phases are built on
top of it, and it's called out as such.

Everything below assumes the settled shape: free and open-source core, self-hosted studio
with an iframe canvas, and the studio / extension / in-site-script split recorded in
[`04-studio-ui.md`](04-studio-ui.md) — the extension and script are optional surfaces on top
of the studio, never a substitute for it.

## v1 refuses, permanently — not deferred

| Refused | Why |
|---|---|
| The 11 data models | They're database rows, not pages  |
| Templates generating many routes from bound state | Stays a coded route — repetition and logic live in components, reviewed as code (invariant 6) |
| Executable content — author JS, CSS blocks, expression/binding strings | Invariant 6: an artifact contains data, never code |

These aren't in the deferred table below because deferred means "later." These mean "never,"
and the distinction matters — a roadmap that quietly implied they might arrive would misstate
the project.

## Phases

| Phase | Ships | Depends on | Proves / de-risks | Stop and reconsider if |
|---|---|---|---|---|
| 1. Core | `defineBlock`, the catalog/registry split, `compile`, artifact types, one Standard Schema adapter (zod as reference). No IO, no React. | Open question 1 (hint placement) resolved | Invariant 2 — `core` stays dependency-free — holds under real introspection needs, not just the sketch in `02` | Introspection can't stay isolated behind one adapter boundary without leaking validator internals into `core` |
| 2. Render path | React renderer, the Next binding (catch-all route, ISR with `dynamicParams`, revalidation on publish), the reference storage adapter. Documents are hand-written fixtures — no draft store, no UI. | Phase 1 | "Publish without deploy" is real in a running Next app; a block's chunk actually splits out of the bundle in the target bundler | `dynamicParams` doesn't resolve an unlisted route the way the design assumes, or per-block code-splitting doesn't materialize — both are load-bearing claims nothing has tested against real content yet |
| 3. Falsify the thesis: migrate 2–3 real pages, no editor | 2–3 real production pages from the content being replaced re-authored as fixtures against real blocks, compiled, published, served through Phase 2's pipeline. Deliberately no studio and no CLI — a developer writes the documents directly against `core`'s types. | Phase 2. Open question 6 decided first — this is the first phase that writes a real, stored `kind` value | The whole thesis — that curated blocks are cheaper than the free-form authoring they replace — tested before a single line of editor code exists. This is the cheapest possible falsification available | Per-page effort runs far past the measured 45–55% bare-element share, or a chosen page can't be expressed without inventing model concepts that don't exist yet (page-scoped state, nested-document overrides) — either means the model needs rework before a studio gets built on top of it |
| 4. Draft store and publish API | `DocumentVersion` create/append, `head`, an autosave slot, independently-writable per-route pointers, unpublish, rollback with a registry check before the pointer moves. | Phase 3 proving the shape holds for real content; open question 2 (dynamic routes) decided — it sets the stored route format this phase locks in | Publish is safe under two concurrent writes; rollback can't silently feed frozen props to a component that has since moved on | The concurrency fix isn't additive to the storage interface Phase 2 already shipped — a breaking change to it this late is expensive |
| 5. CI guardrail: CLI + GitHub Action | A registry-fingerprint check run against every artifact a live route pointer references, wired as a required GitHub Action check. The CLI formalizes the block-scaffold convention used by hand since Phase 3, plus the check command the Action runs. | Phase 4 (fingerprint, pointer read) | A deleted or incompatibly-changed block can no longer reach production silently — **before** anyone but a developer can publish | The check false-positives on non-breaking changes often enough that engineers start merging past it — reproducing the exact advisory-in-practice failure it exists to fix |
| 6. Studio, read-only | Palette rendered from the catalog, the self-hosted same-origin canvas iframe, the preview route, the page list, a selection overlay. | Phase 4; a DOM→node-id mapping mechanism decided | Same-origin framing actually works in a real self-hosted deployment; the preview route stays in parity with the public catch-all | No mapping mechanism exists that avoids both an unenforced per-block contract and a wrapper that would make the iframe's DOM diverge from what a visitor sees — this is a genuinely open problem, not an implementation detail |
| 7. Studio, editing | Drag-and-drop placement across the iframe boundary, the inspector committing on blur, the three validation tiers (field / node / document), live slot-constraint enforcement, publish / unpublish / rollback in the UI. | Phase 6, and Phase 5 shipped — this is where non-developers gain publish rights; layout-propagation behavior decided or explicitly scoped to draft/preview-only before layouts become editable | Cross-iframe pointer handoff — the one gotcha every surveyed page builder solves differently — works reliably enough to ship | Pointer capture doesn't hand off cleanly between the parent and iframe documents; fall back to click-to-place for v1 rather than ship unreliable drag |
| 8. Presence and locking | Presence heartbeat, a lock acquired on node selection, a structural lock on the parent for add / delete / reorder. | Phase 7, for real concurrent authors to test against; open question 10's sub-decisions — lock expiry and takeover — resolved first | Two authors on different blocks in the same page never collide | Lock churn (expiry false positives, a crashed tab locking a document out) costs authors more than the document-level lock it replaces |
| 9. In-site script | The studio bundle served through a gated `<script>`, riding the page's own session and the app's CSP nonce. | Phase 6, for the bundle to embed; the DOM-only contract (the signal element, node-id attributes) proven out in Phase 5 | The DOM-only rule — learn about the page only through the DOM, never a `window` global — holds when the studio shares a document with the app | Same-document access makes that boundary hard to hold in practice; a shortcut here breaks the extension silently, which is why `04` flags it as a boundary rule rather than something to remember |
| 10. Extension | The same studio bundle via a content script, header rewriting for hosts that can't change their own CSP, page creation from the side panel. | Phase 9 proving the DOM-only contract generalizes off the studio's own origin | Host-permission security review; store-review latency against a bundle that otherwise ships continuously | The security review blocks shipping, or store latency drifts the extension far enough behind the studio bundle that "one build, every target" stops being true |
| 11. Docs site | Public documentation for everything above. | Every other phase stable enough to document without rewriting on every release | Nothing technical — the only risk is publishing docs for an API that's still moving | N/A — the one phase that's genuinely safe to delay, which is why it's sequenced last |

## What's deliberately deferred

| Deferred | Reason |
|---|---|
| Multi-locale documents | Zero measured usage in the production corpus; an explicit "not v1" costs nothing now — [`05`](05-open-questions.md#3-localization) |
| Scheduled publishing | Additive. Compile happens before a schedule fires, so a scheduled publish can't fail unattended — [`05`](05-open-questions.md#7-scheduled-publishing) |
| CRDT-based real-time sync | Presence plus a node lock covers most of the felt value; the flat document shape preserves the option for later — [`05`](05-open-questions.md#10-concurrent-editing--lock-at-the-node-not-the-document) |
| Full layout propagation to already-published pages | The propagation mechanism is undecided; ships as draft/preview-only until it is |
| Route-pattern precedence beyond literal and simple param | Open question 2 is still open; literal-only covers landing pages, the actual first use case |
| Page-scoped shared state and nested-document overrides | No model exists for either; push toward server-fetched data rather than design them under deadline |
| Design-tool round trip (Figma / Storybook links on a block) | Additive metadata, zero coupling risk, no reason it should block v1 |
| Stress-content generation for exotic schema shapes (bigint, `Date`, branded types, discriminated unions) | Needs an explicit-control escape hatch that isn't designed yet; scalar and array extremes cover the common case measured in the corpus |

## Open questions that block a phase

The roadmap's real value is this mapping — which unanswered question stops which work.

| # | Question | Status | Blocks |
|---|---|---|---|
| 1 | Where UI hints live | Resolved | Nothing — satisfied before Phase 1 |
| 2 | Dynamic routes | Open | Phase 4, which sets the stored route format. Phase 3 must stick to literal-route pages so it doesn't need this decision early |
| 3 | Localization | Open, but safe to defer | Nothing — explicit "not v1" |
| 5 | Must the studio be same-origin | Resolved by self-hosting; the DOM→node-id mapping mechanism underneath it is not | Phase 6, the first UI-bearing phase |
| 6 | "Template" collides with Atomic Design | Open | Phase 3 — `kind` is a stored enum, and Phase 3 is the first phase to write one for real |
| 7 | Scheduled publishing | Open, low cost to decide late | Nothing — additive |
| 8 | Bundle scaling | Resolved (catalog/registry split) | Nothing — satisfied by Phase 1 |
| 9 | A primitive that lowers the rate of new-block requests | Open, needs measurement the design docs don't have | Nothing directly — informs block-curation judgment in every phase that adds blocks |
| 10 | Concurrent editing granularity | Open — expiry and takeover undecided | Phase 8 |
| 11 | The authoring store has no interface | Open | Phase 4 — it is the phase that would implement one, and every studio flow assumes it exists |
| 12 | Route syntax validation and escaping | Open | Phase 4, alongside question 2 — both settle stored route format together |
| 13 | Model-level questions (layout slot merge, retention, `meta` ownership) | Open, recorded inline in `01` | Phase 7's layout-editing scope |

## Sequencing conflicts found

- **Phase 3 writes a real `kind` value before question 6 is settled.** Renaming a stored enum
  after documents exist is a data migration — cheap at 2–3 rows, but the cost only stays cheap
  if it's decided before Phase 3, not discovered after. As sequenced, nothing forces that
  decision before Phase 3 starts; it should be pulled forward explicitly.
- **Phase 3 can accidentally require Phase 4's work.** Question 2 (dynamic routes) is scoped
  to block Phase 4, but if one of the 2–3 pages chosen for Phase 3 needs pattern routing — a
  a real shape in the content being replaced — Phase 3 cannot
  finish without the route-format decision Phase 4 owns. The mitigation is in the phase table
  (stick to literal routes for Phase 3), but it's a real dependency inversion if that
  constraint isn't honored deliberately.
- **Phase 7 can ship a layout-editing UI that silently does nothing.** Layout propagation is
  unresolved. If Phase 7 exposes layout editing before that's decided or explicitly scoped to
  draft/preview-only, an author can "publish" a layout change that changes nothing already
  live, with no error — the exact silent failure the open question describes. This needs to be
  a gate on Phase 7's scope, not a follow-on fix.
- **The CI guardrail was originally sequenced after presence and locking — resolved by moving
  it to Phase 5.** Its only hard dependency is Phase 4, and the risk it closes — silent
  production breakage from a deleted or incompatibly-changed block — goes live the moment
  non-developers can publish. Under the original ordering, the studio's editing and presence
  phases both ran with that window open, during exactly the period when the most new authors
  arrive. The cost of building it earlier is that there is no real usage to validate the check
  against, which is acceptable because the check is mechanical — compare a stored
  `registryFingerprint` and `blockVersions` against the current registry — rather than
  heuristic. It needs correctness, not calibration.

## Two risks the evidence raises

**The base may be too small to justify the effort.** Roughly 23 real pages exist. The
counter-argument — that only 23 exist *because* each one currently needs a developer, and
removing that bottleneck grows the number — is the project's founding thesis, not evidence for
it. Phase 3 is the first real test of that thesis. Nothing before v1 ships resolves this
either way; entry count after launch is the actual signal, not anything in these documents.

**Per-page cost is higher than the entry count suggests.** Real pages run 45–55% bare layout
elements, so re-authoring one is closer to a rebuild than a conversion, even though there are
few of them. Phase 3 exists specifically to price that honestly before Phases 5 and 6 are
built on top of it — if it comes in high, that's a reason to slow down before the studio gets
built, not after.
