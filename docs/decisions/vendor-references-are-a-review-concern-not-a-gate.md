---
title: "Vendor references are a review concern, not a gate"
summary: The reference scanner and its private term list are removed; review holds the public-repository standard
status: stable
---

# Vendor references are a review concern, not a gate

A scanner enforced the public-repository standard from a term list that is gitignored by
design, so the list existed in exactly one checkout on one machine. It could not run in CI,
and it could not run in a linked worktree
([#299](https://github.com/effekt/nubbin/issues/299)) — which is where this repository's work
happens — so in every worktree run it reported a green tick over an empty term list.

A control that runs in one place, and whose configuration cannot travel to the places the
work happens, is not protecting anything. What it had flagged on `main` is resolved separately,
in its own change: removing a check and resolving what it found are different acts, and the
build going green here is caused by the first. A later reader should not read that as evidence
of the second.

The gate, its term list, its example file and its wiring are removed. The editorial standard —
this repository is public and carries nothing from private work — is a matter for review, not
a script.

Rejected: resolving the list from the main worktree so linked worktrees can read it, which
makes the gate real but makes a private, uncommittable file a permanent dependency of a public
repository's build. Rejected: narrowing the term list to cut false positives, which keeps
every cost and buys only quieter output.
