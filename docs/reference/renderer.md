---
title: Renderer and Block Registry
summary: The @nubbin/react surface as shipped — Renderer, defineRegistry, loadBlocks, and the block, hole and renderer types
status: reference
---

# Renderer and block registry

This page describes the shipped surface of `@nubbin/react`: the `Renderer` server component,
`defineRegistry`, `loadBlocks`, and the `BlockComponent`, `BlockRegistry`, `RendererProps`,
`HoleContext` and `HoleResolver` types. The package renders an artifact tree against a registry
of blocks and evaluates nothing the artifact carries — why that boundary exists is
[Artifacts contain data, never code](../decisions/artifacts-contain-data-never-code.md).

## `Renderer`

An async server component taking `RendererProps` and returning a `ReactElement`. It reads an
already-validated artifact: no schema is parsed here.

```ts
interface RendererProps {
  artifact: Artifact;
  registry: BlockRegistry;
  resolveHole?: HoleResolver | undefined;
}
```

It loads only the blocks the artifact names — `Object.keys(artifact.blockVersions)` — then walks
`artifact.tree`, rendering each node, and wraps the results in a `Fragment`. A registry of any
size therefore costs a route only the imports that route uses.

`resolveHole` is declared `?: HoleResolver | undefined` rather than `?: HoleResolver` because
`exactOptionalPropertyTypes` is on: destructuring an absent optional yields `undefined`, and the
renderer assigns exactly that onward. Callers that omit it still typecheck.

## `defineRegistry`

Identity at runtime, and the point is the call site.

```ts
function defineRegistry<R extends BlockRegistry>(registry: R): R
```

The object literal it wraps is a map of `import()` calls the bundler can see statically, which is
what per-block code-splitting rests on. `R` is returned rather than `BlockRegistry` so the map
keeps its exact keys where it is written; indexing the widened form by an arbitrary string is the
renderer's concern, and the renderer takes `BlockRegistry` for that reason.

## `loadBlocks`

```ts
function loadBlocks(
  registry: BlockRegistry,
  names: readonly string[],
): Promise<Record<string, BlockComponent>>
```

Resolves only the named importers, in parallel, and never touches the rest of the registry.

**It reports every missing name at once**, throwing `registry has no importer for: a, b`. An
artifact compiled against a registry the application has since shrunk needs each name fixed
separately, so failing on the first would hide the remaining work.

## `BlockComponent` and `BlockRegistry`

```ts
type BlockComponent<P extends UnknownProps = UnknownProps> = (
  props: P,
) => ReactNode | Promise<ReactNode>;

type BlockRegistry = Record<string, () => Promise<BlockComponent<never>>>;
```

`P` is the block's own props, so an author has a name for their component —
`BlockComponent<HeroProps>`. Async is allowed because rendering happens on the server.

The stored props type is `never` because parameters are contravariant: a component that reads
`title` cannot stand in for one obliged to accept any record, so `BlockComponent<UnknownProps>`
in the registry would reject every real block
([#88](https://github.com/effekt/nubbin/issues/88)). `loadBlocks` widens back with a single cast
at the render seam, which is sound there and nowhere else — what reaches a component is props
`compile` already validated against that block's schema.

## `HoleContext` and `HoleResolver`

```ts
interface HoleContext {
  route: string;
  nodeId: string;
  block: string;
  path: string;
  spec: FieldHintData;
}

type HoleResolver = (context: HoleContext) => Promise<unknown>;
```

The resolver is supplied by the consumer. The renderer decides where a value lands; the resolver
decides what it is. It receives the spec and never a value — the stored placeholder was dropped
at compile, and mapping a declared lifecycle onto a caching layer belongs to the framework
binding. `@nubbin/next`'s [`holeFetchOptions`](next.md) is that mapping for Next.

`spec` is `"request"` or `{ revalidate: n }`, exactly what compile wrote into the artifact.
