---
title: "Generated documents are published, never committed"
summary: Why main holds hand-written source and CI deploys everything derived from it
status: stable
---

# Generated documents are published, never committed

`main` holds hand-written source. CI generates the site from it and deploys the result to
GitHub Pages as a build artifact, so the published copy exists on no branch and is never
hand-edited. Generated output that serves a developer rather than a reader goes to a
gitignored path on demand, as [the codebase catalog does](no-committed-catalog-of-the-codebase.md).

A published copy that nothing generates has nothing to compare itself against, which is how
the documents carrying the same name in two places diverged, and how the site came to publish
prose `check-prose.mjs` rejects.

Rejected: a `gh-pages` branch holding the output, which is where the site was published from
until the deployment was automated. A branch only CI may write is still a second copy of
every document, carrying a history nobody reads and a name every clone fetches. It also has
to be exempted from the rules that protect the branches people write to: the first automated
publish was refused outright, because a ruleset required three status checks that cannot run
on build output. An artifact has no such conflict — nothing about it looks like a branch, so
nothing guarding branches applies.

Rejected: committing generated documents to `main` so that `pnpm docs:generate && git diff
--exit-code` can check them. It reverses the catalog decision above and reintroduces the
per-branch conflicts that decision exists to avoid; worse, while nothing generated is
committed it passes without examining anything, which is a gate reporting success for work it
never did. Idempotence is proven by generating twice and comparing the outputs; drift by
comparing generated output against what is published.
