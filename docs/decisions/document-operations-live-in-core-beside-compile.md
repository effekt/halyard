---
title: "Document operations live in core, beside compile"
summary: Why writing a document is a pure function in core rather than a studio capability
status: stable
---

# Document operations live in core, beside compile

Writing a document is a pure function over a `DocumentVersion`: `core` exports it beside
`compile`, it takes a version and returns a new one, and the editor calls it exactly as a
script would. `setNodeProp` is the first; the shipped shape is in
[the compile reference](../reference/compile.md#setnodeprop-and-setatpath).

The studio has to write documents, and nothing said where the writes lived. With the studio
as the only planned caller, the default home was inside it — which turns every write into an
editor feature. Composition is the product and the editor is one driver of it, so a later
caller — a CLI, a CI job, a fixture generator, an agent — would either reimplement the write,
free to disagree about what a valid document is, or drive a browser to avoid doing so. The
second caller is not hypothetical: the demo publishes hand-written fixture documents through
a script, with no editor anywhere in the loop.

A separate `@nubbin/authoring` package was the close alternative, and its case had two
halves. The weight half — that authoring code burdens consumers who only render — is measured
dead: a render-only application takes nothing from `core` but types, which erase, so a
production build of the demo contains none of `core`'s runtime, and pure write functions
vanish from such a build exactly as `compile` already does
([#134](https://github.com/effekt/nubbin/issues/134) holds the chunk-by-chunk numbers). The
surface half — that `core` as contract-plus-authoring is a bigger thing to explain, version
and support, and that semver binds the export list whether or not it costs bytes — was heard
and lost: one package owning the definition of a valid write beats a shorter export list.
Keeping the operations studio-private was rejected outright: it is free until a second writer
appears, and the second writer had already shipped.
