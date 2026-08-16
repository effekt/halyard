---
title: Design Docs Index
summary: Index of design-phase documents, their status, and the order to read them
status: reference
---

# Design

Working documents for the design phase. These are worked out before implementation, and
they are allowed to be wrong — an open question stated here is cheaper than a decision made
silently by whoever writes the code first.

`docs/decisions.md` holds what is **settled**. These documents hold what is being settled.
When something here stops moving, it graduates there and this file records the move.

| Document | Covers | Status |
|---|---|---|
| [`01-domain-model.md`](01-domain-model.md) | Entities and their relationships | Draft — model settled through adversarial review |
| [`02-api-sketch.md`](02-api-sketch.md) | `defineBlock` → `compile` → render, in pseudocode | Draft — catalog/registry split, ranked-tester controls |
| [`03-authoring-flows.md`](03-authoring-flows.md) | What an author does, step by step | Draft — 7 flows written, several depend on unresolved questions |
| [`04-studio-ui.md`](04-studio-ui.md) | Panels, canvas, prop inspector | Draft — canvas settled, panel wireframes in `08` |
| [`05-open-questions.md`](05-open-questions.md) | Undecided, with the cost of deciding late | Active — several open, each mapped to the phase it blocks |
| [`06-roadmap.md`](06-roadmap.md) | Phasing, and what is deliberately deferred | Draft — 11 phases, with sequencing conflicts noted |
| [`07-layout-contract.md`](07-layout-contract.md) | How authors adjust spacing without breaking the design system | Draft |
| [`08-studio-wireframes.md`](08-studio-wireframes.md) | Panel layout, inspector controls, key-state wireframes | Draft |

## Order

`01` and `02` come first and everything else is downstream of them. The studio is a UI over
these types; the adapters are implementations of them. Getting the types wrong is the only
mistake here that forces a rewrite rather than a refactor.

## Diagrams

Plain mermaid, in fenced blocks. Both surfaces that matter — repo markdown and a published
HTML page — render it natively with no runtime network access, so one source works in both.

| Need | Type |
|---|---|
| Entities, cardinality, keys | `erDiagram` |
| Compile / publish pipeline | `flowchart LR` |
| Publication lifecycle | `stateDiagram-v2` |
| Interfaces with methods | `classDiagram` |

Avoid anything that fetches at render time: `zenuml`, `architecture-beta`, icon packs,
`registerExternalDiagrams`, and web fonts that aren't already on the page. Inline theming
works via a `%%{init: …}%%` directive on the first line, but only the `base` theme honours
the full `themeVariables` set.

`beautiful-mermaid` was evaluated and set aside: it is a clean-room reimplementation with
its own API, so it cannot hook the native fence rendering either surface already provides.
It is worth revisiting only as a build-time SVG pre-renderer, if the default styling
becomes a problem.

## Research that shaped these documents

Four questions were open when the design started; all four are answered, and each changed
an API shape.

| Question | Outcome |
|---|---|
| **Canvas** — adopt a drag-and-drop editor or build one | Build, on `dnd-kit`. No existing page builder supports dragging into a canvas it does not itself render — see [`04`](04-studio-ui.md). |
| **Schema → controls** — where editing hints live | A parallel `ui` structure keyed by field path. Zod's metadata registry is identity-keyed, which is incompatible with the shared sub-schemas the rules require — see [`05`](05-open-questions.md#1-where-do-ui-hints-live). |
| **Constrained layout** — how authors adjust spacing | Layout is ordinary props, resolved by the consumer's own design system. Halyard ships no CSS — see [`07`](07-layout-contract.md). |
| **Diagrams** — how to render entity relationships | Plain mermaid, in fenced blocks; see above. |

What remains open is in [`05-open-questions.md`](05-open-questions.md), which also maps each
question to the roadmap phase it blocks.
