---
title: Studio
summary: How the self-hosted studio canvas, drag-and-drop, and preview are architected
status: draft
---

# Studio

The editor an author uses. Pulled and run alongside the consumer's app, never hosted by us.

## Self-hosted, iframe canvas

The studio is an application a consumer deploys and runs themselves, alongside their own
storage and CDN. Its canvas is an iframe of their real site in draft mode — not a
re-implementation of it, with selection and drop targets overlaid on top.

**Self-hosting is what makes the iframe unproblematic.** A hosted vendor can't ask every
customer to change their `Content-Security-Policy`, which is why hosted page builders ship a
browser extension that rewrites `X-Frame-Options` and `frame-ancestors`. When the person
deploying the studio also controls the site's headers, that whole class of problem is a
configuration line:

| Studio location | Requires |
|---|---|
| Same origin (`/nubbin`) | `frame-ancestors 'self'` |
| Subdomain (`nubbin.example.com`) | `frame-ancestors https://nubbin.example.com` |
| Headers not under your control | An extension, or the in-site script below |

**Two optional surfaces sit on top,** neither required. An **extension** is the escape hatch
when headers can't be changed, and edits in place on the live page. An **in-site script**
does the same with no install, and is the only path that reaches tablets, where extensions
effectively don't exist. Both learn about the page only through the DOM — a signal element
and `data-nubbin-node` attributes, never a `window` global — which is what lets one studio
bundle serve all three hosts.

## The canvas is a dev server, not staging or production

The canvas points at a purpose-run dev server: the consumer's real app, real components,
real CSS, in development mode with overlays suppressed. Mounting the studio inside the
production app was rejected — a hardcoded `frame-ancestors 'none'` and an edge proxy owning
the origin each break it independently.

| Problem with a production-mounted studio | Why the dev server avoids it |
|---|---|
| `frame-ancestors 'none'` | The dev server sets its own headers; production CSP is untouched. |
| An edge proxy owns most of the origin | The dev server is its own origin, not behind the edge. |
| No lever to exclude the studio from a production build | It never enters one. |
| Draft cookie bleeding into normal browsing | Different origin from the production site. |
| Studio auth grafted onto the consumer's own auth | A dev-server session is a separate, smaller problem. |
| RSC re-render cost per edit | A dev server already refreshes RSC payloads constantly. |

What doesn't change: mapping a rendered element back to a node id, and the cross-document
drag limitations below — both are properties of using an iframe at all. Hosting it is either
a per-session container (full isolation, real per-session cost) or one shared long-running
deploy in dev mode (cheaper, but concurrent editors share a process and HMR is global to it).
Fidelity is good enough either way — dev mode differs in bundling, minification,
double-render, and dev warnings, none of which move layout or styling.

## One render path, one preview mode

Every page renders through the server catch-all, which removes two things at once. **The
two-tier editing experience:** a true server component's code never reaches the browser, so
client-side prop patching only ever worked for client-component blocks — one render path
removes that asymmetry. **Live postMessage preview:** pushing the draft tree into the iframe
for client-side re-render is impossible for a server component for the same reason, and it
converges with the drag adapter, which can't read dragged data during hover, only on drop —
live preview *during* an interaction was never available either way.

**The canvas updates on commit, not continuously.** The inspector holds local state while
typing; the canvas refreshes on debounce or blur — a server round trip per keystroke would
spend renders on states the author is still typing through.
The studio's preview route is the same code path as the public catch-all, given a draft
document instead of a published artifact, and the production path does not parse schemas —
it reads a pre-validated artifact. Schema work happens at publish and in preview only.

## Viewport controls

Named presets plus a free-drag handle default to the consumer's own breakpoints, read from
their config, rather than invented ones. This is the capability that earns the iframe: an
iframe's viewport is its own inner width and height, not the parent document's (CSS2 §9.1.1,
"at most one viewport per canvas"), so media queries evaluate correctly — a same-document
container can't. Viewport is one instance of a broader gap: locale, auth state, and
breakpoint are preview-level state, not component props, and need a home in the studio model
separate from any block's own `Node.props`.

## The block palette

Devs author no separate visual: a block already needs `defaults` so a dropped block doesn't
start with an empty required field, and a block rendered with its defaults *is* its preview —
it can't go stale. A compact list shows icon, name, and description (an optional `icon` on
the block); hover/expand renders the real block server-side from `defaults`, cached, since
the preview path is already a server render — ask it for a single-block document and real
HTML comes back. Avoid hand-authored screenshots, which go stale the moment a component
changes with nothing to catch it; preview at content extremes (the preview flow in
[`authoring-flows.md`](authoring-flows.md)) reuses this same path.

A block may also declare opaque links — `docs: { figma: "…", storybook: "…" }` — rendered as
"Open in Figma" / "Open in Storybook" for the selected block: no coupling, no styling
opinion, the consumer supplies the URLs.

**HMR serves the developer, not the author.** Marketing edits **data** — a draft write plus
an RSC refresh, identical in a production build. HMR only matters when **code** changes,
which is a developer tuning a block — the two cases may warrant different hosts: a dev server
for block development, a cheaper production-mode preview environment for authoring.

## Library decision: dnd-kit

Dragging a block from a palette in the parent document into a drop target inside the iframe
is the hardest technical problem in the studio, and the one no page builder gets for free.

**Pragmatic (`@atlaskit/pragmatic-drag-and-drop`) cannot bridge a same-origin iframe with
pointer events** — see [Why not the alternatives](#why-not-the-alternatives).

**dnd-kit's same-origin frame traversal handles it, and this is the library.**
`@dnd-kit/dom`'s `getDocuments()` recursively walks `iframe`/`frame` elements, catching the
`SecurityError` on cross-origin access to skip them, and `PointerSensor` binds pointer events
on every discovered same-origin document — shipped and changelogged (PR #1517, "Support
dragging across same-origin iframes"), documented, and covered by Playwright. Pointer-based
and same-origin means full drag state is retained throughout — no MIME marshalling, no hover
blind spot, no `dropEffect` sniffing.

A drop still commits like any other edit rather than pushing a tree into the iframe — the
studio writes the change to the draft store and the iframe re-renders from the server, the
same "updates on commit" rule as prop editing. Events that do cross the boundary (selection,
drop, measured bounds) are a typed vocabulary, not ad hoc messages, so the same protocol works
whether the preview is an iframe or an in-page overlay.

### The one real gotcha

**Pointer capture and event delivery don't automatically hand off between the parent document
and the iframe document mid-drag.** This is a genuine, still-partly-open browser issue, and
every builder that has solved cross-iframe drag has solved it deliberately, differently:
Plasmic with pure pointer events and manual zoom-aware rect translation, Makeswift by
forwarding iframe pointer events to the parent over `MessageChannel` and pushing translated
coordinates back for local hit-testing, Puck by portaling into an `srcDoc` iframe and
re-dispatching a custom pointer event, GrapesJS with native HTML5 DnD and a pointer fallback
(the one counter-example, and it predates modern pointer sensors). Coordinate translation by
`iframe.getBoundingClientRect()` is mandatory either way: `elementFromPoint` and rect
coordinates are relative to the document the method runs on, not the parent.

### Why not the alternatives

| Candidate | Why not |
|---|---|
| Pragmatic (`@atlaskit/pragmatic-drag-and-drop`) | Binds the global `document`; can't bridge a same-origin iframe without falling back to native HTML5 `DataTransfer`. |
| Puck | The maintainer has stated it does not support editing an external site — its iframe mode wraps Puck's own render, not an external app. |
| Craft.js | Long gap without commits and a rewrite promised for some time; community reports of broken drop-indicator coordinates inside iframes. |
| GrapesJS | Has rendered its canvas in an iframe since inception and still has an open issue confirming drag-from-outside-into-iframe doesn't work. |
| react-dnd | Gets cross-frame drag for free via the native HTML5 backend, but no recent releases and no keyboard sensor. |
| Makeswift | Commercially proves the iframe-the-real-app thesis, but the studio is proprietary — validation, not a dependency. |

None of these ship a Standard Schema → field UI adapter either, so adopting one wouldn't have
saved the other half of the work — that part is greenfield regardless.

## Consequences to design around

- **Same-origin is likely required** — cross-origin dragging into an iframe is unsolved in
  every library reviewed.
- **Server-component re-render after an edit is unaddressed by every tool reviewed**, since
  none render through a real external server-rendered app. Whether an edit patches props
  client-side or refetches an RSC payload is Nubbin-specific, and on the critical path for
  how live preview feels.
- **Accessibility across a document boundary is untested territory** — a live-region
  announcement and a keyboard/action-menu reorder path alongside pointer drag are worth
  building from the start; a keyboard drag that crosses into an iframe may not be
  announceable otherwise.
- **Framework-version independence matters** — no React peer dependency suits a tool that
  must not constrain its consumer's React version.
