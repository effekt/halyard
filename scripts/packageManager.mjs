// How to re-invoke the package manager that started a script.
//
// `npm_execpath` is the one honest answer to "which pnpm packed this": a bare `pnpm` resolves
// against a different PATH than the caller. What the variable *names*, though, depends on how
// pnpm was installed. npm and corepack put a JavaScript entry point there, which runs only
// under `node`; a standalone release — what `pnpm/setup` installs on a runner — puts a native
// executable there, or simply the name `pnpm`.
//
// Two scanners each assumed the first form and spawned `node <npm_execpath>` unconditionally.
// Against the second, `node` resolves the value as a module path relative to the workspace
// root and exits with `Cannot find module '<root>/pnpm'` — a message naming neither pnpm nor
// the check that asked for it. It survived every local run, because a corepack-installed pnpm
// is JavaScript and only CI installs the other kind; the divergence is invisible until a
// runner disagrees with a laptop.

/**
 * The package manager that started this process, as `[command, leadingArgs]` ready to spread
 * into `execFileSync`. Falls back to a bare `pnpm` when nothing launched the script.
 */
export function packageManagerCommand() {
  const execpath = process.env.npm_execpath;
  if (!execpath) return ["pnpm", []];
  // A JavaScript entry point needs the interpreter; an executable is spawned as it stands.
  return /\.[cm]?js$/.test(execpath) ? [process.execPath, [execpath]] : [execpath, []];
}
