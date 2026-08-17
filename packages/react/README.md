# @nubbin/react

The React render path for Nubbin. Today it resolves the data holes a compiled artifact
declares — the fields a block marked as fetched per request or on an interval, which compile
deliberately left unfrozen.

```bash
npm install @nubbin/react@rc
```

```ts
import { resolveNodeHoles } from "@nubbin/react";

const props = await resolveNodeHoles(node, "/live/pulse", async ({ block, path, spec }) => {
  // `spec` is "request" or { revalidate: n } — exactly what compile wrote
  return fetchLiveValue(block, path, spec);
});
```

A node with no holes returns its frozen props unchanged, without calling the resolver at all.
A node that declares holes and gets no resolver throws naming the node, rather than rendering a
compile-time placeholder to a visitor.

**Release candidate, and incomplete.** The renderer itself is not here yet — it waits on
[a decision about the component type](https://github.com/effekt/nubbin/issues/88).

<https://effekt.github.io/nubbin/>. MIT.
