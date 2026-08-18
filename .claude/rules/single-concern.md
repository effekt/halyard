---
paths: "packages/**, apps/**"
title: Single Concern Rule
summary: How to spot a function doing two things when no gate would catch it
status: stable
---

# Single concern

> **A function does one thing. Every step it performs incidentally is a concern that belongs in its own file, named, exported, and tested.**

## The canonical violation

```ts
// WRONG — this function has two concerns: formatting a date, and logging
export function logMessage(message: string) {
  const date = new Date();
  const stamp = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  console.log(`${stamp}: ${message}`);
}
```

The date formatting is not part of logging. It is a separate, nameable, reusable,
independently-testable thing that happens to be sitting inside a logger.

```ts
// CORRECT — formatDate.ts
export function formatDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

// CORRECT — logMessage.ts
import { formatDate } from "./formatDate";

export function logMessage(message: string) {
  console.log(`${formatDate(new Date())}: ${message}`);
}
```

Now the audit tooling that needs the same stamp imports `formatDate` instead of
reimplementing it. That is the whole point: **the duplicate never gets written, because
the first copy was already extracted.**

## Why this matters more than it looks

- **Reuse.** An inlined concern is invisible. Nobody greps for a template literal, so the
  second caller writes it again — slightly differently. Now the format has drifted and
  neither copy is authoritative.
- **Testability.** You cannot test the inlined formatter without capturing `console`. The
  extracted one takes a `Date` and returns a string; its edge cases (month rollover,
  zero-padding, timezones) get tested directly instead of never.
- **Change.** A format change touches one file, not every site that inlined it.

## The test to apply

**Can you give the step a name?** If you can name it — `formatDate`, `resolveSlot`,
`toArtifactNode`, `isPublishable` — it is a unit, and it goes in `<thatName>.ts`.

Corollaries worth stating:

- A `const` computed inline from an argument is usually an unnamed function. Name it.
- Two lines that appear in two functions were one function all along.
- "It's only used once" is not an argument. It is used once *today*; it is untestable and
  undiscoverable *forever*.
- Extraction is not deferred until the second caller appears. By then the duplicate exists.

## Reuse before you write

Before adding a helper, look for one. The `CATALOG.md` beside each package lists every unit
it holds with a one-line summary — read that before grepping. A near-duplicate with a
different name is the failure mode this rule exists to prevent.

If an existing helper is *almost* right, widen it with a parameter rather than forking it —
unless widening would give it two behaviours, in which case they were two units.

## What the tooling catches, and what it can't

Mechanical, and will block you:

- `noExcessiveLinesPerFunction` — 50 lines. A function over the cap is doing several things.
- `noExcessiveCognitiveComplexity` — 10. Branching depth is concerns in disguise.
- `jscpd` at `minTokens: 15`, 1% threshold — catches the duplicate once it exists.
- `check-single-export.mjs` — counts declarations, including module-private helpers.

None of these catch the example above. It is one declaration, zero private functions,
eight lines, complexity 1 — every gate passes. **This rule is the judgment the gates
cannot encode**, which is why it is written down and why a `PostToolUse` hook reviews for it.

## Gates

`biome` caps complexity at 10, functions at 50 lines and files at 200, and
`check-single-export.mjs` allows one unit per file. Those bound the size of a violation, never
its existence: a function that formats a date inline is one declaration, eight lines and
complexity 1. **Gate:** none for that — a `PostToolUse` reviewer reads for it on every edit,
which is a judgment, not a check.

## Checklist

- [ ] Every nameable step inside the function is its own exported unit
- [ ] Nothing is inlined that a second caller would plausibly want
- [ ] Searched for an existing helper before writing a new one
- [ ] A near-identical helper was widened, not forked
- [ ] Each extracted unit has a sibling test that calls it directly
