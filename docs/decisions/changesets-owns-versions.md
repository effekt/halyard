---
title: "Changesets owns versions"
summary: The tool was already installed and configured and had never been run; what it was chosen over, and why the first release exposed the gap
status: stable
---

# Changesets owns versions

`@changesets/cli` was installed, configured with the four packages moving together, and named
by the release script. Nothing had ever run it. The first release went out from four manifests
edited by hand, with no changelog, and the publishing workflow written around that state
reimplemented what the tool already did.

The probe that settled it: asking the versioner what it would produce from that state gave a
stable version rather than the next prerelease, because nothing in the repository recorded that
a prerelease was in progress. The following bump would therefore have graduated every package
to stable and claimed the default distribution tag, and `check-release-tag.mjs` would not have
objected — by that point the versions are legitimately stable, and it guards a different door.
A tool that is configured but unrun is indistinguishable from one that is absent, right up to
the moment it is asked a question.

So changesets owns versions, and publishing stays a separate deliberate act rather than a
consequence of merging. `docs/releasing.md` carries how that works.

Rejected: semantic-release, which publishes on every merge to the default branch and would
remove the choice to sit on a prerelease tag — a choice this project was actively exercising.
Rejected: release-please, which reads the conventional commits `commitlint` already enforces
and would leave nothing to remember at commit time; it loses only because it would replace a
tool already configured for this repository's exact shape. Not using what was already there was
the mistake, rather than the thing that was there.
