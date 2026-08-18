---
title: Studio
summary: The editor's first vertical slice — parse the demo's catalog, preview its drafts, publish them as artifacts
status: draft
---

# Studio

A Next.js app that does four things end to end, against the demo:

- **Parse** — `/` lists every block in the demo's catalog with the fields `zodAdapter`
  derives from each schema: path, kind, presence, enum members.
- **Preview** — `/preview/<route>` compiles the current draft and renders it through
  `Renderer` with the demo's block registry, so the page on screen is the page the demo
  would serve.
- **Edit** — select a block by clicking it in the preview or picking it from the inspector's
  list, and change its `string`, `number`, `boolean` and `enum` fields; `array`, `object`,
  `union`, `unknown` and `items[]` fields render read-only. A commit — blur for text, change
  for a checkbox or select — writes through `setNodeProp`, recompiles, and refreshes the
  preview; a value the schema refuses is rejected with the compiler's message beside the
  field, and the draft keeps its last good state.
- **Publish** — the preview's Publish button compiles the draft, writes the artifact into
  the demo's store, and moves the route pointer; Download artifact hands back the compiled
  JSON instead, for carrying to any store.

Drafts start as the demo's committed fixtures, and edits live in this process's memory and
nowhere else — a restart returns every draft to its fixture, and a second process never sees
them — because the authoring store is the open design question
[#11](https://github.com/effekt/nubbin/issues/11). The studio
[runs unauthenticated behind whatever gate the deployment provides](../../docs/decisions/the-studio-does-not-own-identity.md).

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
whole binding — store path, draft state, the edit commit, hole resolution — and is what a
consumer would replace to point the studio at their own app.
