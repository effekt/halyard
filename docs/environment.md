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
| **References** — what to install, from where, at what hash | `skills-lock.json`, and this file | Small, ours to publish, and enough to rebuild the set |
| **Content** — the skills and plugins themselves | Ignored (`.agents/`, `.claude/skills/*`) | Third-party work. Not ours to redistribute, and it arrives as symlinks git would follow |

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

Installed with `claude plugin install <name>@<marketplace>`. The ones that change output rather
than convenience:

| Plugin | What it changes |
|---|---|
| `accesslint` | Runs a WCAG 2.2 engine against a live page over CDP. Found 27 failing syntax-highlight colours and a missing `main` landmark that four reviewers had read past |
| `superpowers` | Test-driven development, systematic debugging, adversarial review, plan writing |
| `playwright` | Drives a real browser, which is what makes the accessibility scans possible |
| `context7` | Fetches current library documentation instead of relying on training data |
| `vercel` | React and Next.js guidance, used by `examples/demo` |
| `feature-dev`, `code-review`, `code-simplifier` | Review and architecture agents |
| `security-guidance`, `skill-creator`, `plugin-dev`, `frontend-design`, `github`, `commit-commands`, `claude-md-management` | Supporting |

Marketplaces: `claude-plugins-official` (`anthropics/claude-plugins-official`) and `accesslint`.

## Skills

Seven, from `vercel-labs/agent-skills`, recorded in `skills-lock.json` with a content hash each.
Reinstall them with the skills CLI; the lockfile is what makes the set reproducible.

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
| `.claude/settings.json` | Five `PostToolUse` reviewers judging what the gates cannot |

The reviewers are read when a session starts. A session that began before they existed runs
without them, and no reload command reaches them — restart to pick them up.

## Reproducing it

```bash
nvm install && nvm use
corepack enable pnpm && pnpm install
claude plugin install accesslint@accesslint
claude plugin install superpowers@claude-plugins-official
claude plugin install playwright@claude-plugins-official
# remaining plugins as listed above
```

Then install the skills in `skills-lock.json` and restart the session so the hooks load.

None of this is required to read the design or open an issue. It is required to reproduce a
result — and to have the gates catch, on your machine, what they catch here.
