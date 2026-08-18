// Every gate script `pnpm verify` reaches, at any depth, asked of `package.json` rather than
// listed by hand.
//
// Two checks need this walk and each having its own copy is how they would come to disagree:
// `check-gate-table.mjs` reconciles it against the table in `docs/gates.md`, and
// `check-ci-parity.mjs` reconciles it against the workflow. A second copy would drift toward
// whichever caller was edited last, and both would keep printing a tick.
//
// The `scripts/*.mjs` filename is the key, never the invoked name. The two sides spell the same
// gate differently — `pnpm a11y` against `node scripts/check-a11y.mjs`, `pnpm lint` against
// `pnpm exec biome` — so a name-keyed comparison reports gaps that are spelling and not absence.

const SCRIPT_FILE = /scripts\/([A-Za-z0-9._-]+\.mjs)/g;
const PNPM_CALL = /pnpm (?:run )?([A-Za-z0-9:_-]+)/g;
/** A binary invoked directly, as `pnpm exec biome` or at the head of a chained command. */
const DIRECT_BINARY = /(?:^|&&|\|\|)\s*(?:pnpm exec )?([a-z-]+)/g;

export function captures(text, pattern) {
  return [...text.matchAll(pattern)].map((match) => match[1]);
}

/** Every name a command invokes, whether or not a script of that name exists. */
function invokedNames(cmd) {
  return [...captures(cmd, PNPM_CALL), ...captures(cmd, DIRECT_BINARY)];
}

/**
 * Records one command's script files and the names it invokes, and returns the script bodies
 * it newly reaches. Split out because the nesting, not the logic, is what carries the
 * complexity — the whole walk in one function scores past the cap.
 */
function stepOnce(cmd, scripts, files, names) {
  for (const file of captures(cmd, SCRIPT_FILE)) files.add(file);
  const reached = [];
  for (const name of invokedNames(cmd)) {
    if (names.has(name)) continue;
    names.add(name);
    if (scripts[name]) reached.push(scripts[name]);
  }
  return reached;
}

/**
 * Every `scripts/*.mjs` and every script name the given commands reach, at any depth.
 *
 * A queue rather than recursion, and no depth guard: `names` already admits each script once,
 * which is what bounds the walk.
 *
 * Both sides of a parity check must be walked, not only `verify`. A workflow step spells a gate
 * `pnpm skills-lock` where `verify` spells it `pnpm run skills-lock`, and `pnpm publishable`
 * reaches three scripts it never names — reading one side as filenames and the other as text
 * reports absences that are indirection.
 */
export function reachableFrom(seeds, scripts) {
  const files = new Set();
  const names = new Set();
  const pending = [...seeds];
  while (pending.length > 0) {
    const cmd = pending.pop();
    if (cmd) pending.push(...stepOnce(cmd, scripts, files, names));
  }
  return { files, names };
}

/** The whole of `verify`, which is the set every other surface is measured against. */
export function reachableFromVerify(scripts) {
  return reachableFrom([scripts.verify], scripts);
}
