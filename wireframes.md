---
title: Studio wireframes
nav_order: 7
---

# Studio wireframes

Panel layout, inspector controls, and key-state specs for the editing screen. Interface
specification for the editing screen. Builds on the canvas architecture settled in
[`04-studio-ui.md`](studio.md) — iframe-as-real-app, commit-on-blur, dnd-kit,
Storybook's manager/preview split. This document specifies the chrome around that canvas:
regions, panels, inspector controls, and named states. Precision over prose; see
[`Not specified here`](#not-specified-here) for what remains genuinely open.

Controls are named `XControl` to match the ranked-tester registry in
[`02-api-sketch.md`](api-sketch.md#control-resolution-ranked-testers-not-a-keyed-map).
Every field-level state below assumes commit-on-blur: typing updates local inspector state
only; the canvas iframe reloads after debounce/blur, never per keystroke.

## 1. Layout regions

| Region | Proportion (1440px reference) | Collapsible | Notes |
|---|---|---|---|
| Toolbar | Full width, 48px | No | Document identity, viewport, preview, publish, undo/redo |
| Sidebar | 280px, left | Yes — icon rail at 48px | Tabbed: **Blocks** / **Outline** |
| Canvas | Fills remaining width | No | Breadcrumb strip (28px) + iframe |
| Inspector | 360px, right | Yes — fully hidden | Reopens on selection |
| Status bar | Full width, 28px | No | Doc status, lock, save state, dev-server connection |

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ≡ Landing Page                 xs sm md ●lg xl 2xl  [1024▾]  Context▾  Preview│
│                                                        Publish▾   ↶  ↷        │
├───────────┬────────────────────────────────────────────────┬────────────────┤
│ Blocks|Out│ Page > MarketingLayout(body) > Hero               100%  ⤢       │
│───────────├────────────────────────────────────────────────┤ Hero           │
│ ▾ Content │                                                 │ ────────────── │
│  ▤ Hero   │                                                 │ Content        │
│  ▤ FAQ    │              CANVAS (iframe)                    │  Headline      │
│  ▤ PostL. │                                                 │  [___________] │
│ ▸ Layout  │                                                 │  Image  [pick] │
│           │                                                 │  CTA           │
│           │                                                 │   Label [____] │
│           │                                                 │   Href  [____] │
│           │                                                 │ Style          │
│           │                                                 │  Tone ○Light   │
│           │                                                 │       ●Dark    │
├───────────┴────────────────────────────────────────────────┴────────────────┤
│ ● Draft · unsaved changes        Locked by you        Dev server connected  │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Narrow widths.** Below 900px: Sidebar and Inspector collapse to overlay drawers, each
triggered by a toolbar icon and dismissed by Escape or an outside click; Canvas takes full
width underneath. Below 600px: the studio renders a static notice — "Halyard works best at
900px or wider" — with the canvas still visible read-only, since the editing surface is
built for a desk, not a phone, and no attempt is made to make drag-and-drop work smaller.

## 2. Panels

| Panel | Purpose | Empty state | Loading state | Error state |
|---|---|---|---|---|
| **Blocks** | Curated palette; only registered blocks are placeable | n/a (never empty — registry always has ≥1 block by construction) | Skeleton rows, 6 placeholders | "Registry failed to load — `{message}`", retry button |
| **Outline** | Flat-indented tree of the document's node graph, mirrors `{root, elements}` | "No blocks yet" + `[Add block]` opening Blocks tab | Skeleton rows matching last known node count | Per-row warning triangle on unresolvable nodes; see [§7.6](#76-broken-registry) |
| **Canvas** | The consumer's real app, server-rendered, in draft mode | Root slot renders with a dashed drop-zone overlay, see [§7.1](#71-empty-page) | Full-frame spinner over last-good frame, "Rendering…" | "Dev server unreachable" banner, `[Retry]`, canvas dims but stays mounted |
| **Inspector** | Edits the selected node's props | "Nothing selected — click a block on the canvas or in Outline" | Skeleton fields matching the target block's field count | Node's block not in registry — see [§7.6](#76-broken-registry) |
| **Status bar** | Document status, lock, save, connection | — | — | — |

## 3. Inspector controls, ordered by typical field-type frequency

A block schema is overwhelmingly scalars and short lists — plain text and a handful of
structured objects, with rich text, media, and slot references appearing on a minority of
fields. The control set below is ordered accordingly, most common first, so the common case
gets the least ceremony:

| Type | Control | Appearance |
|---|---|---|
| `text` | `TextControl` | Single-line input, label above, char counter if `maxLength` set |
| `object` | `FieldsetControl` | Indented nested group, header = field label, recurses per sub-field |
| `list` | `RepeaterControl` | See [§3.1](#31-repeater-list) |
| `url` | `LinkControl` | `TextControl` + link icon, format-checked, `Open ↗` when valid |
| `html` | `RichTextControl` | Bordered box, fixed toolbar (bold/italic/link/list/heading), sanitized on commit |
| `uiBlocks` (slot) | `SlotSummaryControl` | Read-only summary card, edited via canvas — see below |
| `select` | `SelectControl` | Radio group ≤3 options, dropdown otherwise |
| `file` | `LinkControl` (default) | No built-in asset picker ships — see note |
| `boolean` | `ToggleControl` | Switch, label left, on/off |
| everything else | — | Degrades to read-only JSON, Storybook-style, rather than dropping the field |

**`file` has no default picker.** Consistent with "no default token or colour picker" in
`02-api-sketch.md`: a bare URL field is the fallback; a thumbnail/upload picker is a
consumer-registered `ImagePickerControl` via `hintIs("control", "image")`. A raw file field
is uncommon enough in a well-modeled schema that this is deliberate, not an oversight.

**`uiBlocks` is not form-edited.** A slot's children are placed and ordered on the canvas
(§5), so the inspector shows a summary instead of a field: `Body — 3 of 8 blocks · Hero,
FAQ, PostList`, clicking the summary selects the slot's container so drop targets highlight.
If `min` is unmet: `Aside — 0 of 1 · required`, rendered in the invalid state below.

### Field states

| State | Appearance | Applies to |
|---|---|---|
| Default | Neutral border, label above, help text below if hinted | All |
| Focus | 2px focus ring, border colour shifts to accent | All except `SlotSummaryControl` |
| Invalid | Red border, error text below field, red dot on the field's Outline-tree ancestor | All — see [§7.3](#73-invalid-props) |
| Disabled | Dimmed 60%, cursor `not-allowed`, tooltip "Read-only — locked by {name}" | All, during a save-in-flight or a lock held by another author |

Validation runs against the block's Standard Schema on commit (blur/debounce), not on
every keystroke — matching the canvas's own commit timing. A field hidden by a
discriminated-union branch has its value dropped at compile per `02-api-sketch.md` failure
mode 5; the inspector does not show a "field disappeared" transition, it simply stops
rendering the field when the discriminant changes.

### 3.1 Repeater (`list`)

```
 Bullets (3/4)                                          [+ Add bullet]
 ┌──────────────────────────────────────────────────────────────────┐
 │ ⠿ ▸ Fast shipping                                          ⋮  🗑 │
 │ ⠿ ▾ Free returns                                           ⋮  🗑 │
 │      Heading  [Free returns_______________]                      │
 │      Body     [_____________________________]                    │
 │ ⠿ ▸ ⚠ (untitled)                                           ⋮  🗑 │
 └──────────────────────────────────────────────────────────────────┘
```

| Element | Rule |
|---|---|
| Row label | `ui.fields.bullets.rowLabel` field's value; falls back to the item's first `text` field; falls back to `(untitled)` — never "Item N" |
| Row key | A generated id, stable across reorder — index-keying is explicitly excluded (api-sketch failure mode 6) |
| Collapse default | Collapsed if >1 row exists; a single row starts expanded |
| Reorder | Drag handle (⠿), pointer-only within the inspector — this list never crosses the iframe boundary, so it is a plain same-document sortable |
| Reorder, keyboard | Row focused → `Alt+↑` / `Alt+↓`, or the `⋮` menu's "Move up" / "Move down" |
| Add | Disabled + tooltip "Maximum 4 reached" once `max` is hit |
| Remove | 🗑 disabled + tooltip "At least 1 required" once at `min` |
| Row error | Collapsed row shows a red ⚠ before the label if any nested field is invalid |

## 4. Selection and overlay

| State | Visual | Trigger |
|---|---|---|
| Hover | 1px neutral outline + floating tag (block name) at top-left of bounds | Pointer over a `[data-halyard-node]` in the iframe |
| Selected | 2px accent outline + tag + action chip (duplicate, move, delete) | Click, or Enter on an Outline row |
| Ancestor (breadcrumb) | No canvas outline; ancestor is highlighted only in the breadcrumb strip | Hovering a breadcrumb segment |

Overlay geometry is drawn in the **parent document**, not injected into the iframe's DOM —
the bridge posts element bounds keyed by node id; the studio positions absolutely-placed
overlay `div`s using `iframe.getBoundingClientRect()` plus that bounds data. This avoids any
CSS collision with the consumer's real stylesheet.

**Breadcrumb.** Strip above the canvas: `Page > MarketingLayout(body) > Hero > CTA`, each
segment clickable to select that ancestor. Layout and template ancestors render their
`kind` in parentheses since a slot name alone is ambiguous once nested.

**Selecting a parent when children fill it.** Click hit-tests to the deepest node under the
cursor, as in every reviewed builder. To go up: `Escape` selects the immediate parent
(repeatable to the root) — the primary path, since it needs no pointer precision and works
identically for keyboard users. `Option/Alt`-click selects the parent directly at the same
point as a pointer shortcut.

## 5. Drag and drop

| Moment | Where drawn | Detail |
|---|---|---|
| Drag start (palette) | Parent document | Ghost preview (icon + name) follows cursor; palette dims except the dragged item; Outline highlights every slot currently eligible for this block name |
| Drag over a valid slot | **Bridge, inside the iframe** | Slot container gets a highlighted background; an insertion line (horizontal in-flow, vertical in a row/grid slot) tracks the nearest gap between children |
| Drag over an invalid slot | Bridge, inside the iframe | Diagonal-hatch overlay, cursor `not-allowed`, no insertion line |
| Drop rejected | Toast, parent document | `"FAQ is not allowed in the Hero slot"` / `"Aside is full (2/2)"` |
| Reorder within canvas | Bridge, inside the iframe | Same insertion-line mechanic; source and target are both same-origin, so this is a plain dnd-kit sortable, not a cross-document drag |

The bridge — not the parent — draws the in-slot highlight and insertion line, since it has
live layout access and native `dragover` firing there avoids a postMessage round trip per
frame. The parent only ever learns the *result* (`block-dropped`) as in the bridge diagram
in `04-studio-ui.md`.

```
Valid:                              Invalid:
┌── body (2/8) ──────────┐          ┌── aside (2/2, full) ─────┐
│  Hero                  │          │ ░░░░░░░░░░░░░░░░░░░░░░░░ │
│ ┈┈┈┈┈┈┈┈ (insert here) │          │ ░ CtaCard             ░  │
│  FAQ                   │          │ ░ CtaCard             ░  │
│  [ PostList ← dragging]│          │ ░  ⊘ PostList not      ░ │
└─────────────────────────┘          │ ░    allowed here     ░ │
                                     └───────────────────────────┘
```

## 6. Toolbar

| Control | States |
|---|---|
| Viewport switcher | Presets read from the consumer's config (`xs 320 · sm 480 · md 768 · lg 1024 · xl 1280 · 2xl 1440`) as segmented buttons, plus a numeric width field for free-drag; active preset highlighted |
| Context ▾ | `globalTypes` analogue — locale, auth state; separate from block props per `04-studio-ui.md` |
| Preview | Toggles chrome off: palette, Outline, Inspector, and all overlays hide; canvas goes full-bleed with a floating `[Exit preview]`; viewport switcher stays available |
| Publish ▾ | See table below |
| Undo / Redo | Operate on the session's client-side edit history (§ open questions — this does not map 1:1 to `DocumentVersion` numbers) |
| Document status | Pill in the status bar, not the toolbar — kept separate from actions so it reads as state, not a button |

**Publish button:**

| Document state | Label | Enabled | Menu (▾) |
|---|---|---|---|
| Draft, never published, compile-clean | `Publish` | Yes | — |
| Draft, compile errors present | `Publish` | No, red badge with issue count | — |
| Published, draft unchanged since | `Published` (quiet) | — | `View live ↗` · `Unpublish` · `Rollback…` |
| Published, draft has newer edits | `Publish changes` | Yes if compile-clean | same menu |
| Unpublished | `Publish` | Yes | — (republish is a route-pointer move, no recompile) |

**Document status pill:** `Draft` (grey) · `Draft · unsaved changes` (grey + amber dot) ·
`Published` (green) · `Published · unsaved changes` (green + amber dot) · `Unpublished`
(outline). "Unsaved changes" means the working copy has edits not yet appended as a version.

## 7. Key states

### 7.1 Empty page

```
┌───────────────────────────── canvas ─────────────────────────────┐
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐  │
│  ╎              Drag a block here, or  [ Add block ]          ╎  │
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘  │
└────────────────────────────────────────────────────────────────┘
Outline: "No blocks yet"          Inspector: "Nothing selected"
```

### 7.2 Block selected

Hero selected: 2px accent outline + action chip on canvas (§4); breadcrumb reads `Page >
MarketingLayout(body) > Hero`; Inspector populated per the default wireframe in §1;
Outline row for Hero highlighted with the same accent.

### 7.3 Invalid props

```
 Headline
 [Say the thin████████████████████████████] (92/80)
 ⚠ Maximum 80 characters (currently 92)
```
Outline: Hero row carries a red dot. Toolbar: `Publish` disabled, tooltip `"1 error — Hero: Headline"`.

### 7.4 Publish confirmation

```
┌ Publish "Landing Page"? ───────────────────────────────┐
│ Route: /landing                                        │
│ 14 blocks · 3 changed since last publish                │
│ Valid — 0 issues                                        │
│                                                          │
│                          [ Cancel ]   [ Publish ]        │
└──────────────────────────────────────────────────────────┘
```
If never published: body reads `"This page has no live version yet. Publishing makes it
live at /landing."` If invalid, the dialog does not open — the toolbar button is disabled
per §6, and clicking the disabled control focuses the first invalid field instead.

### 7.5 Conflict — locked by another author

```
┌────────────────────────────── canvas ─────────────────────────────┐
│  Another editor has this page open. You can view it, but changes│
│  won't save until they finish.                                     │
│                                            [ View read-only ]      │
└──────────────────────────────────────────────────────────────────┘
```
Accepting collapses the banner; Inspector fields switch to the `Disabled` state (§3),
palette drag is inert, Outline stays browsable. No takeover action is offered — the lock
model itself is an open question upstream (domain model open question 6, tracked in the
project's [open design questions](https://github.com/effekt/halyard/issues/15)), so this
spec does not invent an expiry or force-release affordance.

### 7.6 Broken registry

A node's `block` no longer resolves, or its schema changed incompatibly with no `migrate`
entry for the jump.

```
Outline:  ⚠ OldHero            Canvas:  ┌ Block not found: OldHero ┐
                                          │ (rest of the page renders │
                                          │  normally around it)      │
                                          └────────────────────────────┘
Inspector (OldHero selected):
 "OldHero (v2) is not in the current registry. This node cannot be
  edited until a developer registers a migration or restores the block."
  [ Remove block ]   [ View raw props (JSON) ]
```
`View raw props` is the same read-only-JSON degrade as an unmatched field control — the
node's `props` dumped verbatim, editable only as text, not validated.

## 8. Keyboard and accessibility

The Outline tree — a normal parent-document list, not the iframe — is the primary
non-pointer path, because a keyboard drag that crosses into the iframe may not be
announceable (`04-studio-ui.md`, consequences).

| Action | Keys | Notes |
|---|---|---|
| Move focus between nodes | `↑` / `↓` in Outline | Flattened, indentation-aware order |
| Expand / collapse a slot | `→` / `←` in Outline | |
| Select | `Enter` / `Space` in Outline, or click in canvas | Syncs canvas overlay + loads Inspector |
| Select parent | `Escape` | Repeatable to root; works from canvas or Inspector focus |
| Reorder within a slot | `Alt+↑` / `Alt+↓` on a focused Outline row | Same mechanism as repeater reorder (§3.1) |
| Move to a different slot | `⋮` menu → `Move to…` → searchable list of eligible slots | Slot list is pre-filtered by that slot's `allow` against the block name — this **is** the accessible equivalent of a cross-slot drag, not a fallback |
| Add a block | Focus a slot in Outline → `Blocks` tab → `Enter` on a palette item | Inserts at the end of the focused slot |
| Duplicate / Delete | `Cmd/Ctrl+D` / `Delete` | Delete on a non-empty slot confirms if it would drop below the slot's `min` |
| Publish dialog | `Cmd/Ctrl+Enter` opens; `Enter` confirms; `Escape` cancels | |

**Live region.** A visually-hidden `aria-live="polite"` region in the parent document
announces: selection changes (`"Hero selected, 2 of 8 in Body slot"`), drop results
(`"Bullets: maximum of 4 reached"`), and publish outcomes — per the live-region approach
cited in `04-studio-ui.md`.

**Focus management.** Selecting a node — by click or by Outline `Enter` — moves DOM focus to
the Inspector's first field. Field labels use `for`/`id`; invalid fields set
`aria-invalid="true"` and `aria-describedby` pointing at the error text.

## Not specified here

| Question | Why it's open |
|---|---|
| Undo/redo granularity vs. `DocumentVersion` | The domain model appends a version per edit but defines `rollback` only for published artifact hashes, not for reverting a draft version. This spec assumes a client-side working-copy history with periodic autosave; unconfirmed against a real API. |
| Lock takeover / expiry | Concurrent editing is domain-model open question 6 — "pessimistic lock per document… worth confirming it is enough." §7.5 deliberately offers no override. |
| Draft-time validation surface | `02-api-sketch.md` defines `compile()` errors at publish time. §7.6 assumes an equivalent check can run against an unpublished draft on load; no such entry point is described in the reviewed API sketch. |
| Slot min/max messaging before publish | `SlotSummaryControl`'s invalid state (§3) is designed, not confirmed — no existing hook for reading a live child count outside compile was found. |
