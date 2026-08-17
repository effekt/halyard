# @nubbin/store-fs

The reference artifact store for Nubbin, on the filesystem. One file per artifact, one pointer
file per route, and no aggregate document — so two publishes to different routes cannot lose
each other's write, because there is no shared file to read and rewrite.

```bash
npm install @nubbin/store-fs@rc
```

```ts
import { createFsArtifactStore } from "@nubbin/store-fs";

const store = createFsArtifactStore("./.nubbin");
await store.write(artifact);
await store.publish("/promotions/summer", artifact.hash);
```

```text
.nubbin/
  artifacts/<hash>.json
  routes/%2Fpromotions%2Fsummer.json
```

Writes are temp-then-rename, so a concurrent reader sees the old pointer or the new one and
never half of either. `manifest()` reads the pointer directory rather than a stored file, so
there is nothing to keep in step.

It passes a shared `ArtifactStore` contract suite, which is how a replacement adapter proves
itself equivalent — by execution rather than by inspection.

**Release candidate.**

<https://effekt.github.io/nubbin/>. MIT.
