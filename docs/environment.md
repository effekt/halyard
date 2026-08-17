---
title: Agent Environment
summary: The plugins, skills and toolchain this repository is worked on with, and how to reproduce them
status: stable
---

# Agent environment

Most of this repository was written by coding agents, and the tooling they run under changes what
they produce. An agent with an accessibility engine attached finds contrast failures; the same
agent without one ships them. Recording the environment is the difference between a contributor
reproducing a result and wondering why they cannot.

Two things are tracked separately, for the same reason `pnpm-lock.yaml` is committed and
`node_modules` is not:

| Layer | Tracked | Why |
|---|---|---|
| **References** — what to install, from where, at what version | `skills-lock.json`, `plugins-lock.json`, and this file | Small, ours to publish, and enough to rebuild the set |
| **Content** — the skills and plugins themselves | Ignored (`.agents/`, `.claude/skills/*`), or outside the repository entirely (`~/.claude/plugins`) | Third-party work. Not ours to redistribute, and skills arrive as symlinks git would follow |

## Language toolchain

Node 24 (`.nvmrc`) and pnpm, pinned by `packageManager` in `package.json`. Neither is optional:
the gates import TypeScript, and every git hook shells out to `pnpm`.

```bash
nvm install && nvm use          # reads .nvmrc
corepack enable pnpm            # activates the pinned pnpm
pnpm install                    # installs lefthook's hooks via `prepare`
```

If a git hook reports `pnpm: command not found`, the toolchain is not on the PATH for that
shell rather than missing.

## Plugins

Installed with `claude plugin install <name>@<marketplace>`. **`plugins-lock.json` is the
authority on which ones**, and on which marketplaces they come from — a table here would be a
second list, and the one in prose is the one nobody updates.

```bash
pnpm plugins-lock --write     # record the installed set
pnpm plugins-lock             # check the record against it
```

What the lockfile cannot tell you is why any of it is there, so: three of these change what an
agent *produces*, and the rest change how fast it gets there. A browser driver and an
accessibility engine mean contrast failures and missing landmarks get found rather than
shipped. A documentation fetcher means library APIs come from the library instead of from
training data. Design and writing skills change the shape of what gets written — a page built
with one does not resemble the same page built without it, and that difference is why the set
is recorded rather than left to whoever is at the keyboard.

`check-plugins-lock.mjs` compares by name only. The plugin manifest records a version of
`"unknown"` for anything installed from a marketplace that does not publish one, so a gate
comparing versions would fail for a reason a contributor cannot act on; version and commit are
recorded beside each entry as evidence, not as assertions. It skips where no manifest exists,
so a fresh clone passes. **It runs locally and not in CI** — a runner has no plugins installed,
so the only path it could take there is the one that checks nothing.

A marketplace being present is not the same as a plugin being installed from it. Browsing a
marketplace repository shows skills that will not load until the plugin carrying them is
installed.

## Skills

From `vercel-labs/agent-skills`, recorded in `skills-lock.json` with a content hash each.
Reinstall them with the skills CLI. **The lockfile is the authority on which ones** — naming
them here would give a reader two lists to reconcile, and the one in prose is the one nobody
updates.

**A skill is a directory, not a file.** `SKILL.md` is the entry point, and the `rules/*.md`,
`references/` and `AGENTS.md` beside it are loaded into an agent's context the same way its body
is — one skill here carries 156 files. The hash covers all of them, each under its own relative
path, so a rename and a moved paragraph both register. Hashing the entry point alone covered 7
of the 298 files installed, and appending an instruction to a `rules/*.md` file passed as
"matches, name and content".

`check-skills-lock.mjs` fails a commit where the lockfile and the installed set disagree in
either direction. Without it the lockfile is a claim about a machine no reader can see: an
entry nobody installed sends a contributor after a skill the work never used, and an
installed skill missing from the lockfile is a result nobody else can reproduce.

Where no skills are installed — a fresh clone, and CI — the comparison against disk cannot run,
so the gate checks the half that needs no disk instead: that the lockfile parses, and that every
entry carries the fields a reinstall reads. Skipping outright is what it used to do, and a
`skills-lock.json` replaced with `{ this is not valid json` exited 0 on every CI run.

**They install into the project directory** — content under `.agents/skills/`, symlinked from
`.claude/skills/`. Both are ignored. Check `git status` after installing one: three hundred
untracked files appearing at the repository root is the expected shape, and none of them belong
in a commit.

## What this repository provides itself

Committed, and loaded automatically:

| Path | What it does |
|---|---|
| `.claude/rules/*` | Judgment no gate encodes. Auto-load by path glob, so only the relevant ones cost context |
| `.claude/skills/decision` | Recording a decision so it survives — cause, reason, decision, and what it beat |
| `.claude/agents/*` | Named agents with a fixed model: `builder`, `adversary`, `scout` |
| `.claude/settings.json` | The `PostToolUse` chain — `hook-check-file.mjs`, which runs the gates that read one file, then prompt reviewers judging what no gate can encode |

The reviewers are read when a session starts. A session that began before they existed runs
without them, and no reload command reaches them — restart to pick them up.

## Reproducing it

```bash
nvm install && nvm use
corepack enable pnpm && pnpm install

# every marketplace the lockfile names, then every plugin in it
node -p 'Object.values(require("./plugins-lock.json").marketplaces).join("\n")' |
  xargs -I{} claude plugin marketplace add {}
node -p 'Object.keys(require("./plugins-lock.json").plugins).join("\n")' |
  xargs -I{} claude plugin install {}

pnpm plugins-lock             # confirms the record and your machine agree

pnpm run skills:install       # rebuilds every skill in skills-lock.json
```

Then **restart the session** so the hooks load. A plugin or hook enabled part-way through a
session is not wired for the rest of it, and nothing reports that while it is happening.

`skills:install` fetches each skill's directory from the source the lockfile names and **verifies
the digest before writing anything**. A skill whose upstream has moved since the lockfile was
written is reported and skipped, leaving whatever you already had in place — writing it and
reporting afterwards is how an agent ends up running instructions nobody recorded. The skills that
do verify still install, so one moved upstream does not leave you with none.

`--check` verifies against upstream and writes nothing at all.

It fetches the default branch, because entries record a source and a path but no commit, so a
*past* state is not reachable — [#165](https://github.com/effekt/nubbin/issues/165) is that.

None of this is required to read the design or open an issue. It is required to reproduce a
result — and to have the gates catch, on your machine, what they catch here.
