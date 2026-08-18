---
title: "The design site runs Docusaurus"
summary: Why the site is a React workspace rendering the documents in place
status: stable
---

# The design site runs Docusaurus

Every defect the site's audits found was the theme's, never the documents': syntax
highlighting below WCAG AA, tables restyled until they lost table semantics, a second `h1`
on every page from the masthead, mermaid patched in through a CDN script in a layout
override, and no search — the full list, with scale, is
[#71](https://github.com/effekt/nubbin/issues/71).

So the site is a workspace, `apps/docs`, running Docusaurus over the documents on `main` —
they live once, [what the site publishes is settled
separately](the-site-publishes-the-repositorys-markdown.md), and
[generated output is still committed nowhere](generated-documents-are-published-never-committed.md).
Mermaid is an official plugin rather than a patched-in script; a broken link fails the
build, and upstream maintains that check; and the site is React, which is what Nubbin
renders — the strongest demo this project can have is a page on this site built from real
Nubbin blocks, and a static generator forecloses it. That argument is the deciding one; the
rest is quality of life.

The site serves at `effekt.github.io/nubbin`, which is where GitHub Pages serves the
artifact CI deploys, and the repository is the only thing that address depends on. Rejected:
a path on [the canonical origin](one-origin-serves-both-audiences.md) — that origin serves
one hand-written file today, so the documentation would reach it through a second host and a
rewrite, buying a nicer address at the cost of a hop nobody asked for and a deploy path that
can fail on its own. It moves there when the origin has something to serve it from.

Rejected: staying on a static generator and accepting a patch per theme defect. Right while
the site was a handful of documents nobody styled; the defect list is what ended it.

The dependency surface is not an exception to
[the pinning discipline](pinned-versions-and-a-3-day-cooldown.md). `check-pinned-deps.mjs`
reads every manifest git tracks plus the workspace catalog, and never walks the transitive
tree — so exactly pinning the site's direct dependencies
satisfies it in full, and the transitive tree answers to the lockfile,
`blockExoticSubdeps` and `minimumReleaseAge` the same way every other dependency's does.
