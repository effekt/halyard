---
paths: "docs/**, *.md, .claude/**"
title: Planning Rules
summary: Where a plan lives, why it is never a committed file, and which surface holds each kind of durable output
status: stable
---

# Planning

> **A plan is an issue. Not a file in this repository — whatever the skill that produced it says.**

## Why

A plan is a description of work not yet done. Committed as a file it has no close condition: nobody deletes it when the work lands, nobody updates it when the work changes shape, and six months later a reader cannot tell whether they are looking at a record of what happened or a proposal that was abandoned. An issue closes. That is the whole argument.

This is the same rule as *future work is an issue, not a paragraph* in [`documentation.md`](documentation.md), applied to the largest instance of it.

## Rules

### A skill's default location does not override this

Skills arrive with their own conventions. `superpowers:writing-plans` instructs its user to save to `docs/superpowers/plans/YYYY-MM-DD-<name>.md`, and says user preference overrides that default. **This file is that preference.**

```
WRONG   docs/superpowers/plans/2026-08-16-phase-1.md
WRONG   docs/plans/core-implementation.md
CORRECT one issue per task, linked from the phase issue, closed as each lands
```

Write the plan wherever is convenient while drafting — a scratchpad is ideal — then transform it into issues and let the draft go. **Gate:** `check-plan-files.mjs` rejects plan-shaped paths under `docs/`.

### One issue per task, carrying the real content

A task issue is executable by someone with no other context. That means the actual failing test, the actual implementation, the exact commands and their expected output — not a summary that a reader has to re-derive.

An issue saying "implement the schema adapter as designed" has moved the work rather than described it.

**Trace every identifier back to a definition before you publish.** A plan that names a test fixture, a type, or a function it never defines forces the implementer to invent one, and two implementers will invent differently. This has already happened here: a Phase 1 plan referenced `validDoc`, `BlockUi` and `RollbackCheck` without defining any of them, and a reviewer reconstructed all three.

### Each surface holds one kind of thing

| Output | Where | Why |
|---|---|---|
| A plan, a task, an open question | A GitHub issue | It closes |
| A settled decision and what it beat | `docs/decisions.md` | It is read while writing code |
| A contract an implementer works against | `docs/` | It changes in the same commit as the code |
| The long-form argument, including paths not taken | The design site | Useful once, rarely twice, and it costs context in a working tree |
| A visual artifact — palette, wireframe, prototype | A published artifact | It is looked at, not read, and a repository renders it badly |

### Reference an artifact rather than restating it

Published artifacts are canonical for what they cover. Restating a palette's hex values in a prompt or a document creates a second copy that drifts, and the copy is always the one missing the reasoning.

| Artifact | Canonical for |
|---|---|
| [Colour system](https://claude.ai/code/artifact/93952615-c490-4fa2-9427-ab6b92cac765) | The palette, measured contrast, the brand-versus-functional split |
| [Studio wireframes](https://claude.ai/code/artifact/eacd89f6-99e5-4e4a-9fb9-08bf3757f213) | The studio's intended regions |
| [Three directions](https://claude.ai/code/artifact/f03b8784-7ef2-403d-b863-8fdda4bbd8e2) | Visual directions considered, and which was rejected |
| [The layout contract](https://claude.ai/code/artifact/0457041e-4057-40ce-b25b-22994c8630d6) | Why a block names intent rather than style |

**A subagent doing design or interface work is given these links.** It cannot see this conversation, so a constraint that lives only in the prompt is a constraint it learns by accident. Link the artifact; do not paraphrase it.

### An agent that edits files gets its own worktree

The main working tree belongs to whoever is driving the session. An agent told to
"work on a branch" works in that tree, and anything the driver does there —
`git reset`, `git checkout`, a merge — destroys the agent's uncommitted edits with no
error on either side.

```bash
# WRONG — the agent shares a tree with the driver and with every other agent
"Work on a branch off main called fix/thing."

# WRONG — outside the repository, where a temp sweep can take uncommitted work with it
git worktree add -b fix/thing /tmp/some-scratchpad/thing-wt main

# CORRECT — inside the repository, in the gitignored `.worktrees/`
git worktree add -b fix/thing .worktrees/thing origin/main
"Work in .worktrees/thing, on branch fix/thing, and nowhere else. Install first."
```

`.worktrees/` is gitignored, so a checkout there is invisible to `git status` in the main tree
while still living on the same disk as the work it belongs to. Branch from `origin/main` rather
than `main`: the local ref may be behind, or checked out by someone else.

This has happened here. An agent was given a branch and no worktree, the driver ran
`git reset --hard` twice in that tree while it worked, and the agent spent time
investigating a hook that did not exist. **A reverted edit and an edit never made look
identical afterwards**, so recovery means re-verifying every earlier change rather than
trusting that it was applied.

An agent that only writes issues, or only writes to a scratchpad, needs no worktree —
it cannot collide. The rule is about agents that edit repository files.

### Audit the ticket before implementing it

A ticket is a claim about work, written before the code existed. Read it against the code that
exists now and report what does not hold **before** writing anything. Every ticket audited so far
has failed this way, and the audit has never once come back empty:

| Ticket | What it said | What was true |
|---|---|---|
| #45 | `(props: Record<string, unknown>)` | admits no real block component; parameters are contravariant (#88) |
| #53 | `blockRegistry.ts`, `registry.ts` | each named after the other type's name (#90) |
| #63 and #53 | the same four paths | different meanings for the same filename (#90) |
| #81 | client blocks render, without live update | the renderer cannot invoke a client reference at all |
| #48 | a `HoleSpec` type, and a regex for its own message | the type does not exist; the regex does not match |
| #55 | `compile(…, blockRegistry, …)` | `compile` wants the compile-side `Registry`; `blockRegistry` has no `fingerprint()` — #90 for the third time |
| #56 | a marker `className` #53 "already gives" `SectionStack` | the component has no `className`, and two other blocks share one literal, so the markers collide |
| #57 | four new dependency-cruiser rules | two already exist under those exact names, and a third bans an import the shipped render path depends on |

None was caught by review. Every one was found by an implementer, and only because they read
before typing. **The naming is where it goes wrong most** — a ticket names a file, a type or a
field, and the name has since moved or was never right.

Report variances as findings, not as a shrug: what the ticket says, what is true, what you did,
and whether the ticket needs editing. A deviation nobody wrote down becomes the next ticket's
premise.

### The agent that plans is not the agent that implements

An agent that designs a solution arrives at implementation already committed to it. It reads the
ticket for confirmation rather than for contradiction, which is exactly the reading that let five
tickets ship wrong. Split the two:

```
agent A   audits the ticket, reads the code, writes the plan, decides nothing
agent B   receives the plan, implements it, and reports where the plan was wrong
```

B is told the plan may be wrong and that saying so is the job. A plan nobody contradicted is a
plan nobody checked. This is the audit step one level up: that one protects an implementer from a
stale ticket, this from a fresh one written by someone who has stopped being able to see it.

**Gate:** none — no check can tell one agent's output from another's. It is a dispatch habit.

### A plan that produced no measurement produced nothing

Where a phase exists to answer a question rather than to ship a feature, the plan says what gets recorded and what result would stop the work. "It felt hard" cannot end a project. A number, or a named structure that turned out to be unrepresentable, can.

## Checklist

- [ ] The plan became issues, and no plan-shaped file was committed
- [ ] Every identifier a task names is defined in that task or an earlier one
- [ ] Each task issue is executable without reading this conversation
- [ ] Design and interface prompts link the artifact rather than restating it
- [ ] A phase that exists to answer a question says what would stop the work
- [ ] The ticket was read against the current code, and every variance is reported
- [ ] A file-editing agent was given a worktree under `.worktrees/`, not a shared tree
- [ ] Where a plan was written by an agent, a different agent implemented it
