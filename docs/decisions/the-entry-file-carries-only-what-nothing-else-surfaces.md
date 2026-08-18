---
title: "The entry file carries only what nothing else surfaces"
summary: Orientation stays in AGENTS.md, reference moves to docs/, and what each of the three alternatives lost on
status: stable
---

# The entry file carries only what nothing else surfaces

`AGENTS.md` is read whole when a session opens, again on every subagent dispatch, and remains in
every request afterwards. It had grown to hold a row for each quality gate, a standard consulted
only while writing prose, and four passages that condensed rules arguing the same ground at
length. None of that is needed to begin work, and all of it was paid for on every turn.

Three loading mechanisms already exist, and each fires without being told to. A rule under
`.claude/rules/` arrives when an edited path matches its `paths` glob. A skill's description is
present from the first request, and the body follows once the description fits the task. Naming
either in the entry file produces a second register that no mechanism keeps true, so the entry
file names neither.

What it does carry is everything with no mechanism behind it: the identity of the project, the
invariants, the commands, the two pages under `docs/` that nothing announces, the four agents —
which have neither a glob nor a description anything scans — and the form a subagent's report
must take, whose rule is scoped to a directory that writing a report never touches.

Reference material moves to `docs/`. It is tracked, present in every clone, indexed,
link-checked, and published.

## What that beat

**A `gates` skill.** A script once read the gate table to hold it and `pnpm verify` in
agreement. Repo-owned skills are becoming ignored by git and installed from elsewhere, and a file
a script depends on is then absent from any checkout where the install has not run. The script
finds nothing, reports agreement, and the reassurance is indistinguishable from a real one.

**A `.claude/reference/` directory.** It is reachable only through whatever happens to link to
it, so it earns none of the automatic loading that makes a rule or a skill worth separating out.

**Folding it into `.claude/rules/`.** `tests/ruleFiles.test.mjs` requires `paths` frontmatter, a ceiling
of 150 lines, and a closing checklist. A table enumerating gates satisfies none of those, and
forcing the shape onto it would describe reference material as judgment a reviewer applies.

**Leaving it where it was.** An always-loaded block competes with the conversation for the
model's attention, and instruction adherence falls away as it grows; Anthropic's guidance for
Claude Code puts the ceiling at 200 lines and names skills and path-scoped rules as the two
destinations for what exceeds it.

## What is not settled here

Gates do not read `.claude/`. Where that content is checked, and whether repo-owned skills are
tracked or installed, is open — which is itself the reason a file with a machine consumer stays
in `docs/` rather than moving beside the rules it describes.
