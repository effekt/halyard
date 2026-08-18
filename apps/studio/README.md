---
title: Studio
summary: The editor's first vertical slice — parse the demo's catalog, preview its drafts, publish them as artifacts
status: draft
---

# Studio

A Next.js app that does three things end to end, against the demo:

- **Parse** — `/` lists every block in the demo's catalog with the fields `zodAdapter`
  derives from each schema: path, kind, presence, enum members.
- **Preview** — `/preview/<route>` compiles a draft and renders it through `Renderer` with
  the demo's block registry, so the page on screen is the page the demo would serve.
- **Publish** — the preview's Publish button compiles the draft, writes the artifact into
  the demo's store, and moves the route pointer; Download artifact hands back the compiled
  JSON instead, for carrying to any store.

Drafts are the demo's committed fixtures; the authoring store is
[#11](https://github.com/effekt/nubbin/issues/11). The studio runs unauthenticated behind
whatever gate the deployment provides
([#85](https://github.com/effekt/nubbin/issues/85)).

## Running it

```bash
pnpm --filter studio dev     # http://localhost:3001
pnpm --filter demo dev       # http://localhost:3000 — serves what the studio publishes
```

Publish a draft in the studio, then load the same route on the demo: the demo answers with
the artifact the studio wrote. A route never published is a real 404 there.

## The seam to the consumer

The studio reaches its catalog, registry, blocks and stylesheet through a workspace
dependency on `demo`, compiled from source via `transpilePackages`. `src/nubbin/` is the
whole binding — store path, draft lookup, hole resolution — and is what a consumer would
replace to point the studio at their own app.
