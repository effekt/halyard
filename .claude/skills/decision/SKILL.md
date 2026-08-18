---
name: decision
description: Records or changes a design decision so it survives — cause, reason, decision, and what it beat — then sweep every document that argued the old position. Use when settling an open question, reversing a prior choice, or writing a file into docs/decisions/.
---

# Record a decision

A decision that is written down but not swept for leaves two readings on the page, both
looking settled. That has happened in this repository more than once — most expensively when
a drag-and-drop library choice was reversed, the section heading was updated, and a comparison
table forty lines below went on arguing the discarded option, while describing the adopted one
as unreleased and experimental.

Work the steps in order. Step 4 is the one that gets skipped, and it is the one that matters.

## 1. Write the four parts

Every recorded decision has all four. Draft them explicitly before writing prose — if any is
blank, the decision is not ready.

| Part | Prompt |
|---|---|
| **Cause** | What forced a decision here? A constraint, a failure, a thing that broke. If nothing forced it, this is a preference, not a decision — say so. |
| **Reason** | Why does this answer follow from that cause? |
| **Decision** | What was chosen, stated flatly and in the present tense. |
| **Choice** | What was it chosen *over*? Name the alternative and why it lost. |

**Choice is the part that stops the same proposal returning.** Without it, the rejected option
comes back in six months and nothing on the page argues against it.

Do not argue any part from a measurement a reader cannot open. See
[`prose.md`](../../rules/prose.md).

## 2. Decide where it goes

| Kind | Home |
|---|---|
| Settled, and someone would re-litigate it | A new file in `docs/decisions/` |
| Still undecided | A GitHub issue labelled `design-question` — it needs a thread that closes |
| How the system works now | `docs/architecture.md`, `docs/domain-model.md`, or `docs/api.md` |
| How to work in the repo | `.claude/rules/` |

One decision lives in exactly one place. If it needs to appear elsewhere, link it — two copies
diverge, and the reader cannot tell which is current.

## 3. Write it

One file per decision: `docs/decisions/<slug>.md`, slugged from the title by the rule
`tests/documentationStructure.test.mjs` applies to headings, with the standard frontmatter and the title as an `# `
heading. The filename is what an inbound link cites, so a title change is a file rename and
step 5 applies.

Present tense, no narrative. State the system, then compress the rejection to its reason.

Never narrate the drafts that came before. <!-- prose-ok --> Write "Y, because Z. X was
rejected: it breaks W."

## 3b. Changing a decision that already has a file

Edit that file. Do not add a second one beside it, and do not narrate the change in the prose
that describes the system — the system is what is true now, and the rejected alternative is what
stops it being re-proposed. Nothing else survives.

**The Choice part changes too.** The new decision beat something different from what the old one
beat, and leaving the old alternative in place argues against a position nobody now holds.

Where the original choice was never recorded, there are two honest options: add the file, or say
nothing. A paragraph describing a change with no decision behind it leaves a reader unable to
tell which reading is current, and no gate can tell them apart.

## 4. Sweep every document that argued the old position

**This is the step that fails.** Do not skip it, and do not trust memory for it.

```bash
# Name the thing that changed, then find everything that describes it.
rg -in '<old term>|<old concept>|<rejected option>' docs .claude README.md AGENTS.md
```

Then read each hit and ask whether it still holds. Check specifically:

- **Comparison tables** — a row arguing the rejected option, or describing the adopted one
  with its pre-decision assessment
- **Diagram labels and API names inside diagrams** — mermaid nodes and edge labels are prose
  and go stale silently; a diagram naming the rejected library's API reintroduces the
  contradiction one level down
- **Any sentence calling something "open", "unresolved", or "the only X"** — these age the
  moment the decision lands
- **Checklists and summary tables** in other files

No gate catches a paragraph that is merely wrong now. `check-prose.mjs` catches the phrasings
that reach for an old name; it cannot tell that a still-current-looking sentence stopped being
true.

## 5. If a name changed, remove the old one entirely

Replace it everywhere and leave no note explaining what it was before. Git holds that, and a
reader carrying two names for one thing cannot tell which is real. A rejected *design* is the
opposite case and stays; [`documentation.md`](../../rules/documentation.md) draws the line.

## 6. Verify

```bash
pnpm exec vitest run --project repo   # links, anchors, index, one claim one home
node scripts/check-prose.mjs --check  # no unciteable claims, no old names, no filler
```

## Before finishing

- [ ] All four parts are present, and Choice names a real alternative
- [ ] A changed decision edited its file rather than gaining a second one, and Choice was
      re-checked against what the new decision actually beat
- [ ] The decision lives in exactly one place; everywhere else links to it
- [ ] Step 4's grep was actually run, and every hit was read
- [ ] Tables, diagram labels, and "still open" phrasing were checked, not just paragraphs
- [ ] A rename left no trace of the old name anywhere
- [ ] Both gates pass
