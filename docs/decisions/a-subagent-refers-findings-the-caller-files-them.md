---
title: "A subagent refers findings; the caller files them"
summary: There is no exit hook — a subagent ends its report with its findings and writes nothing
status: stable
---

# A subagent refers findings; the caller files them

The `SubagentStop` hook opened an issue for every finding tagged `[issue]` or `[rule]`. Over one
weekend it opened 174, of which 54 were still unlabelled when anyone counted. Six verifiers
re-derived those 54 against the tree: fifteen held. Thirty-nine were closed, three of them false
at the moment they were written.

## Why the timing alone was fatal

A subagent exits *before* the work that produced it lands. The hook therefore files against a tree
that is a few minutes from changing, and against a tracker whose relevant ticket is a few seconds
from closing. [#420](https://github.com/effekt/nubbin/issues/420) reported work as unfinished 51
seconds before the pull request finishing it merged;
[#399](https://github.com/effekt/nubbin/issues/399) objected to a duplicate that closed 55 seconds
later; [#406](https://github.com/effekt/nubbin/issues/406) restated a comment posted 35 seconds
earlier. None of these was neglect. Each was correct when written and wrong on arrival, and no
amount of searching at exit can see a state that has not happened yet.

The caller does not have this problem. It files after its own work lands, which is the first moment
the finding's subject is stable.

## Why the subagent is also the wrong judge

Materiality needs context a subagent does not hold. It has seen one slice of one task, so it cannot
weigh whether a thing it noticed would hurt anyone — and a finding that hurts nobody still reads as
a defect when written up. That is how a tracker fills with true, checkable, worthless statements:
[#414](https://github.com/effekt/nubbin/issues/414) and
[#415](https://github.com/effekt/nubbin/issues/415) were re-derivations of the roadmap's own
structure, and both were wrong about it. The caller holds the task, the diff and the reason the
subagent was dispatched, so it is the first place where "does this matter" is answerable.

## Decision

There is no `SubagentStop` hook. A subagent ends its report with a `## Findings` section, one
bullet per finding, and writes nothing anywhere. The caller decides what each finding becomes.

## Why the exemption failed

An earlier form of this decision stopped the hook opening issues and left it writing memories,
on the grounds that a memory is local and reversible. It is neither. A memory is written into
the index every later session loads, that index has a size limit, and past the limit entries
stop loading with no error — so the exempted route wrote into shared context, and the failure
mode was silence rather than a conflict anyone could see.

The two arguments above disqualify the subagent as a filer of anything, not as a filer of
issues. Exiting before its own work lands is a fact about *when* a subagent runs. Holding one
slice of one task is a fact about *what it can know*. Neither mentions the tracker.

## What it beat

**Opening the issue anyway and naming the near-duplicate in its body** was the previous answer, and
its argument was real: whether two issues are the same work is a judgement, a run's output scrolls
away, and an issue body does not. It lost on measurement. The search surfaced candidates and was
overridden 174 times; three findings each named the other two as possible duplicates in their own
bodies, and all three were opened
([#380](https://github.com/effekt/nubbin/issues/380),
[#381](https://github.com/effekt/nubbin/issues/381),
[#395](https://github.com/effekt/nubbin/issues/395)). A judgement deferred to whoever reads the
tracker is a judgement nobody makes.

**Keeping the hook for the memory route alone** was rejected. It is the exemption that failed, and
the argument for it — that the write is cheap and undoable — describes the act of writing rather
than what is written to. A cheap write into context every session reads is not cheap.

**Refusing to capture a finding that fails a check** was rejected for the reason the old answer was
right about: a finding a hook discards is a finding nobody reads. The report the caller receives
carries every finding, and the caller is the first place "does this matter" is answerable.

**Referring every finding, including one the search scored,** was rejected. Where a candidate
exists, commenting on it creates nothing, needs no judgement about whether the finding matters, and
lands where the person reading that issue will see it. The referral is for the case the comment
cannot cover: nothing scored, so the only remaining outcome is a new issue.

**Filing to a queue for later triage** was rejected as the same defect with an extra step. The
54 were a queue; a queue whose entries have no close condition is a tracker that grows.
