---
title: Releasing
summary: How a version reaches npm, what decides it, and the two behaviours that surprise people
status: stable
---

# Releasing

Four packages publish from this repository: `@nubbin/core`, `@nubbin/react`, `@nubbin/next` and
`@nubbin/store-fs`. They share a version.

## Versions are derived, never edited

Which tool derives them, and what it beat, is
[release-please owns versions](decisions/release-please-owns-versions.md).

Nothing is recorded at commit time beyond the commit message, whose format `commitlint` already
enforces. A `fix:` or a `feat:` touching a package is what the next version is computed from.

The `release` workflow runs release-please on every push to `main`. It maintains one pull request,
titled `chore(repo): release main`, carrying every manifest bump and every changelog entry earned
since the last release. Merging that pull request is what makes a version real, and it is the only
thing that edits a `version` field.

Merging it also creates four GitHub releases and four tags. **Those releases are what permit a
publish**: the publish job is gated on the action's `releases_created` output, which is true only
on the run that created them, and therefore true once per version.

## What the configuration says

| File | Holds |
|---|---|
| `release-please-config.json` | how versions are computed, and for which packages |
| `.release-please-manifest.json` | the version each package is at, which release-please rewrites |

Five settings there are load-bearing, and each fails quietly if it is wrong:

**`"versioning": "prerelease"`** — the key is `versioning`. `versioning-strategy` is the name of
the action input and the CLI flag, and in manifest mode the input is not read at all; the config
schema rejects the key outright.

**`"prerelease": true`** — without it the strategy strips the prerelease part rather than
incrementing it, so the next version off an `rc` line is a stable one. `"prerelease-type": "rc"` is
what puts the repository back on that line if it ever leaves it.

**`"bump-minor-pre-major": true`** — a breaking change carries the prerelease part through a major
bump rather than resetting it, so without this the version after a `feat!:` keeps the release
candidate number it already had and only the major digit moves.

**The `linked-versions` plugin**, naming all four components, so the packages move as one. Its
`components` are the component names — the npm scope is stripped, so they are `core`, `react`,
`next` and `store-fs`. Each package sets `component` explicitly rather than relying on that.

**`"last-release-sha"`** — the commit that actually published the version in the manifest, so the
first release pull request's changelog begins after it rather than at the beginning of the
repository. It is never ignored, so it stays correct by being left alone; it is inert once a
release pull request has merged, because the scan stops at that merge first.

`packages/core` also carries an `extra-files` entry for `src/version.constants.ts`, which is
stamped into every artifact as `compiledWith`. The updater matches the `x-release-please-version`
annotation on the line holding the value, and `tests/coreVersionStamp.test.mjs` fails the release
pull request if the two ever disagree.

## The commands

| Command | Does |
|---|---|
| `pnpm publishable` | Checks the version stamp, builds, then runs the gates that read the artifact a consumer installs rather than the source — `publint`, `attw`, and the `release` test project |
| `pnpm release-tag` | Refuses a stable publish while any version is a prerelease |

There is no local publish command. `pnpm verify` includes `publishable`, so a pull request already
proves the packages are publishable before anyone tries.

## It must be pnpm that publishes

Workspace dependencies are written `catalog:` and `workspace:*`. No registry understands
either. **pnpm rewrites them to real versions when it packs; npm does not** — so a package
published with `npm publish` looks correct in the repository and fails on `install` for every
consumer, with an error naming the protocol rather than the mistake.

`tests/release/packagesInstallFromTarball.test.mjs` inspects the packed manifest rather than the
tool, so it holds whichever command produced the tarball — and then installs it, because npm
rejects a surviving `catalog:` with an error naming the protocol rather than the specifier.

This is also why `linked-versions` is the plugin and `node-workspace` is not: the version-linking
job is wanted, and the dependency-range rewriting is not.

## Two behaviours that surprise people

**`publishConfig.tag` is ignored.** pnpm's publish path does not honour it — a dry run with the
field set announced `latest`. The dist-tag is decided by the command, which is why the workflow
passes `--tag` explicitly and why the field is absent from every manifest.

**A publisher treats "already on the registry" as success.** `pnpm publish` skips such a package
and exits 0; its own `--force` flag documents the behaviour it overrides. So a green release run is
not evidence that anything was sent. The workflow reads the registry *before* publishing and fails
on a version that is already there, which turns that silence into a named error.

## Publishing from CI

The `release` workflow is the only way to publish. It is not dispatchable: a dispatch takes a ref
and a dist-tag from whoever runs it, and both are now derived — the ref is `main`, and the dist-tag
comes from the version, `rc` for a prerelease and `latest` for a stable one.

Two gates stand in front of the publish job, and they answer different questions:

| Gate | Asks |
|---|---|
| `releases_created == 'true'` | is this a version that has not been released? |
| the `verify` run for this commit | does this commit pass lint, typecheck and the suites? |

The second is a poll rather than a read, because `verify` and `release` are triggered by the same
push and start together. Before it existed, the publish path ran `publishable` and nothing else, so
a commit failing every test could publish.

Publishing then waits on the `npm` environment, which restricts deployments to `main` and carries a
required reviewer. Merging the release pull request proposes a release; approving that deployment
performs one.

No npm token is stored. `id-token: write` lets npm exchange an OIDC claim for a short-lived
credential scoped to that one workflow, which cannot be extracted or reused, and is what signs the
provenance attestation.

The last step reads the registry back, because the publish output is not evidence that a
package landed — an `npm view` of the version a consumer would resolve is.

### Git hooks do not run in CI

Every workflow sets `LEFTHOOK: "0"`. `pnpm install` runs `prepare`, which installs lefthook's
hooks, so without it a workflow step that pushes runs the whole pre-push suite — against a
checkout that may not have built yet, duplicating checks the workflow already runs as jobs.

## What lives outside this repository

Three things are set up once, and a release cannot happen without all three:

| Where | What | State |
|---|---|---|
| GitHub → Settings → Environments | An environment named `npm`, restricted to `main`, with a required reviewer | done |
| npmjs.com → each package → Settings | A trusted publisher naming this repository and `release.yml` | done |
| GitHub → Settings → Secrets | `RELEASE_PLEASE_TOKEN` | **required** |

`RELEASE_PLEASE_TOKEN` is a fine-grained personal access token with read and write on Contents,
Pull requests and Issues for this repository. `GITHUB_TOKEN` cannot stand in for it, for two
independent reasons: this repository has **Allow GitHub Actions to create and approve pull
requests** switched off, so that token cannot open the release pull request at all; and a pull
request opened with it triggers no workflow run, so `verify` and `commitlint` — both required
status checks — would never report on the release pull request and it could never be merged.

The workflow checks for the secret and fails with that explanation rather than letting it surface
as an authentication error inside the action.

## Tags

Each release is tagged per package, `<component>-v<version>` — `core-v…`, `react-v…`, `next-v…`,
`store-fs-v…`. A tag is the durable record tying a published version to the commit that produced
it, and release-please reads them: when a release is missing, it looks for the tag its manifest
version implies and takes the previous release's commit from there.

## After publishing

The registry does not serve a publish immediately, which is why the read-back retries rather than
reading once. Once it settles, check the artifact rather than the output that produced it:

```bash
npm view @nubbin/core dist-tags
npm install @nubbin/core@rc     # in an empty directory, then import it
```

Installing into a clean directory is the only check that covers the whole path, including
whether a workspace dependency resolved to a version that exists.
