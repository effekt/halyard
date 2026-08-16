---
paths: "packages/**"
title: Package Boundary Rules
summary: What core may depend on and how adapters plug in without coupling to it
status: stable
---

# Package boundaries

> **`core` computes and depends on nothing. Adapters do IO. Consumers replace adapters, never `core`.**

## Why

The pitch is "bring your own integration". That is only true if the contract package is
genuinely portable — the moment `core` imports React, Next, or `node:fs`, it stops running
in the places it needs to run (a browser-side studio validating a draft, a worker compiling
an artifact, a CI step checking published content against a changed schema).

## Rules

### `core` imports nothing but Standard Schema

```ts
// WRONG — core is now unusable in a browser and coupled to a framework
import { readFile } from "node:fs/promises";
import type { ReactNode } from "react";

// CORRECT — the caller supplies the value; core only computes over it
export async function compile(document: Document, catalog: Catalog): Promise<Artifact>
```

Component types reach `core` as a generic parameter, never as an import. That keeps
`defineBlock` type-safe in React without `core` knowing React exists.

### IO lives behind an adapter interface

Storage, auth, and asset handling are interfaces declared in `core` and implemented in an
adapter package. `core` never calls one; it returns a value the caller persists.

```ts
// CORRECT — the contract lives in core, the implementation does not
export interface ArtifactStore {
  read(hash: string): Promise<Artifact | null>;
  write(artifact: Artifact): Promise<void>;
  manifest(): Promise<Manifest>;
  publish(route: string, hash: string): Promise<void>;
}
```

An adapter is complete when it can be swapped for an in-memory implementation in tests
without changing a caller.

### Framework packages depend on `core`, never on each other

`@effekt/halyard-react` and `@effekt/halyard-next` both depend on `@effekt/halyard`.
`next` may depend on `react`. Nothing depends upward, and no adapter depends on another
adapter.

### React and Next are peer dependencies

A consumer brings their own. Declare them in `peerDependencies` and `devDependencies`,
never `dependencies` — bundling a second React copy breaks hooks in ways that surface as
unrelated runtime errors.

### The published surface is the `exports` map

No deep imports. If a consumer needs something, export it from `src/index.ts`; if it
shouldn't be public, it shouldn't be reachable. Deep-import paths become a de-facto API
that semver can't protect.

## Checklist

- [ ] `packages/core/src/**` imports only `@standard-schema/spec` and its own modules
- [ ] New IO is an interface in `core` plus an implementation in an adapter package
- [ ] `react` / `react-dom` / `next` appear in `peerDependencies`, not `dependencies`
- [ ] Anything a consumer needs is exported from the package's `src/index.ts`
- [ ] No package imports a sibling adapter
