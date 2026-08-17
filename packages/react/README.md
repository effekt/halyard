# @nubbin/react

The React render path for Nubbin. It walks a compiled artifact, loads the blocks that artifact
names, resolves the data holes it declares, and renders them.

```bash
npm install @nubbin/react@rc
```

```tsx
import { defineRegistry, Renderer } from "@nubbin/react";

export const registry = defineRegistry({
  Hero: () => import("./blocks/Hero").then((m) => m.Hero),
});

export default async function Page() {
  const artifact = await resolveArtifact(store, slug);
  return <Renderer artifact={artifact} registry={registry} />;
}
```

Each registry value is an `import()` the bundler can see, which is what gives one chunk per
block; a route resolves only the names its artifact carries, so the hundredth block costs pages
that do not use it nothing. A block author types their component as `BlockComponent<HeroProps>`;
the registry stores it with its props erased, because function parameters are contravariant and
a shared props type would be assignable from no real component.

`Renderer` is an async server component. It invokes each block and stamps `data-nubbin-node` on
the element that block returns, which is how the studio maps a node in the tree to a region on
the page. **A block is therefore a server component returning exactly one root element** — a
Fragment root or a client reference has no root to stamp, and the renderer throws naming the
block rather than wrapping it in an element the consumer's layout did not ask for.

Slot children arrive as props: `slots.sections` renders to `props.sections`, an array of
elements the block places itself.

```tsx
<Renderer
  artifact={artifact}
  registry={registry}
  resolveHole={async ({ block, path, spec }) => fetchLiveValue(block, path, spec)}
/>
```

A hole is a field a block marked as fetched per request or on an interval, which compile
deliberately left unfrozen; `spec` is `"request"` or `{ revalidate: n }` — exactly what compile
wrote. A node with no holes never calls the resolver. A node that declares holes and gets no
resolver throws naming the node, rather than rendering a compile-time placeholder to a visitor.

<https://effekt.github.io/nubbin/>. MIT.
