---
paths: "scripts/**, .dependency-cruiser.cjs, biome.jsonc, knip.jsonc, lefthook.yml, .github/workflows/**"
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
| the same three scanners | each carried an extension list narrower than its gate-table row claims, so a machine path in an `.svg`, a `.css` or an `.html` sat under a green tick |
| `check-single-export`, `check-schema-depth` | accepted only explicit paths, so `verify` ran both against nothing |
| `check-file-refs` | its five roots omitted `apps/` and `examples/`, so a code span naming a missing file in either was never read |
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

### The check needs checking before its output means anything

A verification that measures the wrong thing, or the right thing at the wrong moment, produces a
confident and specific number. It reads exactly like a correct one. Five in a single session:

| The check said | What was actually wrong |
|---|---|
| `intermediate frames: 15 … FAIL` | the pass condition treated a spring overshoot — 65px settling to 62px — as a failure |
| `ghost misaligned by 153px` | measured after scrolling past, once the exit observer had cleared the state. A CSS fix was written for an invented cause and changed nothing |
| `PASS — it loops` | asserted the timer had fired, not that anything moved. It fired, the rewind took two frames against an 850ms transition, and nothing visibly replayed |
| `collapses observed: 0` | required two adjacent samples to straddle the drop, which an 850ms transition sampled every 120ms never does |
| four gates unreachable | the walker's `[a-z-]+` cannot match `a11y`, so it could not see a gate that was wired in fine |

Three rules follow. **Assert on the thing, not a proxy** — a class landing, an exit code, a timer
firing are all one remove from what you care about. **Fix the measurement before writing a second
fix**: a change that alters nothing is evidence about the instrument, not the subject. And
**assert on shape rather than an exact figure** where physics is involved, so an overshoot or an
easing curve does not read as a defect.

**Gate:** none — a check that lies passes every gate. This is the judgment `verify` cannot hold.

### A scanner's scope is asked of git, not listed

A gate that enumerates extensions or directories is blind to every file type nobody thought of
when the list was written, and the blindness is silent — the tick over the files it did read is
indistinguishable from a complete one. `scripts/trackedFiles.mjs` asks `git ls-files` for
everything committed plus everything untracked and not ignored, which is exactly the set a
contributor is about to publish; a scanner needing a narrower slice filters that set down
rather than building its own. It throws instead of falling back to a directory walk, because a
fallback nobody exercises is where a gate quietly stops reading anything. **Gate:** none — this
is how a scanner is built, which no gate over the scanner can see.

### Say what the gate cannot catch

Claiming full coverage is how the next gap is missed. `check-installable.mjs` records that it cannot see an unused peer dependency, because the package imports perfectly well — it just drags something along. That sentence is why `check-peer-deps.mjs` exists.

### A tuned threshold is not a waived one

Where a gate fires on something legitimate, tune the scope and record the reason — do not raise the threshold to accommodate it. A contract suite constructs a fresh store per test deliberately, so `src/testing/` is excluded from duplication; the rest of the corpus stayed at 0.92% against a 1% threshold rather than the threshold moving.

### Have someone else run the check against real inputs

A check is written from a model of how the thing fails, and that model is the same one its
author used to decide what to check. So its misses are exactly the cases the model does not
contain, and they stay invisible to the author no matter how carefully they re-read it. A second
person brings a different model — that is the whole of the mechanism, and why looking harder is
not a substitute.

Reading the design is not enough either. Both defects below were found by running the check
against real inputs and watching what it did, not by reviewing it:

| Proposed check | What running it showed |
|---|---|
| a `PreToolUse` hook matching `Write|Edit|MultiEdit`, to keep the primary worktree clean | files written by an MCP server never meet it — [#211](https://github.com/effekt/nubbin/issues/211) |
| a pattern over gate-table rows, to find rows over-claiming their surface | the only rows stating a surface are ``publint``·``attw`` and `check-plan-files.mjs`, and both state it correctly — so it fires on the honest rows and passes the rest |

Open `AGENTS.md` and grep the table for a scope literal to check the second yourself. Both authors
had argued against this failure in the same breath as proposing it.

So: hand the check to whoever did not design it, and ask them to run it against the corpus it
will meet — the same standard as seeding a gate, one level up.

**Gate:** none — nothing can tell whether the person seeding a check is the person who wrote it.

### Check the artifact, not only the source

A gate reading `src/` cannot see what packing, publishing and installing do. Four defects reached the registry with every source gate green. `check-tarball`, `check-package-metadata` and `check-installable` read the packed manifest, the package directory and the installed package respectively, because those are three different questions.

## Checklist

- [ ] The violation was seeded, the gate failed, and the output is in the commit or PR
- [ ] A clean tree still passes after the change
- [ ] Every form the violation can take was seeded, not just the first one
- [ ] What the gate cannot catch is written down
- [ ] Any exclusion names the reason, and the threshold did not move to accommodate it
- [ ] The check asserts on the thing itself, at a defined moment, not on a proxy for it
- [ ] Someone who did not design the check seeded the violation against it
