# .claude

## Rules

| Rule | Loads on | Enforces |
|---|---|---|
| [accessibility.md](rules/accessibility.md) | `examples/**` `apps/**` `packages/**/*.tsx` `**/*.html` | The accessibility decisions a gate cannot make — names, heading order, focus, colour, semantics, motion |
| [adapters.md](rules/adapters.md) | `packages/store-*/src/**` `packages/auth-*/src/**` `packages/presence-*/src/**` | What a storage, presence, or auth adapter is allowed to do, not just import |
| [block-authoring.md](rules/block-authoring.md) | `packages/**/*.block.ts` `apps/**/*.block.ts` `examples/**/*.block.ts` `packages/**/blocks/**` `apps/**/blocks/**` `examples/**/blocks/**` | How to define a whole block correctly — defaults, slots, version, docs |
| [block-schemas.md](rules/block-schemas.md) | `packages/**/*.schema.ts` `examples/**/*.schema.ts` `packages/**/blocks/**` `apps/**/blocks/**` `examples/**/blocks/**` | How to compose a block's schema from named sub-schemas without duplication |
| [dependencies.md](rules/dependencies.md) | `**/package.json` `pnpm-workspace.yaml` | Why every version is pinned, cataloged, and held to a 3-day cooldown |
| [documentation.md](rules/documentation.md) | `docs/**` `*.md` `.claude/rules/**` | Which document holds what, and how a decision propagates across all of them |
| [gates.md](rules/gates.md) | `scripts/**` `.dependency-cruiser.cjs` `biome.jsonc` `knip.jsonc` `lefthook.yml` `.github/workflows/**` | How to add or change a gate so it actually catches what it claims |
| [package-boundaries.md](rules/package-boundaries.md) | `packages/**` | What core may depend on and how adapters plug in without coupling to it |
| [planning.md](rules/planning.md) | `docs/**` `*.md` `.claude/**` | Where a plan lives, why it is never a committed file, and which surface holds each kind of durable output |
| [prose.md](rules/prose.md) | `docs/**` `*.md` `.claude/rules/**` | How a sentence earns its place — the four parts of a recorded decision, and what gets cut |
| [single-concern.md](rules/single-concern.md) | `packages/**` `apps/**` | How to spot a function doing two things when no gate would catch it |
| [source-layout.md](rules/source-layout.md) | `packages/*/src/**` `apps/*/src/**` | How files, filenames, and barrels are organized so every unit is testable |
| [testing.md](rules/testing.md) | `packages/*/src/**` `apps/*/src/**` | How every unit ships a colocated test against real schemas, not mocks |
| [writing-rules.md](rules/writing-rules.md) | `.claude/rules/**` | Template and requirements for writing a new rule under .claude/rules |

## Agents

| Agent | Use when |
|---|---|
| [adversary](agents/adversary.md) | Adversarially reviews a design, a document, or a diff — tries to falsify it rather than confirm it. Use before settling a decision, after a large change, or when something passed review too easily. |
| [builder](agents/builder.md) | Implements a package or feature against Nubbin's settled design, test-first, and verifies against the gates before claiming anything works. Use for phase work from the roadmap issues. |
| [planner](agents/planner.md) | Audits an issue against the code before anyone implements it — says whether it is still valid, gathers the paths, and returns an ordered plan. Decides nothing. Use before dispatching a builder. |
| [scout](agents/scout.md) | Read-only exploration — locates files, traces how something is wired, answers "where is X" and "what references Y" without loading the answer into the caller's context. Cheap; use freely. |

## Skills

| Skill | Use when |
|---|---|
| [decision](skills/decision/SKILL.md) | Record or change a design decision so it survives — cause, reason, decision, and what it beat — then sweep every document that argued the old position. Use when settling an open question, reversing a prior choice, or writing a file into docs/decisions/. |
| [issue](skills/issue/SKILL.md) | Open a GitHub issue that carries cause, reason, decision, choice and a close condition, after searching the open set for one that already covers it. Use when filing an issue, writing a ticket, or turning a plan into work. |
| [querying-github](skills/querying-github/SKILL.md) | Checks what a gh CLI answer actually covers before acting on it — which set it read, whether a check list is empty, what a PR will really close, and what gh put on the wire. Use when running gh pr, gh issue or gh api; before merging a PR or filing an issue; and whenever a command's output is about to become the evidence that something is done. |
| [worktree](skills/worktree/SKILL.md) | Create an isolated worktree that can run this repository's gates, before editing anything. Use when starting a change, dispatching a file-editing agent, or when check-worktree.mjs refuses an edit. |
