---
paths: ".claude/**, scripts/hook-*.mjs"
title: Subagent Findings
summary: How a report's findings are tagged, where each tag routes at exit, and when a memory is deleted
status: stable
---

# Subagent findings

> **A finding leaves a subagent only in its final report. Tag it and the `SubagentStop` hook routes it; leave it untagged and it goes nowhere.**

## Why

A subagent has no memory directory and does not edit `.claude/rules/`. While the caller was the
only route, a finding survived exactly as long as someone remembered to promote it before merging
the pull request — and the reports that reached an issue did so because a human asked whether
findings were being captured at all.

## The report ends with a tagged Findings section

```markdown
## Findings

- [rule] A gate invoked as `pnpm <name>` resolves to the package manager's own command.
  A continuation line stays with the finding above it.
- [issue] The routing table does not say which label a captured finding's issue carries.
- [memory] A fresh worktree has no `node_modules`, so biome reports "not found" rather than clean.
- [task-local] The fixture needed a trailing newline before the parser accepted it.
```

```markdown
WRONG   - The gate passed because it scanned nothing.
CORRECT - [rule] The gate passed because it scanned nothing.
```

An untagged bullet, or one carrying a tag outside the four, is reported as `UNROUTED` and written
nowhere. That is louder than dropping it and cheaper than guessing which surface was meant.

## Where each tag routes

This is [`planning.md`](planning.md)'s surface table applied to a report, so the reasoning for each
home lives there rather than twice.

| Tag | Home | What `scripts/hook-capture-findings.mjs` does |
|---|---|---|
| `[rule]` | `.claude/rules/`, plus a gate | Opens an issue through the scaffold, or comments on the issue the search scored. A hook can write prose but not a gate, and a rule shipped without one is the failure [`gates.md`](gates.md) catalogues |
| `[issue]` | A GitHub issue | Opens it through the scaffold, or comments on the issue the search scored |
| `[memory]` | The session's memory directory | Writes the memory beside the others and adds it to `MEMORY.md` |
| `[task-local]` | Nowhere | Drops it, and says that it dropped it |

The memory directory is derived from the hook payload's `transcript_path`, which is where the
session already keeps its memory — a path written into the hook would be right until the
repository moved, and wrong silently afterwards.

## Every arrival goes through the front door

An issue is opened by `scripts/scaffold-issue.mjs` whether a person opens it or the hook does, so
one duplicate search covers every arrival. A tracker with a front door and a second way in fills
through the second one, and nothing about that reads as wrong from either side.

A captured finding is one sentence, so the hook runs the scaffold with `--advisory-validation`:
the four parts a sentence cannot carry are reported as warnings instead of refusing the finding.
The search is not softened alongside them — it runs above the check that is, so nothing reaches an
open unsearched.

**Where the search scores a candidate, the finding is commented onto that issue instead of filed.**
`--acknowledge-duplicates` states that a person read the candidate and judged the work different,
and a hook reads nothing; passing it made every capture assert a judgement nobody had made. The
finding still lands where whoever reads that issue will see it, which is the property that matters
— this hook's `systemMessage` reaches no transcript and no log, so a finding held in a report alone
is a finding gone. Rejected: filing anyway with the candidate's number in the body, which is what
this did until the tracker had filled with pairs nobody could tell apart; and holding it in the
report, which loses it outright.

It passes no label. The hook knows which tag a report used and nothing about the surfaces this
repository labels by, and a wrong label reads as a decision someone made.

## It says what it saw

```
subagent capture: saw a 17 line(s) report from a `builder` subagent
captured 4 finding(s): 1 -> rule, 1 -> issue, 1 -> memory, 1 -> dropped (task-local)
  issue (Searched 57 open issues in effekt/nubbin (--limit 200; corroborated by search/issues: 57); https://github.com/effekt/nubbin/issues/300)
  rule (Searched 57 open issues in effekt/nubbin (--limit 200; corroborated by search/issues: 57); not filed — commented on #212)
```

A capture that quietly captures nothing reads exactly like one with nothing to capture, which is
the failure [`gates.md`](gates.md) exists to stop. So a report with no findings says so, a report
that never arrived says that instead, and every routed finding prints the size of the set searched
and the issue URL, or the file it became. A search that could not run prints `NO DUPLICATE SEARCH
RAN` and no URL, which is the one thing a capture must not be able to hide.

**Gate:** none — nothing can tell a finding written as a paragraph from ordinary prose, so a
report that buries its findings outside the section is captured as zero. The hook reports the
section it read and the bullets it could not route, which is what makes that visible.

## A memory is deleted when it becomes a repo rule

Two homes for one fact drift, and the copy that rots is the one nobody is enforcing. A memory
holds what generalises past this repository or describes how an agent fails; the moment its
content is a rule here, the rule is the home and the memory goes.

The hook prints the memory directory's file and line counts at every subagent exit, with the
memories whose content is already stated in `.claude/rules/` — measured as the share of a
memory's four-word sequences that appear in the rules corpus. That is overlap of wording, not of
meaning: it finds a restatement, and it cannot see a memory that says the same thing in different
words.

**Gate:** none — a memory directory lives outside every checkout, so a runner has nothing to
compare, and a gate there would take the same "nothing to compare" path that made
`check-skills-lock.mjs` local-only. Reporting the numbers on every exit puts them in front of the
one person who can act on them.

## Checklist

- [ ] The report ends with `## Findings`, and every bullet in it carries one of the four tags
- [ ] A finding true only of this task is tagged `[task-local]` rather than left out
- [ ] The capture summary was read, not skipped — an `UNROUTED` line means a finding was lost
- [ ] A memory whose content has become a rule in this repository was deleted
