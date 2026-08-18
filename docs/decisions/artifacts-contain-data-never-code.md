---
title: "Artifacts contain data, never code"
summary: The security and performance boundary that keeps artifacts inert
status: stable
---

# Artifacts contain data, never code

No author-supplied JavaScript, no CSS blocks, no expression language, no binding strings
evaluated at render. This is a security and performance boundary, not a preference — the
alternative is executable content authored by someone positioned to assess neither risk.
Hosted visual CMSes routinely permit all four, stored as content and evaluated at render.

Repetition and logic live in components, which are code and are reviewed as code. A block
that renders a list takes the list as a prop and loops internally; the document never
expresses the loop.
