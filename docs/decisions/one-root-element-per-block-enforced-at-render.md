---
title: "One root element per block, enforced at render"
summary: Why invokeBlock throws on an unclonable root instead of a static gate
status: stable
---

# One root element per block, enforced at render

The renderer invokes a block and clones the returned element to stamp `data-nubbin-node`, so a
Fragment root leaves nothing to clone. `invokeBlock` throws when the returned value is not a
clonable element, naming the block and the node.

Static analysis was the alternative — reading each component's return paths from the TypeScript
AST, which the repository already does elsewhere. It was rejected as redundant rather than
wrong: the render-time check catches every case including the conditional and array returns
static analysis cannot prove, and a second mechanism catching a subset of the same class earlier
buys less than it costs to maintain.

The original argument for a gate was that the failure would be silent — a node carrying no
attribute, discovered in the studio phases later. That stopped being true when the renderer
shipped: it throws on first render, in development, naming the block.
