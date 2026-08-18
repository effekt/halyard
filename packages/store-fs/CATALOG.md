# @nubbin/store-fs

The reference artifact store for Nubbin: one file per artifact, one pointer file per route, and no aggregate to lose a write.

| Export | Kind | Summary |
|---|---|---|
| [`artifactPath`](src/artifactPath.ts) | fn | Content-addressed, so the hash is the whole filename — nothing else disambiguates it. |
| [`createFsArtifactStore`](src/createFsArtifactStore.ts) | fn | One pointer file per route, one file per artifact, and nothing else. |
| [`encodeRouteKey`](src/encodeRouteKey.ts) | fn | One pointer file per route needs a filename that cannot collide or nest. |
| [`fsManifest`](src/fsManifest.ts) | fn | An advisory read over the pointer files, never a stored document. |
| [`fsPublish`](src/fsPublish.ts) | fn | Existence check first, so a typo'd hash cannot go live as a 404. |
| [`fsUnpublish`](src/fsUnpublish.ts) | fn | `force` because unpublishing an already-unpublished route is a no-op, not an error. |
| [`fsWriteArtifact`](src/fsWriteArtifact.ts) | fn | An existing hash holds the same bytes by construction, so re-writing is skipped rather than rejected — a publish… |
| [`pointerPath`](src/pointerPath.ts) | fn | One file per route. |
| [`readJsonOrNull`](src/readJsonOrNull.ts) | fn | ENOENT is a value here — an unknown hash or unpublished route reads as null, not a throw. |
| [`artifactFixture`](src/testing/artifactFixture.ts) | fn | A minimal valid artifact; hash and route parameterized because the contract keys on both. |
| [`createMemoryArtifactStore`](src/testing/createMemoryArtifactStore.ts) | fn | The reference implementation the contract suite defines equivalence against. |
| [`runArtifactStoreContract`](src/testing/runArtifactStoreContract.ts) | fn | One suite, every implementation. |
| [`writeJsonAtomic`](src/writeJsonAtomic.ts) | fn | Temp-write then rename: the rename is the single-key write. |
