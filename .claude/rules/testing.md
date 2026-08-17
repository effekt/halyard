---
paths: "packages/*/src/**, apps/*/src/**"
title: Testing Rules
summary: How every unit ships a colocated test against real schemas, not mocks
status: stable
---

# Testing

> **Every unit ships a colocated test that exercises it directly. Test against real schemas, never mocks of them.**

## Why

The whole product is a validation boundary. A test that mocks the schema layer asserts that
the mock behaves like a mock — it cannot catch the failures that matter here, which are all
shaped like "a real document met a real schema and something surprising happened".

## Rules

### Colocated, one per unit

`compile.ts` has `compile.test.ts` beside it. If a unit has no direct test, either it is
missing or the unit belongs inside its only caller.

### Use real schemas

```ts
// WRONG — asserts the mock, proves nothing about validation
const schema = { "~standard": { validate: vi.fn().mockReturnValue({ value: props }) } };

// CORRECT — a real Standard Schema implementation, exactly as a consumer would write it
const schema = z.object({ title: z.string(), tone: z.enum(["light", "dark"]) });
```

zod is a devDependency for this reason. Adapters are the only place a test double belongs,
and there it is an in-memory implementation of the adapter interface, not a mock.

### Cover the failure modes, not just the happy path

For anything on the compile path, a test is incomplete without:

- an unknown block name
- props that fail validation, asserting the reported path is precise enough to fix
- a nested slot, so tree-walking is exercised at depth
- determinism — the same document compiles to the same hash across runs and across key
  orderings of the same logical input

That last one is load-bearing. Content addressing is what makes artifacts cacheable
forever, so a hash that varies with object key order is a correctness bug, not a nit.

### No unchecked casts in tests

No `as any`, no `as unknown as T`. A test that needs a cast to compile is usually
constructing an invalid value, which is worth asserting on properly instead.

### Assert behaviour, not shape

A test that snapshots an artifact's full JSON fails on every unrelated field addition and
catches nothing. Assert the properties that matter: this route resolves, this hash is
stable, this issue path points at the offending node.

## Gates

`vitest` runs the suite and `check-installable.mjs` proves each package imports from its own
tarball. **Gate:** none for the colocated-test requirement itself — nothing asserts that a unit
has a test beside it, and most units currently do not.
[#96](https://github.com/effekt/nubbin/issues/96) is what closing that would take, and why it is
not simply a coverage threshold.

## Checklist

- [ ] A sibling `*.test.ts` exists and imports the unit directly
- [ ] Schemas in tests are real (zod), not mocked
- [ ] Failure paths covered, not only the happy path
- [ ] Anything hashed has a determinism test
- [ ] No `as any` / `as unknown as`
