---
title: "Catalog and registry are separate"
summary: Why serializable data for the studio and lazy imports for the app are two structures
status: stable
---

# Catalog and registry are separate

The catalog is serializable data the studio reads; the registry maps a block name to a lazy
import the app resolves. A flat array of components makes every page carry every block.

Splitting them means a route loads only what its artifact names, so the hundredth block
costs pages that do not use it nothing — and validation can run in CI with no React present.
