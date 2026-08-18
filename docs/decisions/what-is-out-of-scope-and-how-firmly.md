---
title: "What is out of scope, and how firmly"
summary: Three boundaries, their reasons, and which one is load-bearing
status: stable
---

# What is out of scope, and how firmly

Three things are out of scope by construction rather than by backlog. Each is recorded with
its reason, because a boundary nobody can re-derive is one a later maintainer has to take on
faith — and these have reasons that can be checked.

| Out of scope | Because | How firm |
|---|---|---|
| **Executable content** — author JavaScript, CSS blocks, an expression language, binding strings evaluated at render | Each one lets a person who cannot assess a security or performance risk ship one to production. Accepting any of them means an artifact is no longer inert data. | **Load-bearing.** The rendering and caching model rests on artifacts being inert; removing this means redesigning both. |
| **Structured data that is not a page** — rows consumed through typed transforms | That is a database with an editing UI. A good one is a different product with different primitives, and building both makes each worse. | Scope. A separable concern, not a contradiction. |
| **Templates that generate many routes from bound state** | The route table stops being enumerable, so nothing can answer what URLs exist. | Scope. A design keeping routes enumerable would be worth hearing. |

The distinction matters for contributors: the first cannot move without a different
architecture, while the second and third are judgments about what this project is. Arguing the
latter two is legitimate — open an issue.
