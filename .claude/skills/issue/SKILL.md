---
name: issue
description: Open a GitHub issue that carries cause, reason, decision, choice and a close condition, after searching the open set for one that already covers it. Use when filing an issue, writing a ticket, or turning a plan into work.
---

# Open an issue

Two things go wrong when an issue is opened by hand. One already exists and nobody looked, so
the ground is covered twice and neither copy is authoritative. Or it is a plan rather than a
task: no state at which it is finished, so it never closes and accumulates.

`scripts/scaffold-issue.mjs` addresses both, and it is the step that must not be skipped —
reading the tracker in a browser is the check that produced the duplicates.

## 1. Draft to a scratchpad, never to the repository

```bash
pnpm run issue-scaffold --template > /tmp/draft.md
```

A plan-shaped file committed under `docs/` has no close condition either. See
[`planning.md`](../../rules/planning.md).

## 2. Write the four parts and the close condition

| Heading | What goes under it |
|---|---|
| `## Cause` | What forced this — a constraint, a failure, a thing that broke |
| `## Reason` | Why the decision below follows from that cause |
| `## Decision` | What is being done, stated flatly |
| `## Choice` | What it was chosen over, and why the alternative lost |
| `## Done when` | The state at which the issue closes, written so someone else can tell whether it holds |

[`prose.md`](../../rules/prose.md) holds the argument for the first four. **Choice** is the
one that gets dropped, and it is the one that stops the same proposal returning.

A close condition someone else cannot evaluate is not one. "Publishing feels better" cannot
close; "publishing an unchanged document writes no new artifact" can.

## 3. Run the scaffold and read what it found

```bash
pnpm run issue-scaffold --body-file /tmp/draft.md --title "…" --label enhancement
```

It prints the size of the set it searched before anything else. That number is the point: the
underlying `gh issue list` returns its first page and no warning when no limit is passed, so a
search that quietly read half the tracker and one that read all of it print the same
reassurance. The scaffold passes an explicit `--limit`, refuses when the list came back exactly
full, and cross-checks the size against a second count taken through the search index.

Then read the ranked issues. A high score is a question, not a verdict — open each one and
decide. Where the overlap is real, comment on the existing issue instead.

## 4. Open it

```bash
pnpm run issue-scaffold --body-file /tmp/draft.md --title "…" --label enhancement --open
```

Nothing is created until this run passes both the validation and the search. Where a candidate
scored high enough to be labelled, `--acknowledge-duplicates` is how you say you looked at it
and it is a different issue.

## What this cannot check

That the paragraph under `## Reason` is a reason, and that a ranked candidate is genuinely the
same work. Both are yours. The scaffold checks each part is present and carries content, and
puts the nearest open issues in front of you before you can open another.

## Checklist

- [ ] The draft lives in a scratchpad, not in the repository
- [ ] All four parts are present, and each says something
- [ ] The close condition is checkable by someone who did not write it
- [ ] The scaffold ran, and the size of the set it searched was read, not skimmed
- [ ] Every candidate it surfaced was opened and ruled out deliberately
