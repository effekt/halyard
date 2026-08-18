---
title: "Catalogs are generated and committed"
summary: Why a derived index of every unit lives in the tree instead of a gitignored path
status: stable
---

# Catalogs are generated and committed

`scripts/catalog.mjs` writes one `CATALOG.md` per package and per top-level surface. Pre-commit
regenerates them and stages the result, and `scripts/catalog.test.mjs` asserts the committed
files equal a fresh generation, so a catalog cannot describe code that has moved.

An index a reader has to run a command to see is not a read path. The map was generated into a
gitignored directory, so the question an agent needs answered first — does this already exist —
had no answer in the repository, and the answer to no answer is to write the thing again.

Deriving it is possible because three gates make filename → symbol invertible:
`check-single-export.mjs` holds a file to one unit, Biome's `useFilenamingConvention` holds the
filename to that unit's name, and `check-structure.mjs` refuses a name that describes nothing.
Every cell is quoted from the declaration or the frontmatter beside it, so no fact is written
twice and an undocumented export gets an empty cell rather than a placeholder.

Rejected: generating on demand into a gitignored path. Staleness was the reason, and pre-commit
answers it; what the gitignored form could not answer is a reader who never runs the command.
Conflicts on a branch that adds a unit are real and resolve by regenerating.

Rejected: a JSON sidecar beside the markdown. A second serialization of the same facts is a
second thing to drift, and nothing reads it that cannot read a table.
