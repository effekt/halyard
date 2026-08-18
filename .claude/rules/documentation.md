---
paths: "docs/**, *.md, .claude/rules/**"
title: Documentation Rules
summary: Which document holds what, and how a decision propagates across all of them
status: stable
---

# Documentation

> **A decision changes prose in every document that describes it, in the same commit. A rename leaves no trace of the old name.**

This rule governs *which document* holds a thing and how a change propagates across all of
them. [`prose.md`](prose.md) governs how the sentence reads once it is there — the four parts
of a recorded decision, and what gets cut.

## Why

Documentation rots differently from code. A stale sentence compiles, passes every lint, and
reads as authoritative — the only signal is a reader acting on it and being wrong.

This is not hypothetical here. One round of decisions left a top-level document describing a
block-level flag that had moved to field level, another listing three resolved defects as
open, and one renamed concept still carrying its old name across nine files. Every one of
them was internally plausible, which is why nothing caught them.

## Which document holds what

| Document | Holds | Test |
|---|---|---|
| [`docs/decisions/`](../../docs/decisions/README.md) | Settled choices and *why* | Would someone re-litigate this? Then it belongs here |
| GitHub issues labelled `design-question` | Undecided, with the cost of deciding late | Discussable, linkable, and closable — a document cannot be any of those |
| `docs/domain-model.md`, `docs/api.md` | The contracts an agent writes code against | Would an implementer need this open beside them? |
| `docs/architecture.md` | How the system works now | Never aspirational, never historical |
| `.claude/rules/*` | How to work in the repo | Judgment a gate cannot encode |

A design document that has stopped changing has a job to do: move its conclusion into
a file under `docs/decisions/` and leave a link. Two documents describing one decision is how they diverge.
**Gate:** `check-prose-dupes.mjs` — twelve matching words is a copy, not coincidence. The budget is zero: a non-zero allowance would silently grow as the corpus duplicates itself, catching whoever next adds prose rather than catching the duplication.

## Rules

### A rename replaces the old name everywhere, and leaves no note

```markdown
<!-- WRONG — a reader now carries two names for one thing, and one of them does not exist -->
Route pointers (formerly manifest entries) resolve a route to an artifact.

<!-- CORRECT — the name that exists, and nothing else -->
Route pointers resolve a route to an artifact.
```

Git holds the old name. A reader does not need it, spends context on it, and cannot tell
whether it still means something. **Gate:** `check-prose.mjs` rejects the phrasings that reach for an old name, and any heading
marking a section as history. <!-- prose-ok -->

**The rejected alternative is not history and stays.** "Route pointers, not one mutable
manifest, because a whole-document read-modify-write permits a silent lost update" is the
*reason* for the decision — it is what stops the manifest being re-proposed. The distinction:
name a rejected design when it explains the current one, never to record that something was
once called something else.

### Future work is an issue, not a paragraph

A paragraph promising something is a promise nobody is tracking, and nobody deletes it when it
stops being true. Issues close; prose does not.

```markdown
<!-- WRONG — no owner, no close condition, and it will outlive its own accuracy -->
Scheduled publishing is not yet implemented. We plan to add it in a future release.

<!-- CORRECT — say what the system does; the intent lives where it can be closed -->
Publishing is synchronous. Scheduling it is [#8](https://github.com/effekt/nubbin/issues/8).
```

**Gate:** `check-prose.mjs` rejects `TODO` and the phrasings that promise unowned future
work. <!-- prose-ok -->

### Never restate what a config enforces

A list in prose beside a list a tool enforces is a copy, and the copy is the one nobody updates. Write "a scope `commitlint.config.mjs` allows", not the scopes.

A count in prose drifts the same way, including a count of this repository's own review hooks written inside the document arguing against counting in prose.

The same holds for a claim about project state. "There is no implementation yet" outlived its truth in the README, the published site and the contributing guide. <!-- prose-ok --> **Correcting one is not correcting it:** grep the repository and the site for the old phrasing. `pnpm stale-docs` cannot help — each of those documents was newer than what it misdescribed. **Gate:** none — `check-prose-dupes.mjs` catches the copy, never the staleness, so a tool cannot flag what only a reader can notice.

### Sweep the neighbours

The gates catch broken links and the phrasings above. They cannot catch a paragraph that is merely
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

The `docs/README.md` table is a separate, hand-written reading order — **gate:**
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

Publishable: a pattern, a failure mode, a thing you now know. Not publishable: whose codebase
taught you it, or a measurement standing in for the reasoning. Anonymising a statistic does
not make it checkable — argue the conclusion from why it holds. See
[the repository section in `AGENTS.md`](../../AGENTS.md). **Gates:** `check-no-vendor-refs.mjs`
and `check-prose.mjs`.

## Checklist

- [ ] Every document describing the changed behaviour was updated, not just the one that decided it
- [ ] A rename left no trace of the old name; future work became an issue, not a sentence
- [ ] New links and anchors resolve
- [ ] A new `docs/` file is in `docs/README.md` with an honest status
- [ ] A settled decision graduated to `docs/decisions/` rather than living in two places
