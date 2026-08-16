---
paths: "packages/store-*/src/**, packages/auth-*/src/**, packages/presence-*/src/**"
title: Adapter Rules
summary: What a storage, presence, or auth adapter is allowed to do, not just import
status: stable
---

# Adapters

> **An adapter is IO and nothing else. If a line in it makes a decision `core` didn't already make, it's in the wrong package.**

[`package-boundaries.md`](package-boundaries.md) governs what an adapter may *import*. This governs what it may *do* — the semantics every storage, presence, or auth implementation preserves regardless of the backend it wraps.

## Rules

### `core` computes, adapters do IO — never the reverse

```ts
// WRONG — the adapter computes its own content hash; a second adapter for the same
// artifact could compute a different one, and nothing would catch the disagreement
async function write(artifact: Omit<Artifact, "hash">) {
  const hash = sha256(JSON.stringify(artifact));
  await fs.writeFile(`artifacts/${hash}.json`, JSON.stringify({ ...artifact, hash }));
}
// CORRECT — core computed the hash; the adapter persists exactly what it's given
async function write(artifact: Artifact) {
  await fs.writeFile(`artifacts/${artifact.hash}.json`, JSON.stringify(artifact));
}
```

This is invariant 5. Content-addressing only works if there is one hashing algorithm, and it has to be the one `core` tests for determinism ([`testing.md`](testing.md#cover-the-failure-modes-not-just-the-happy-path)) — an adapter re-deriving it is a second implementation free to drift. **Gate:** none. `dependency-cruiser` blocks an adapter from importing `core`'s internals, but a self-contained reimplementation like the one above imports nothing and passes clean.

### Route pointers must be independently writable

```ts
// WRONG — one manifest document, read-modify-write; two concurrent publishes read the
// same snapshot and the second silently overwrites the first
async function publish(route: string, hash: string) {
  const manifest = await readManifest();
  manifest.routes[route] = hash;
  await writeManifest(manifest);
}
// CORRECT — each route is its own key; single-key writes are atomic everywhere,
// and manifest() becomes an advisory read over them
async function publish(route: string, hash: string) {
  await writeRoutePointer(route, hash);   // routes/<route>.json, or an equivalent single key
}
```

A whole-manifest read-modify-write is a lost-update bug, and S3 in particular has no conditional read-modify-write without a conditional PUT. **Gate:** none — this is a data-modeling choice inside the adapter, invisible to any structural check.

### Completeness is measured by a swap, not a review

An adapter is complete when it can be replaced by an in-memory implementation of the same interface in tests without changing a caller (`package-boundaries.md`). Enforce that literally: write one contract test suite and run it against both.

```ts
// WRONG — each adapter gets its own hand-written test, so "the same interface" is
// asserted by eye, not by execution
describe("FsArtifactStore", () => { /* ...its own assertions... */ });

// CORRECT — one suite, parameterized over implementations
describe.each([["memory", createMemoryStore], ["fs", createFsStore]])(
  "ArtifactStore: %s", (_name, create) => { /* same assertions, both implementations */ },
);
```

**Gate:** none. `testing.md` requires a colocated test per unit; nothing requires it to be the *same* test as the reference implementation's.

### Adapters don't import each other

Full rule in [`package-boundaries.md`](package-boundaries.md#framework-packages-depend-on-core-never-on-each-other), enforced by `dependency-cruiser` (`pnpm boundaries`). Composition happens through an interface `core` declares — an auth adapter that needs storage takes an `ArtifactStore` as a constructor argument, it never imports `@effekt/nubbin-store-fs` directly.

### Publish rejects a missing hash

```ts
// WRONG — wires the pointer regardless; a typo'd or unwritten hash goes live as a 404
async function publish(route: string, hash: string) {
  await writeRoutePointer(route, hash);
}
// CORRECT — the artifact must already exist before a route can point at it
async function publish(route: string, hash: string) {
  if (!(await read(hash))) throw new Error(`cannot publish: artifact ${hash} not found`);
  await writeRoutePointer(route, hash);
}
```

`publish()` must reject a missing hash rather than wiring a dead pointer. **Gate:** none.

### Double-publish is a safe no-op

Publishing the same hash twice must not error. Content addressing makes this free — the same hash means the same bytes, so a second `write()` for a hash that already exists is redundant, not a conflict.

```ts
// WRONG — treats a re-write as an error, so a retried publish after a timeout fails
async function write(artifact: Artifact) {
  await fs.writeFile(`artifacts/${artifact.hash}.json`, JSON.stringify(artifact), { flag: "wx" });
}
// CORRECT — same hash, same content; writing it again is a no-op
async function write(artifact: Artifact) {
  if (await read(artifact.hash)) return;
  await fs.writeFile(`artifacts/${artifact.hash}.json`, JSON.stringify(artifact));
}
```

Double-publish idempotency holds at the design level — an adapter that throws on a duplicate write reintroduces the bug the design was checked against. **Gate:** none.

### Retention must respect the rollback window

Pruning is the adapter's call — nothing else has an opinion on disk or storage cost — but rollback depends on the target artifact still existing. An artifact inside the stated rollback window must not be pruned even if no route currently points at it.

```ts
// WRONG — prunes anything not in the live manifest; breaks rollback to anything older
// than the most recent publish
const live = new Set(Object.values(manifest.routes));
for (const hash of allArtifacts) if (!live.has(hash)) await remove(hash);

// CORRECT — keeps everything inside the window regardless of current liveness
for (const hash of allArtifacts) if (!isWithinRollbackWindow(hash)) await remove(hash);
```

Retention was scoped only to `DocumentVersion`; pruning artifacts the manifest doesn't reference breaks rollback exactly when it's needed. **Gate:** none — no retention policy exists yet, and nothing enforces one.

### `PresenceAdapter`: polling or SSE by default, realtime is a swap

```ts
// WRONG — the interface assumes a persistent connection; nothing that only supports
// request/response (a polling client, a serverless function) can implement it
interface PresenceAdapter {
  subscribe(documentId: string, onChange: (users: string[]) => void): () => void;
}
// CORRECT — pull-based; polling and SSE both implement this directly, and a realtime
// adapter is an additional implementation, not a requirement the others can't meet
interface PresenceAdapter {
  heartbeat(documentId: string, userId: string): Promise<void>;
  who(documentId: string): Promise<string[]>;
}
```

Presence is scoped to "a heartbeat, no conflict resolution" — most of the felt value for a fraction of the cost — and whether it needs a server at all is still open. The flat `{root, elements}` model also preserved a CRDT sync layer as an *optional* swap rather than a rewrite; `PresenceAdapter` should preserve the same optionality by not requiring a push channel. **Gate:** none.

## Checklist

- [ ] Nothing in the adapter derives a value `core` should have computed and passed in
- [ ] Route (or other pointer) writes are single-key, not a manifest read-modify-write
- [ ] A shared contract test suite runs against this adapter and an in-memory implementation
- [ ] No import of a sibling adapter package; shared behavior goes through a `core` interface
- [ ] `publish()` (or equivalent) checks the target exists before writing a pointer to it
- [ ] Writing an already-stored hash again is a no-op, not an error
- [ ] Retention/GC logic checks a rollback window, not just current manifest liveness
- [ ] `PresenceAdapter` (if implemented) is satisfiable by a polling client, not realtime-only
