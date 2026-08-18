---
title: Public Repository Standard
summary: What may not appear in this repository, and how to publish a finding without its provenance
status: stable
---

# This repository is public


Contributors work in other codebases, most of them closed. Nothing from those belongs here —
not employer or client names, not internal application or package names, not product-specific
routes, model names, or page titles, and not absolute paths from a developer's machine.

**Keep the conclusion, drop the measurement.** Anonymising a statistic is not enough. "In one
audited corpus, most entries were data models rather than pages" names no one, and a reader
still cannot open that corpus, test the claim, or argue with it — it reads as authority while
supplying none, and it dates the document to one sample taken once.

What a private codebase gives you is a thing you now *know*. Publish that, argued from why it
holds: a visual CMS accumulates structured data models faster than pages because rows are
cheap to add and a page needs a route. That claim stands on its own reasoning, and a reader
who disagrees has something to push against.

This standard is held in review rather than by a script —
[the decision](decisions/vendor-references-are-a-review-concern-not-a-gate.md) records
why.

**Examples must be self-contained.** Scaffold a clean Next.js application with the
the create-starter generator for fixtures, demos, and manual testing. Never point them
at a codebase that is not part of this repository.
