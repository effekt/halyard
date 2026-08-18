---
title: "One root element per block, enforced at render"
summary: Why invokeBlock throws on a root it cannot stamp instead of a static gate
status: stable
---

# One root element per block, enforced at render

The renderer invokes a block and clones the returned element to stamp `data-nubbin-node`. Only
a host element — one whose `type` is a string — turns that prop into an attribute. `invokeBlock`
throws when the returned value is anything else, naming the block and the node.

The check is `typeof rendered.type === "string"`, not the absence of a Fragment. A composite
root such as `<Card>` clones without complaint and receives `data-nubbin-node` as a prop the
component never spreads, so the block renders correctly, passes every gate, and is unselectable
in the studio. Narrowing to a host element rejects Fragments, portals and composite roots by the
one property that decides whether the stamp survives.

Static analysis was the alternative — reading each component's return paths from the TypeScript
AST, which the repository already does elsewhere. It was rejected as redundant rather than
wrong: the render-time check catches every case including the conditional and array returns
static analysis cannot prove, and a second mechanism catching a subset of the same class earlier
buys less than it costs to maintain.

The original argument for a gate was that the failure would be silent — a node carrying no
attribute, discovered in the studio phases later. Only the host-element check makes that
argument moot: the earlier Fragment test threw on first render for the roots it covered and
passed the composite root straight through, which is the silent failure it was meant to have
ended. Every root the renderer cannot stamp now throws, in development, naming the block.
