# @nubbin/react

The React render path for Nubbin. It declares the block registry an artifact is rendered
against, and resolves the data holes a compiled artifact declares — the fields a block marked
as fetched per request or on an interval, which compile deliberately left unfrozen.

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

```ts
import { defineRegistry } from "@nubbin/react";

export const registry = defineRegistry({
  Hero: () => import("./blocks/Hero").then((m) => m.Hero),
});
```

Each value is an `import()` the bundler can see, which is what gives one chunk per block. A
block author types their component as `BlockComponent<HeroProps>`; the registry stores it with
its props erased, because function parameters are contravariant and a shared props type would
be assignable from no real component.

**Release candidate, and incomplete.** The renderer itself is not here yet — it is
[#48](https://github.com/effekt/nubbin/issues/48).

<https://effekt.github.io/nubbin/>. MIT.
