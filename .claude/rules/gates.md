---
paths: "scripts/**, .dependency-cruiser.cjs, biome.json, knip.jsonc, lefthook.yml, .github/workflows/**"
title: Gates
summary: How to add or change a gate so it actually catches what it claims
status: stable
---

# Gates

> **A gate you have not watched fail is a gate you have not tested. Seed the violation, watch it exit non-zero, restore, and paste the output.**

## Why

A gate that passes because it scanned zero files reads exactly like one that passed. Nine gates in this repository reported success while checking nothing, and every one was found long after it shipped:

| Gate | What it was actually doing |
|---|---|
| `check-no-vendor-refs.mjs` | `walk()` only handled directories, so top-level files were never scanned |
| its term list | gitignored and absent, so it ran with zero terms |
| three scanners | omitted `examples/` from `SCAN_ROOTS` |
| `check-single-export`, `check-schema-depth` | accepted only explicit paths, so `verify` ran both against nothing |
| `core-imports-no-framework` | matched a resolved `node_modules` path that never occurs, so the rule guarding the central invariant had never fired |
| `publint`, `attw` | installed, documented as gates, wired to nothing |
| `check-skills-lock` | compared names and ignored the content hash it stores |
| `check-docs` inside `verify` | invoked as `pnpm docs`, which the package manager claims — it opened a homepage and exited 0 |

None was carelessness. Each looked right and printed a tick.

## Rules

### Seed the failure, in both directions

```bash
# WRONG — the gate passes, so it works
pnpm boundaries          # ✔ no dependency violations found

# CORRECT — make the violation it exists to catch, and watch it fire
printf 'import { compile } from "../../../../packages/core/src/compile";\n' >> examples/demo/src/blocks/Hero.tsx
pnpm boundaries          # error no-deep-package-imports: examples/demo/… → packages/core/…
git checkout -- examples/demo/src/blocks/Hero.tsx
pnpm boundaries          # ✔ clean again
```

Both directions matter. A gate narrowed to remove a false positive must still fire on the true one, and a gate widened must still pass on a clean tree.

**Gate:** none — this is judgment. The pull request template carries it as a checklist item.

### A clean exit is not a result

`pnpm <name>` reaches your script only while the package manager has no command of that name.
`pnpm docs` opened a package homepage, printed nothing and exited 0, so `verify` skipped the
documentation gate entirely and every local pass was made without it. Use `pnpm run <name>` —
unambiguous whatever the tool adds later. **Gate:** `check-script-invocations.mjs`.

Read the same way anywhere a gate is quiet: a gate that found nothing and a gate that ran
nothing produce identical output. Make it say what it checked — a file count, a rule count, a
package count — so silence becomes visible.

### Seed every form of the thing, not the convenient one

A pattern that catches one spelling and misses another is the failure above wearing a fix.

- A bare specifier and a resolved `node_modules` path are different strings. Where the dependency is not installed in the package under test, only the bare form ever occurs — which is exactly the import the rule exists to reject.
- Node builtins are not matched by a `^node:` path pattern at all. dependency-cruiser classifies them by `dependencyTypes: ["core"]`, and a path pattern silently matches nothing.

### Say what the gate cannot catch

Claiming full coverage is how the next gap is missed. `check-installable.mjs` records that it cannot see an unused peer dependency, because the package imports perfectly well — it just drags something along. That sentence is why `check-peer-deps.mjs` exists.

### A tuned threshold is not a waived one

Where a gate fires on something legitimate, tune the scope and record the reason — do not raise the threshold to accommodate it. A contract suite constructs a fresh store per test deliberately, so `src/testing/` is excluded from duplication; the rest of the corpus stayed at 0.92% against a 1% threshold rather than the threshold moving.

### Check the artifact, not only the source

A gate reading `src/` cannot see what packing, publishing and installing do. Four defects reached the registry with every source gate green. `check-tarball`, `check-package-metadata` and `check-installable` read the packed manifest, the package directory and the installed package respectively, because those are three different questions.

## Checklist

- [ ] The violation was seeded, the gate failed, and the output is in the commit or PR
- [ ] A clean tree still passes after the change
- [ ] Every form the violation can take was seeded, not just the first one
- [ ] What the gate cannot catch is written down
- [ ] Any exclusion names the reason, and the threshold did not move to accommodate it
