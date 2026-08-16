---
paths: "docs/**, *.md, .claude/rules/**"
title: Prose Rules
summary: How a sentence earns its place — the four parts of a recorded decision, and what gets cut
status: stable
---

# Prose

> **Short and specific. A recorded decision names its cause, its reason, the decision, and what the decision beat. Anything that is none of those four is deliberation, and deliberation is not documentation.**

## Why

[`documentation.md`](documentation.md) governs *which document* holds a thing and how a change
propagates. This governs *how the sentence reads* once it is there.

The failure is specific and this repository has had every variant of it. A decision recorded
without the alternative it beat gets re-proposed six months later. A decision reversed in one
section while another section still argues the old position leaves both readings available and
both looking settled. A claim propped up by a measurement no reader can check reads as
authority but cannot be verified, argued with, or reused.

## The four parts

| Part | Answers | Cut it and |
|---|---|---|
| **Cause** | What forced a decision here at all | The reader can't tell whether the constraint still applies |
| **Reason** | Why this answer follows from that cause | The decision reads as taste, so the next person re-decides on theirs |
| **Decision** | What was chosen, stated flatly | The document describes a debate, not a system |
| **Choice** | What it was chosen *over* | The rejected option comes back, and nothing on the page argues against it |

**Choice is the one that gets dropped**, and it is the one that stops the same argument
happening twice.

## Rules

### A decision states what it beat

```markdown
<!-- WRONG — the conclusion with no visible alternative; nothing here survives a re-proposal -->
Editing hints live beside the schema, keyed by field path.

<!-- CORRECT — cause, reason, decision, and the option it beat, in two sentences -->
Editing hints live beside the schema, not inside it. A validator's metadata registry is keyed
by object identity, so a sub-schema shared across five blocks would carry one set of hints
everywhere it is referenced — in-schema hints would force re-wrapping at each use site,
un-sharing exactly what the composition rule mandates sharing.
```

**Gate:** none mechanically; the `PostToolUse` prose reviewer judges it.

### Cite what a reader can check, or argue from why it holds

A measurement from a corpus nobody outside the room can open is not evidence to a reader —
it is an appeal to authority they have no way to test, and it dates the document to one
sample taken once.

```markdown
<!-- WRONG — unfalsifiable, unciteable, and it ages the moment the corpus changes -->
77 of the design system's 122 components expose `className`, so the escape hatch is required.

<!-- CORRECT — the same conclusion, argued from why it is true -->
A design system exposes `className` as a genuine escape hatch on most components — it is what
a consumer reaches for when the system has no token for what they need, so a wrapper that
swallows it breaks real usage.
```

Public sources stay: a named library's documented behaviour, a spec section, a numbered issue
in a public tracker. Those are checkable. **Gate:** `check-prose.mjs`.

### A reversal sweeps every section that argued the old position

The most expensive defect in this repository's history: a library decision was reversed, the
section heading was updated, and the comparison table forty lines below still argued the
superseded choice — describing the adopted library as *"experimental, undocumented and
unreleased"*, which had also stopped being true. Both readings were on the page, both looked
settled.

Changing a decision means grepping for what described the old one and fixing all of it in the
same commit, including tables, diagram labels, and API names inside diagrams. **Gate:** none —
`check-superseded.mjs` catches renamed *terms*, never a paragraph that is merely wrong now.

### State the system, not the path to it

```markdown
<!-- WRONG — the reader has to reconstruct the current design from a narrative -->
An earlier draft proposed mounting the studio inside the consumer's production app. Review
found that unworkable, so the canvas now points at a dev server.

<!-- CORRECT — the design, then the rejection compressed to its reason -->
The canvas points at a purpose-run dev server. Mounting the studio inside the consumer's
production app was rejected: a hardcoded `frame-ancestors 'none'` and an edge proxy owning
the origin each break it independently.
```

### Cut the words that carry nothing

`in order to` → `to`. `it should be noted that` → delete. Also out: *obviously*, *clearly*,
*of course*, *needless to say*, *basically*, *essentially*, *arguably*, *that being said*.

They signal confidence rather than supplying it, and every one of them is a sentence the
author had not finished thinking through. **Gate:** `check-prose.mjs`.

### One sentence, one claim

A sentence past roughly 40 words is usually two claims wearing a coat, and the second one is
where the error hides. Split it. Tables beat paragraphs whenever the content has repeating
shape — most of this repository's documentation is tables for that reason.

## What is not covered here

Two content rules live in [`documentation.md`](documentation.md) and are enforced by the same
gate: a rename leaves no trace of the old name, and future work is an issue rather than a
paragraph. Both are about *what belongs in a document*; this file is about how the sentence
reads once it belongs.

## Escapes

Almost nothing needs one. The real case is a document that must quote a banned phrasing in
order to define it — this file and `documentation.md` do exactly that:

```markdown
The gate rejects "we plan to add". <!-- prose-ok -->
```

Use it to quote, never to keep. A file carrying several escapes is a file arguing with the
rule rather than following it.

## Checklist

- [ ] Every decision on the page names what it was chosen over
- [ ] No claim rests on a measurement a reader cannot open
- [ ] A changed decision was grepped for, and every section arguing the old one was fixed
- [ ] The text describes the system now, not the sequence of drafts that produced it
- [ ] No filler phrases; no sentence carrying two claims
- [ ] Deliberate exceptions carry `<!-- prose-ok -->`
