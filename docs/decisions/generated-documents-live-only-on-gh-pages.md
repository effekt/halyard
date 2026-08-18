---
title: "Generated documents live only on gh-pages"
summary: Why main holds hand-written source and CI publishes everything derived from it
status: stable
---

# Generated documents live only on `gh-pages`

`main` holds hand-written source. CI generates the site from it and publishes to `gh-pages`,
which is build output and is never hand-edited. Generated output that serves a developer
rather than a reader goes to a gitignored path on demand, as
[the codebase catalog does](no-committed-catalog-of-the-codebase.md).

A published copy that nothing generates has nothing to compare itself against, which is how
the documents carrying the same name on both branches diverged, and how the site came to
publish prose `check-prose.mjs` rejects.

Rejected: committing generated documents to `main` so that `pnpm docs:generate && git diff
--exit-code` can check them. It reverses the catalog decision above and reintroduces the
per-branch conflicts that decision exists to avoid; worse, while nothing generated is
committed it passes without examining anything, which is a gate reporting success for work it
never did. Idempotence is proven by generating twice and comparing the outputs; drift by
comparing generated output against what is published.
