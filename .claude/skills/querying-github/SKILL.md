---
name: querying-github
description: Checks what a gh CLI answer actually covers before acting on it — which set it read, whether a check list is empty, what a PR will really close, and what gh put on the wire. Use when running gh pr, gh issue or gh api; before merging a PR or filing an issue; and whenever a command's output is about to become the evidence that something is done.
---

# Querying GitHub

Every trap below has one shape: **the command answered a narrower question than the one asked,
and the narrow answer is well formed.** No error, no warning, no truncation notice. The check is
never "did it fail" — it is "what did it cover".

Passing an explicit `--state` and `--limit`, and reading an exit code from the command rather
than through a pipe, are assumed. What follows is what those habits do not cover.

## Before merging

| Read | Because |
|---|---|
| `gh pr checks <n>` — every row | A green row above a red one says nothing about the red one. |
| `--json closingIssuesReferences` | It shows what the body will *actually* close, before it closes it. |
| `--json mergeStateStatus` | `DIRTY` means conflicted, and a conflicted PR has no merge ref. |

**An empty check list is a stop, not a pass.** `no checks reported` means the event never fired
and nothing ran, while the PR still shows as mergeable. `gh pr close <n> && gh pr reopen <n>`
fires it — but only when the list is empty. If `mergeStateStatus` is `DIRTY` there is no merge
ref to build, so reopening changes nothing and the checks in hand describe a tree nobody built.
Rebase onto `origin/main` instead.

**Closing references link once and never unlink.** GitHub records the link the first time it sees
`Closes #n` and does not recompute it when the body is edited, so a re-scoped PR's stated scope
and its recorded scope can disagree — and the recorded one wins at merge. Check before merging,
not after; auto-close afterwards is slow and uneven, so an issue still open a second later proves
nothing.

## Trusting a search of the tracker

Pass a limit well above the whole set, so a **full-length result is a warning** rather than a
size. A search that read a fraction of the tracker and one that read all of it otherwise print
the same reassuring nothing.

Then corroborate the count through a different endpoint. The issues list and the search index
disagree when one of them truncated:

```bash
gh issue list --state all --limit 800 --json number --jq 'length'
gh api -X GET search/issues -f q='repo:{owner}/{repo} is:issue' --jq '.total_count'
```

`scripts/scaffold-issue.mjs` does both, refuses when the list came back exactly full, and reads
comments as well as bodies — this repository settles as much in a comment as in an issue body.
The [`issue`](../issue/SKILL.md) skill covers it.

## Seeing what `gh api` put on the wire

`--field` converts `true`, `false`, `null`, integers and `{owner}`/`{repo}` placeholders. **A JSON
array is none of those** and goes over as the literal string `"[\"a\",\"b\"]"`. Use a heredoc into
`--input -`, or repeated `-f 'key[]=value'`.

Rather than remembering which flag does what, make `gh` show you. `--verbose` prints the request
body, and aiming it at a repository that does not exist gets the body without the mutation:

```bash
gh api --verbose --method POST repos/nobody/nothing/issues/1/labels -f 'labels[]=a' 2>&1 | grep -A3 '"labels"'
```

## Two environment facts

**A standalone `jq` may not be installed**, though `gh`'s own `--jq` always is — it is compiled in.
Project at the API boundary with `--jq` rather than piping into `jq`, and use `node -e` if a saved
file needs re-reading.

**A `--jq` projection is invisible in the output it produces**, which is the same property that
makes it useful. Project freely while working; when the output becomes the *evidence* for a claim,
either say what was filtered or re-run it whole. "Nothing else matched" is not supportable from a
result somebody trimmed.

## Checklist

- [ ] Every check row was read, and an empty list was treated as a stop rather than a pass
- [ ] `closingIssuesReferences` was read before the merge, not after
- [ ] A tracker search's size was corroborated against a second endpoint
- [ ] A `gh api` body carrying an array or an object went in on stdin, not through `--field`
- [ ] Any output quoted as evidence is either untrimmed or stated as filtered
