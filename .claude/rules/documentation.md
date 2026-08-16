---
paths: "docs/**, *.md, .claude/rules/**"
title: Documentation Rules
summary: Which document holds what, and how a decision propagates across all of them
status: stable
---

# Documentation

> **A decision changes prose in every document that describes it, in the same commit. Renames add a row to `docs/superseded.md`.**

## Why

Documentation rots differently from code. A stale sentence compiles, passes every lint, and
reads as authoritative — the only signal is a reader acting on it and being wrong.

This is not hypothetical here. One round of decisions left a top-level document describing a
block-level flag that had moved to field level, another listing three resolved defects as
open, and a superseded name scattered across nine files. Everything was internally plausible.

## Which document holds what

| Document | Holds | Test |
|---|---|---|
| [`docs/decisions.md`](../../docs/decisions.md) | Settled choices and *why* | Would someone re-litigate this? Then it belongs here |
| `docs/design/05-open-questions.md` | Undecided, with the cost of deciding late | Numbered; numbers are stable identifiers cited elsewhere |
| `docs/design/*` | Being settled — allowed to be wrong | Graduates to `decisions.md` when it stops moving |
| `docs/architecture.md` | How the system works now | Never aspirational, never historical |
| `.claude/rules/*` | How to work in the repo | Judgment a gate cannot encode |

A design document that has stopped changing has a job to do: move its conclusion into
`decisions.md` and leave a link. Two documents describing one decision is how they diverge.

## Rules

### A rename adds a superseded row in the same commit

```markdown
<!-- WRONG — the decision lands, eight documents keep the old name, nothing notices -->
The manifest is replaced by per-route pointers.

<!-- CORRECT — plus a row in docs/superseded.md -->
| `manifest entry` | route pointer | One mutable document permitted silent lost updates |
```

Rows are permanent. Knowing what a thing *used to* be called is what makes an old branch or
an old comment legible. **Gate:** `check-superseded.mjs`, on every agent edit and at
pre-commit.

### Mark history, do not delete it

A document explaining what changed has to name the old thing. Put it under a heading
containing **Historical** or **Superseded**, or mark the line `<!-- superseded-ok -->`.
Prefer the heading for a section, the comment for a sentence.

Deleting the reasoning is worse than keeping it — a decision with no recorded alternative
gets re-proposed every six months.

### Sweep the neighbours

The gates catch renamed terms and broken links. They cannot catch a paragraph that is merely
*wrong* now. When a decision changes behaviour, grep for what described the old behaviour and
fix it — a claim that something is "unresolved" or "the only validation point" ages the
moment it stops being true. **Gate:** none. This is the judgment the rest of the tooling
exists to make smaller.

### Links must resolve, including anchors

Relative links and `#anchors` are checked against real headings. An anchor drops the em-dash
and keeps the spaces around it, so `## Node — flat` anchors as `#node--flat` with two
hyphens. **Gate:** `check-docs.mjs`.

### Every document carries frontmatter

```yaml
---
title: Domain Model
summary: Every entity, what owns it, and where it lives across the three layers
status: draft | stable | reference
---
```

`pnpm catalog` renders every document as one line — path, status, summary — which is how an
agent or a new contributor sees what exists without reading it all. The summary is the only
thing a reader sees about a document they have not opened, so it says what the document is
*for*, never restating the title.

**The catalog is derived, never committed.** A checked-in index conflicts on every branch
that adds a file and goes stale between regenerations; frontmatter lives beside the content
it describes, so there is nothing separate to drift. `pnpm map:docs` writes the JSON form
into the gitignored `.repomix/`.

The `docs/design/README.md` table is a separate, hand-written reading order — **gate:**
`check-docs.mjs` verifies every file appears in it; the accuracy of a status line is on you.

### A document that trails what it depends on gets reviewed

If A links to B and B was committed after A was last touched, A described B's subject at a
moment that has since moved. `pnpm stale-docs` flags it.

Freshness comes from `git log`, not a hand-maintained date, so there is nothing to forget
and nothing that can lie. It is deliberately biased toward false positives — a review costs
a minute, a wrong document costs a decision — and runs at **pre-push, not pre-commit**,
because "you may want to re-read this" should not block a commit.

Re-reading and finding it still correct is a valid outcome: touch the file so the edge
resets.

### Evidence, not provenance

Publishable: a measurement, a pattern, a failure mode. Not publishable: whose codebase it
came from. See [the repository section in `AGENTS.md`](../../AGENTS.md). **Gate:**
`check-no-vendor-refs.mjs`.

## Checklist

- [ ] Every document describing the changed behaviour was updated, not just the one that decided it
- [ ] A rename added a row to `docs/superseded.md`
- [ ] Deliberate historical references are marked, not left to trip the gate
- [ ] New links and anchors resolve
- [ ] A new `docs/design/` file is in the index with an honest status
- [ ] A settled decision graduated to `decisions.md` rather than living in two places
