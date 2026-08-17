---
paths: ".claude/rules/**"
title: Rule-Writing Guide
summary: Template and requirements for writing a new rule under .claude/rules
status: stable
---

# Writing rules

> **Every rule has `paths:` frontmatter, covers one topic, stays under 150 lines, and traces to a real failure.**

## Template

```markdown
---
paths: "glob/for/relevant/files/**"
---

# Rule Title

> **One-line summary.**

## Why (1–2 sentences, only if non-obvious)

## Rules (with WRONG / CORRECT examples)

## Checklist
- [ ] Actionable verification items
```

## Requirements

### `paths:` frontmatter

Without it the rule loads at session start and burns context on work it doesn't apply to.
The glob should match the files an agent edits when the rule is relevant.

### One topic per file

Split when the `paths:` glob would need two unrelated patterns, or the file passes 150
lines. `single-concern.md` and `source-layout.md` are close cousins and still separate —
one is about what a file contains, the other about what a function does.

### A rule earns its place by preventing something

State the failure it prevents. A rule that only expresses a preference is noise an agent
has to read on every matching edit.

### Say what the tooling already covers

If a gate enforces part of the rule, name the gate. If nothing does — as with
`single-concern.md` — say that explicitly, because it tells the reader the rule is the
only thing standing between them and the mistake.

## Gates

`check-rules.mjs` enforces this file against every rule: frontmatter keys, a non-empty `paths`
glob, the 150-line cap, a closing checklist, and that each rule declares its own gate status.
That last one exists because six rules said nothing at all, and a rule that never says whether
it is enforced reads as enforced. **Gate:** none for whether a rule traces to a real failure —
no check can tell a rule earned by an incident from one written on a hunch.

## Checklist

- [ ] `paths:` frontmatter present and scoped
- [ ] One topic
- [ ] Under 150 lines
- [ ] WRONG / CORRECT examples, not prose alone
- [ ] Names the gate that enforces it, or states that none does
- [ ] Ends with a checklist
