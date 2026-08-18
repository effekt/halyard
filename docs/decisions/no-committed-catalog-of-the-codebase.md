---
title: "No committed catalog of the codebase"
summary: Why every generated CATALOG.md is written on install and gitignored rather than tracked
status: stable
---

# No committed catalog of the codebase

`scripts/catalog.mjs` writes one `CATALOG.md` per package and one for `.claude`, quoting every
cell from the declaration or the frontmatter beside it. `pnpm install` runs it, and `.gitignore` holds a bare
`CATALOG.md` — the name is reserved for a generated index, so a new package's catalog is ignored
without anyone adding a line.

An index derived from the tree changes on every file added or renamed. Committed, that is a
conflict on every branch touching a unit, and with several branches open at once it is a conflict
on nearly every merge. The conflict carries no information: the resolution is always to
regenerate. Generating on install costs one command inside an install a checkout already runs, so
the file is present for anyone who needs it without ever being a thing two branches disagree
about.

Rejected: committing them so a reader who never runs a command still sees one. It was tried, and
the premise was wrong — nothing is asked of the reader, because the install produces them. A
gitignored file is absent in a fresh worktree only until that worktree is installed, and an
uninstalled worktree can run nothing else here either.

Rejected: a pre-commit hook regenerating and staging the output. That is what made the conflicts
certain rather than likely — two branches each staged their own catalog on every commit, so the
files collided even when the code did not.

Rejected: a JSON sidecar beside the markdown. A second serialization of the same facts is a
second thing to drift, and nothing reads it that cannot read a table.
