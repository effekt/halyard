---
title: "A copy-once document is a preset, not a template"
summary: Why the copy-once kind names a starting point with no ongoing link to its source
status: stable
---

# A copy-once document is a preset, not a template

Atomic Design defines a template as page-level structure articulating a layout, and a page as
an instance of one with real content. That is Nubbin's **Layout**. Nubbin's copy-once
document — cloned as a starting point, with no ongoing relationship to its source — has no
Atomic Design equivalent, because propagation is a persistence concern a design methodology
never confronts.

`kind: "preset"` is that value. Most frontend developers carry Frost's meaning, so
`kind: "template"` invites the expectation that editing one updates the pages made from it,
and **the mistake is silent**: nothing happens, and nothing says why.

`starter` and `blueprint` were the other candidates. `preset` won because it implies a
starting configuration with no implied ongoing link, which is exactly the distinction being
protected. `layout` is unchanged — it is the commoner CMS word and it does not clash.

Deciding this after documents exist would cost a data migration on a stored enum plus a rename
across every surface, which is why it was settled before the first phase writes a real `kind`.
