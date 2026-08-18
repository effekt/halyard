---
title: "Gates enforce, rules judge"
summary: Where a mechanical check ends and written judgment begins
status: stable
---

# Gates enforce, rules judge

Anything mechanically checkable is a script or a lint rule, so it cannot be forgotten or
argued with. What remains — whether a step inside a function deserves its own name — is
written down in `.claude/rules/` and reviewed by a hook, because no gate can encode it.

The `logMessage` case is the proof: a function that formats its own timestamp inline is one
declaration, eight lines, complexity 1. Every gate passes it. It is still wrong.
