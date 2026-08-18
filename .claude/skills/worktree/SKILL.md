---
name: worktree
description: Create an isolated worktree that can run this repository's gates, before editing anything. Use when starting a change, dispatching a file-editing agent, or when check-worktree.mjs refuses an edit.
---

# Work in a worktree

The primary checkout is shared. Anything left uncommitted there is read by every other session as
though it were committed, and a `git reset` or `git checkout` by whoever is driving destroys an
agent's uncommitted edits with no error on either side.

`scripts/check-worktree.mjs` refuses edits outside a usable worktree. This is how to get one.

## Create it

```bash
git worktree add -b <branch> .worktrees/<name> origin/main && \
  cd .worktrees/<name> && pnpm install
```

Three parts, each load-bearing:

| Part | Why |
|---|---|
| `.worktrees/<name>` | Gitignored, and on the same disk as the work. A path under `/tmp` is swept with uncommitted work still in it |
| `origin/main` | The local `main` may be behind, or checked out by another worktree |
| `pnpm install` | Chained, never separate — see below |

## The install is not optional

Git hooks live in the common directory, so a fresh worktree inherits `pre-commit`, `commit-msg`
and `pre-push`, and they fire. They invoke `pnpm exec lefthook`, which resolves from the
worktree's own `node_modules`. Without it the commit aborts with:

```
ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL  Command "lefthook" not found
```

Nothing unchecked lands, because the commit is blocked. But the message names no gate and no fix,
and the reflex it invites is `--no-verify` — the one response that turns a fail-closed crash into
a silent bypass. Install instead.

## Confirm before editing

```bash
node scripts/check-worktree.mjs
# ✅ Worktree usable — linked worktree <name>, lefthook installed.
```

Then watch a gate reject something, rather than assuming the install fixed them. Append a range
specifier to a manifest, which `check-pinned-deps.mjs` refuses, stage it, and watch the commit be
turned away:

```bash
git add package.json && git commit -m "test(repo): seeded violation"
# ❌ pinned-deps rejects the range; the commit does not land
git checkout -- package.json
```

A worktree whose gates have never been seen to fail is a worktree trusting them on their word.

## A new file under `.claude/skills/` needs an allowlist

`.gitignore` carries `/.claude/skills/*` and one negation per repository-local skill. A skill
added without its `!` line is silently untracked: `git add -A` stages nothing and reports nothing,
and the commit lands without it. This file was lost that way once, leaving
`check-worktree.mjs` telling agents to use a skill that was not there.

## Dispatching an agent

An agent that edits files gets its own worktree, named for its task, and is told to work there and
nowhere else. Its first instruction is the install, because every tool in the tree fails
confusingly until it has run.

An agent that only reads, or only writes to a scratchpad, needs none — it cannot collide.

## When finished

```bash
git worktree remove .worktrees/<name>   # --force if it holds untracked build output
git branch -D <branch>                  # only once the work has landed
```

`git worktree remove` refuses while a branch is checked out elsewhere, which is why
`gh pr merge --delete-branch` reports a failure to delete the local branch and merges anyway.

## Checklist

- [ ] The worktree is under `.worktrees/`, branched from `origin/main`
- [ ] `pnpm install` ran in the same command, not afterwards
- [ ] `node scripts/check-worktree.mjs` passes
- [ ] A seeded violation was watched to fail before trusting the hooks
- [ ] A new skill directory was allowlisted in `.gitignore`, and `git status` confirms it is tracked
