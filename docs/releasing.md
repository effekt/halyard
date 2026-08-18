---
title: Releasing
summary: How a version reaches npm, which tool must do it, and the two behaviours that surprise people
status: stable
---

# Releasing

Four packages publish from this repository: `@nubbin/core`, `@nubbin/react`, `@nubbin/next` and
`@nubbin/store-fs`. They share a version.

## Versions are generated, never edited

Which tool does that, and what it was picked over, is
[Changesets owns versions](decisions/changesets-owns-versions.md).

A change that should ship carries a changeset:

```bash
pnpm changeset          # pick the packages and the bump, describe the change
```

The `version` workflow turns accumulated changesets into a `changeset-release/main` branch
that bumps every manifest and writes the changelogs. Opening a pull request from that branch
and merging it is what makes a version real. Nothing else edits a `version` field.

Opening it is manual, for two reasons that happen to agree: GitHub Actions cannot create pull
requests in this repository, and enabling that would also let any workflow *approve* one.

The four packages are `fixed` in `.changeset/config.json`, so they move together — one version
across the set, and a changeset naming any of them bumps all of them.

**The repository is in prerelease mode**, recorded in `.changeset/pre.json`. While it is,
versions come out as `0.1.0-rc.N`. Leaving it is deliberate:

```bash
pnpm changeset pre exit     # next version is 0.1.0, not another rc
```

Without pre mode, `changeset version` graduates a prerelease straight to stable — from
`X.Y.Z-rc.N` it produces `X.Y.Z`, not the next prerelease.

## The commands

| Command | Does |
|---|---|
| `pnpm changeset` | Records a change, so the next version bump knows about it |
| `pnpm publishable` | Checks the version stamp, builds, then runs the gates that read the artifact a consumer installs rather than the source — `publint`, `attw`, and the `release` test project |
| `pnpm release:rc` | `publishable`, then publishes with `--tag rc` |
| `pnpm release` | `publishable`, then refuses if any version is a prerelease, then `changeset publish` |

`pnpm verify` includes `publishable`, so a pull request already proves the packages are
publishable before anyone tries.

## It must be pnpm that publishes

Workspace dependencies are written `catalog:` and `workspace:*`. No registry understands
either. **pnpm rewrites them to real versions when it packs; npm does not** — so a package
published with `npm publish` looks correct in the repository and fails on `install` for every
consumer, with an error naming the protocol rather than the mistake.

`tests/release/packagesInstallFromTarball.test.mjs` inspects the packed manifest rather than the
tool, so it holds whichever command produced the tarball — and then installs it, because npm
rejects a surviving `catalog:` with an error naming the protocol rather than the specifier.

## Two behaviours that surprise people

**`publishConfig.tag` is ignored.** pnpm's publish path does not honour it — a dry run with the
field set announced `latest`. The dist-tag is decided by the command, which is why
`release:rc` passes `--tag rc` explicitly and why the field is absent from every manifest.

**npm sets `latest` on a package's first publish, whatever `--tag` says.** A package must have
a `latest` tag, and on the first version there is nothing else for it to point at. The `rc`
tag is applied as asked and `latest` is applied as well. Publishing a stable version later
moves `latest` to it; there is nothing to undo in the meantime, and removing `latest` leaves
plain `npm install` behaving inconsistently across tooling.

## Publishing from CI

The `release` workflow is the way to publish. It is `workflow_dispatch` with a dist-tag
choice, so someone picks `rc` or `latest` deliberately — a tag push would publish whatever the
tag happened to point at. It runs in the `npm` GitHub environment, which is where a required
reviewer or a branch rule hangs if one is wanted.

No npm token is stored. `id-token: write` lets npm exchange an OIDC claim for a short-lived
credential scoped to that one workflow, which cannot be extracted or reused.

It publishes with `changeset publish`, which already skips a version that is on the registry —
so a re-run after a partial failure finishes the rest instead of stopping on what succeeded.
That call shells out to `pnpm publish`, which is what rewrites `catalog:` and `workspace:*`
into versions a registry understands; npm cannot do that itself.

The last step reads the registry back, because the publish output is not evidence that a
package landed — an `npm view` of the version a consumer would resolve is.

### Git hooks do not run in CI

Every workflow sets `LEFTHOOK: "0"`. `pnpm install` runs `prepare`, which installs lefthook's
hooks, so without it a workflow step that pushes runs the whole pre-push suite — against a
checkout that may not have built yet, duplicating checks the workflow already runs as jobs.
The `version` workflow found this the first time it tried to push a Version Packages branch.

### Before the first CI release

Two things live outside this repository and are set up once:

| Where | What | State |
|---|---|---|
| GitHub → Settings → Environments | An environment named `npm`, restricted to `main` | done |
| npmjs.com → each package → Settings | A trusted publisher naming this repository and `release.yml` | outstanding |

Until a package has its trusted publisher, that package's publish step fails authentication.

## Publishing by hand

Still possible, and how the first prerelease went out. It requires a one-time password: `pnpm
release:rc` prompts for it, which needs a real terminal — with stdin closed it fails `EOTP`.
Passing the code avoids the prompt entirely:

```bash
pnpm --filter "./packages/*" publish --tag rc --no-git-checks --otp=123456
```

## After publishing

The registry lags a publish by a minute or two, so an immediate read returns `Not found`.
Once it settles, check the artifact rather than the output that produced it:

```bash
npm view @nubbin/core dist-tags
npm install @nubbin/core@rc     # in an empty directory, then import it
```

Installing into a clean directory is the only check that covers the whole path, including
whether a workspace dependency resolved to a version that exists.
