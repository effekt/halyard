---
title: "Layout is ordinary props, and Nubbin ships no CSS"
summary: Why what a styling value means is resolved by the consumer's design system
status: stable
---

# Layout is ordinary props, and Nubbin ships no CSS

A value like `space: "lg"` passes through as data. What it *means* is resolved by the
consumer's component, in their codebase, with their design system.

Rejected: shipping a token scale. It was a smaller opinion than emitting utility classes but
the same category of mistake, and it fails the case that matters — a consumer redefining
what `"lg"` means without regenerating anything.

The constraint that protects the design system lives in the schema instead:
`z.enum(["none","sm","md","lg"])` is a closed set with no path to express anything else.
Crucially it constrains the **block schema**, the author-facing surface — not the design
system's own props, which stay as open as they need to be.
