---
title: "Generated documents are published, never committed"
summary: Why main holds hand-written source and CI deploys everything derived from it
status: stable
---

# Generated documents are published, never committed

`main` holds hand-written source. CI generates the site from it and deploys the result to
GitHub Pages as a build artifact, so the published copy exists on no branch and is never
hand-edited. This governs documents that have a published copy; a derived index that serves a
developer in the tree is
[generated and committed instead](catalogs-are-generated-and-committed.md).

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

Rejected: committing the site's generated documents to `main` so that `pnpm docs:generate &&
git diff --exit-code` can check them. A published document already has a copy to compare
against, so committing a third is a per-branch conflict bought for nothing. Idempotence is
proven by generating twice and comparing the outputs; drift by comparing generated output
against what is published.
