---
title: Superseded terminology
summary: Names a decision replaced, kept permanently so old branches and old comments stay legible
status: reference
---

# Superseded terminology

Every row is a name a decision replaced. Rows are **permanent** — knowing what a thing used
to be called is what makes an old branch, an old comment, or an old issue readable a year
later. A decision that renames something adds its row in the same commit.

## When a rename earns a row

Not every rename does. A name needs recording once it has **escaped** — into a release, a
published document, or a branch someone else works from. Renaming something that never left
a draft is just editing, and a row for it is noise that makes the real rows harder to see.

This table was deliberately empty while the repository was private, on exactly that
reasoning. Publishing the design is what changed it: the documents below are now the
published artifact, the old names appear in them as marked historical references, and a
contributor can reintroduce one without knowing it was ever decided against. That is the
regression the gate exists to catch.

`check-superseded.mjs` rejects the left column anywhere under `docs/`, `.claude/rules/`, or
the root markdown files. Two escapes exist for deliberate historical references, which are
expected — a document that explains what changed has to name the old thing:

- `<!-- superseded-ok -->` on the line
- a heading containing **Historical** or **Superseded**, covering the section beneath it

Prefer the heading for a section, the comment for a single sentence. The matcher is a
case-insensitive substring and has no awareness of code fences, so an example inside a fence
needs an escape like any other line.

| Superseded | Use | Why it changed |
|---|---|---|
| `manifest entry` | route pointer | One mutable manifest document permitted a silent lost update — two concurrent publishes to different routes would read the same document and the second write would drop the first. Route pointers are independently-writable records, one per route. |
| `publishedVersion: null` | the absence of a route pointer | A stored publication flag duplicated a fact the route pointer already owns, which meant it could disagree with what was actually live. It is derived on read instead. |
| `data: "static"` | `data` on a field | The lifecycle hint was block-level and therefore all-or-nothing: a block with a fixed headline and a live price had to choose between freezing the price and re-fetching the headline. It moved to the field. |

`manifest()` is **not** superseded — it survives as an advisory aggregation read across every
route pointer. What went away is the manifest as a stored, mutable document.
