# @nubbin/core

## [0.1.0-rc.6](https://github.com/effekt/nubbin/compare/core-v0.1.0-rc.5...core-v0.1.0-rc.6) (2026-08-19)


### ⚠ BREAKING CHANGES

* **core:** `DocumentVersion.root: string` is now `roots: readonly string[]`. A single-root document becomes `roots: [root]`; the compiled artifact is unchanged.
* **core:** `Block.migrate` is removed. No node records the block version its props were authored against and `compile` runs no upcaster, so a document whose props no longer satisfy the current schema fails `compile` with a `CompileError` naming the node and the path; the remedy is to rewrite the document and publish it again. Already-published artifacts are unaffected — their props were validated and frozen against the version they compiled with.

### Features

* **core:** a document has many roots ([#483](https://github.com/effekt/nubbin/issues/483)) ([4abe53e](https://github.com/effekt/nubbin/commit/4abe53e827fb1ef24354a62cd4f2ad4a6be74a0d)), closes [#60](https://github.com/effekt/nubbin/issues/60)
* **core:** rich text ships as typed data, not markup in a string ([#484](https://github.com/effekt/nubbin/issues/484)) ([28ba770](https://github.com/effekt/nubbin/commit/28ba770ac2fa0832d01ae973e5749e437ccd75f1)), closes [#389](https://github.com/effekt/nubbin/issues/389)


### Bug Fixes

* **core:** a data hint addresses a dotted path, not a top-level key ([#482](https://github.com/effekt/nubbin/issues/482)) ([d602f91](https://github.com/effekt/nubbin/commit/d602f9136d8da349621642d783ae558e865e3c4d))
* **core:** the rich-text compile test builds a document with roots ([#486](https://github.com/effekt/nubbin/issues/486)) ([1975d8a](https://github.com/effekt/nubbin/commit/1975d8adc133b2cf3d6fb24797fbdf6e907bfdf1))


### Code Refactoring

* **core:** a schema change is a republish, not a migration ([#481](https://github.com/effekt/nubbin/issues/481)) ([8140b14](https://github.com/effekt/nubbin/commit/8140b1472b202cb62743cc88983d8ebae136c334))

## [0.1.0-rc.5](https://github.com/effekt/nubbin/compare/core-v0.1.0-rc.4...core-v0.1.0-rc.5) (2026-08-19)


### Features

* **core:** a registry change that breaks a live page fails CI ([#476](https://github.com/effekt/nubbin/issues/476)) ([1931dd8](https://github.com/effekt/nubbin/commit/1931dd8384f9199fcba237926f8b9f411f11836c))
* **repo:** a generated catalog answers "does this already exist" ([#473](https://github.com/effekt/nubbin/issues/473)) ([2d41486](https://github.com/effekt/nubbin/commit/2d414864667d41aa7ce2e055c540c3ceb5491364))
* the studio edits — select a block, change a field, the preview follows ([#451](https://github.com/effekt/nubbin/issues/451)) ([23fbe05](https://github.com/effekt/nubbin/commit/23fbe0579c99972f0a5903d811f210119e5df510))
* the studio's first vertical slice — parse, preview, publish ([#436](https://github.com/effekt/nubbin/issues/436)) ([35c79d6](https://github.com/effekt/nubbin/commit/35c79d63100f7036ec43d99170aa9204f7cb3d4c))


### Bug Fixes

* **core:** a `data` hint on an array-member path is refused at registration ([#223](https://github.com/effekt/nubbin/issues/223)) ([#225](https://github.com/effekt/nubbin/issues/225)) ([7fee54a](https://github.com/effekt/nubbin/commit/7fee54a1fdfe4667bd6542074852057ea481f9b1))
* **repo:** release-please replaces changesets, and the publishing defects with it ([#477](https://github.com/effekt/nubbin/issues/477)) ([0f160c2](https://github.com/effekt/nubbin/commit/0f160c2e99039227cca6899ddbf43a9f7a859dea))

## 0.1.0-rc.4

### Patch Changes

- 97144e9: `compile` now stamps the real package version into `compiledWith`. Every artifact produced by
  `0.1.0-rc.0` through `rc.3` recorded `0.0.0`, which is worse than recording nothing — the field
  exists so an artifact says what produced it.
- dd9c3b3: Documentation only. The README now states the two commitments a reader was most likely to
  doubt: that the core stays MIT, and that a published page never calls Nubbin.

## 0.1.0-rc.3

### Patch Changes

- 8a01bab: Documentation only. Three documents named a commitlint config file that does not exist, and two
  traps that cost CI round-trips are now written down.
- 3495902: Tooling only. A repository file named inside a code span must exist, so a pointer to the wrong
  filename fails a gate rather than reading as authoritative.
- cb596fa: Documentation only. The lessons behind nine decorative gates and five documents that drifted are
  now rules an agent loads by path, rather than things a reviewer has to keep saying.
- d42f112: Tooling only. A filename that names nothing now fails at the edit rather than at the commit.
- 3c65495: Tooling only. A publishable package missing a README, a licence or repository metadata now
  fails a gate rather than a registry page.
- b19d23e: Every package now carries a README, a licence and repository metadata. Their npm pages showed
  "ERROR: No README data found!", and three of the four declared no licence at all on an MIT
  project.

## 0.1.0-rc.2

### Patch Changes

- a875486: No runtime change. The example application now types its block props with `InferProps` from
  this package rather than zod's `z.infer`, so the reference an adopter copies demonstrates the
  validator-agnostic type.
- 37e20c6: Documentation only. The agent environment record described the `PostToolUse` chain by a count
  that was wrong; it now describes the chain.
- 337fcba: Tooling only. Every package is now installed from its own tarball into an empty project and
  imported before a release, so a package that resolves in the workspace but not on a consumer's
  disk fails a gate rather than a user.
- 0672a37: Tooling only. A package declaring a peer dependency nothing in it imports now fails a gate.
  npm installs peers by default, so an unused one is something a consumer receives for nothing.

## 0.1.0-rc.1

### Minor Changes

- 577550f: The storage and binding halves of the render path.
  
  `@nubbin/store-fs` is a pointer-per-route artifact store, proven against a contract suite any
  adapter can run. `@nubbin/next` resolves an artifact through one pointer read, prebuilds exact
  routes, and publishes or unpublishes a single route with the invalidation that makes an
  unpublish a served 404. `@nubbin/react` resolves declared holes. `@nubbin/core` gains
  `parseMatchKind`, so no adapter derives a route's match kind itself, and `InferProps`.
