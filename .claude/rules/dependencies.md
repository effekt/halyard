---
paths: "**/package.json, pnpm-workspace.yaml"
title: Dependency Pinning Rules
summary: Why every version is pinned, cataloged, and held to a 3-day cooldown
status: stable
---

# Dependencies

> **Every version is exact. Every shared version lives in the catalog. Nothing installs until it is 3 days old.**

## Why

A caret is a standing instruction to install code nobody has reviewed, on a schedule set by
whoever holds the publishing token. The npm compromises of the last few years — chalk,
debug, axios, Shai-Hulud — all propagated through exactly that: a patch bump auto-resolved
into thousands of installs before anyone read the diff.

Two independent controls, because either alone leaks:

- **Pinning** removes the automatic upgrade. A new version arrives only in a commit.
- **`minimumReleaseAge: 4320`** (3 days) holds a *deliberate* bump back until a hijacked
  release has had time to be found and pulled, which pinning alone does nothing about.

Three days, not a week: a hijack is caught in hours, and a longer cooldown stalls every
ordinary bump — [the decision](../../docs/decisions.md#pinned-versions-and-a-3-day-cooldown).

## Rules

### No ranges

```jsonc
// WRONG — installs whatever the maintainer publishes next
"zod": "^4.4.3",
"knip": "~6.32.2",
"typescript": "*",

// CORRECT
"zod": "catalog:",          // shared → catalog, pinned there
"some-single-use-tool": "1.4.2"
```

`workspace:*`, `catalog:`, `link:` and `file:` are exact by construction and allowed.
`scripts/check-pinned-deps.mjs` enforces this at pre-commit and on every agent edit.

### peerDependencies are the exception

A library must accept a range of its host's versions. Pinning React in
`peerDependencies` would force every consumer onto one exact version.

```jsonc
"peerDependencies": { "react": ">=19.0.0" },
"devDependencies":  { "react": "catalog:" }
```

### Shared versions go in the catalog

Anything used by more than one workspace package belongs in the `catalog:` block of
`pnpm-workspace.yaml`, so a bump is one line and cannot land half-applied.

### Bumping

Bump deliberately, in its own commit, with the scope `deps`. Read what changed. A bump that
is not a security fix should be a version that already cleared the cooldown — if `pnpm
install` complains that a version is too new, that is the gate working, and the answer is
to take the previous release rather than to lower the threshold.

### Security advisories bypass the cooldown, not the review

An advisory-driven bump may use `minimumReleaseAgeExclude`, on the condition that the
published diff is read and npm provenance confirmed first. Date the exemption in a comment
and delete it once the version clears the gate on its own.

### No exotic sources

`blockExoticSubdeps: true` rejects sub-dependencies resolved via git, tarball URLs, or
`github:owner/repo`. Those bypass the registry, and with it the cooldown, provenance, and
npm's ability to take a package down. Do not add a direct dependency from those sources
either.

## Gates

`check-pinned-deps.mjs` rejects a range where an exact version belongs and a duplicate of
something the catalog already pins. **Gate:** none for the three-day minimum age — `pnpm`'s
`minimumReleaseAge` enforces it at install time, so nothing in this repository re-checks a
lockfile that already satisfied it.

## Checklist

- [ ] No `^`, `~`, `*`, `>=`, or `x` outside `peerDependencies`
- [ ] Anything shared by two packages is in the catalog, referenced as `catalog:`
- [ ] The pinned version is at least 3 days old, or the bump is an advisory with a dated exemption
- [ ] Dependency changes are their own commit, scoped `deps`
- [ ] No git / tarball / github: sources
