---
title: Releasing
summary: How a version reaches npm, which tool must do it, and the two behaviours that surprise people
status: stable
---

# Releasing

Four packages publish from this repository: `@nubbin/core`, `@nubbin/react`, `@nubbin/next` and
`@nubbin/store-fs`. They share a version.

## The commands

| Command | Does |
|---|---|
| `pnpm publishable` | Builds, then runs the three gates that read the artifact a consumer installs rather than the source — `publint`, `attw`, `check-tarball` |
| `pnpm release:rc` | `publishable`, then publishes every package with `--tag rc` |
| `pnpm release` | `publishable`, then refuses if any version is a prerelease, then `changeset publish` |

`pnpm verify` includes `publishable`, so a pull request already proves the packages are
publishable before anyone tries.

## It must be pnpm that publishes

Workspace dependencies are written `catalog:` and `workspace:*`. No registry understands
either. **pnpm rewrites them to real versions when it packs; npm does not** — so a package
published with `npm publish` looks correct in the repository and fails on `install` for every
consumer, with an error naming the protocol rather than the mistake.

`check-tarball.mjs` inspects the packed manifest rather than the tool, so it holds whichever
command produced the tarball.

## Two behaviours that surprise people

**`publishConfig.tag` is ignored.** pnpm's publish path does not honour it — a dry run with the
field set announced `latest`. The dist-tag is decided by the command, which is why
`release:rc` passes `--tag rc` explicitly and why the field is absent from every manifest.

**npm sets `latest` on a package's first publish, whatever `--tag` says.** A package must have
a `latest` tag, and on the first version there is nothing else for it to point at. The `rc`
tag is applied as asked and `latest` is applied as well. Publishing a stable version later
moves `latest` to it; there is nothing to undo in the meantime, and removing `latest` leaves
plain `npm install` behaving inconsistently across tooling.

## Authentication

Publishing requires a one-time password. `pnpm release:rc` prompts for it, which needs a real
terminal — with stdin closed it fails `EOTP`. Passing the code avoids the prompt entirely:

```bash
pnpm --filter "./packages/*" publish --tag rc --no-git-checks --otp=123456
```

Automating this so a laptop and a phone are not on the critical path is
[#111](https://github.com/effekt/nubbin/issues/111).

## After publishing

The registry lags a publish by a minute or two, so an immediate read returns `Not found`.
Once it settles, check the artifact rather than the output that produced it:

```bash
npm view @nubbin/core dist-tags
npm install @nubbin/core@rc     # in an empty directory, then import it
```

Installing into a clean directory is the only check that covers the whole path, including
whether a workspace dependency resolved to a version that exists.
