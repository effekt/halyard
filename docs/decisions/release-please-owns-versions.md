---
title: "release-please owns versions"
summary: What a human step in the middle of an automated release chain cost, and why the gate is an output rather than a checklist
status: stable
---

# release-please owns versions

Versions and changelogs are derived from the conventional commits `commitlint` already enforces.
[`googleapis/release-please-action`](https://github.com/googleapis/release-please-action) opens and
maintains the release pull request; merging it is what makes a version real, and creating the
GitHub releases is what permits a publish.

The chain it replaces had a human in the middle. A workflow force-pushed a branch carrying the
bump, and somebody was supposed to open a pull request from it. That stopped happening, and
`main` then took more than a hundred commits under a version string the registry already held.
Five release dispatches in one day all named that version, from four different commits, and only
one of them published anything: the publisher skips a version already on the registry and exits 0,
so three runs reported a successful release of code they had not sent. npm refusing to overwrite a
version was the only thing standing between four different builds and one version string.

That is not a hygiene problem. `compile` stamps the version into every artifact as `compiledWith`,
so an artifact is supposed to identify what produced it — and two materially different compilers
stamped the same string. One of them rejects a registration the other accepts, because
[#223](https://github.com/effekt/nubbin/issues/223) landed between them. A provenance field that
does not identify its producer is worse than an absent one, because it looks like an answer.

So the release pull request is opened by the tool that computes it, and the publish job is gated on
`releases_created`, which is true only on the run that created the releases for a version. A
version cannot be published twice because the gate is an output of the thing that assigns it,
rather than a step someone performs.

Rejected: patching the incumbent. It needed a workflow that opened its own pull request, a publish
that failed rather than skipped, a dist-tag rule that stopped sending release candidates to
`latest`, and a rule about when to leave prerelease mode — four bespoke mechanisms in a repository
being cured of bespoke mechanisms, and none of them the missing gate.

Rejected: semantic-release, which publishes on every merge to the default branch and would remove
the choice to sit on a prerelease tag — a choice this project is exercising.

Rejected, within release-please: the `node-workspace` plugin, which rewrites internal dependency
ranges. Internal dependencies here are written `workspace:*` and pnpm resolves them when it packs,
so there is nothing for it to do and a version range where the protocol belongs is the failure it
would produce. `linked-versions` moves the four packages as one and leaves dependency ranges
alone, which is what a workspace protocol needs from it.
