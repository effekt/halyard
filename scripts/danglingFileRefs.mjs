// Repository files a document names inside a code span but that do not exist.
//
// `tests/documentationStructure.test.mjs` verifies that links and anchors resolve. A filename in a
// code span is neither, so `commitlint.config.js` sat in three documents — including the rule
// instructing people to reference it — while the file is `commitlint.config.mjs`. A pointer to the
// wrong filename is worse than the stale list it replaced, because it reads as authoritative.
//
// A module rather than logic inside the test, because `scaffold-issue.mjs` asks the same question
// of an issue draft that is not in the tree at all. Nine open issues cite a `docs/decisions.md`
// that became a directory, because no gate reads an issue body — and the draft has to be checked
// by the same rules the tree is, not by a second copy of them.

import { execFileSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";

const CODE_SPAN = /`([^`\n]+)`/g;
const EXTENSION = /\.(md|tsx?|m?[cj]s|jsonc?|ya?ml|grit|txt)$/;
const NOT_A_PATH = /[*<>{}()\s,|]|^@|^node:|^https?:/;

/** Entry names per directory, memoised so each directory is read once, not once per span. */
const DIR_ENTRIES = new Map();
function entriesOf(dir) {
  let entries = DIR_ENTRIES.get(dir);
  if (entries === undefined) {
    try {
      entries = new Set(readdirSync(dir));
    } catch {
      entries = new Set();
    }
    DIR_ENTRIES.set(dir, entries);
  }
  return entries;
}

const stemsOf = (dir) => new Set([...entriesOf(dir)].map((name) => name.replace(EXTENSION, "")));

/**
 * The directories a span is anchored to — empty when it names a module or a shape rather than a
 * path in this repository. Existence is checked against exactly these, so a span anchored only
 * beside its document still fails when the file exists only at the root: a coincidental hit
 * elsewhere would pass a reference that is wrong where it stands.
 *
 * A span containing `/` anchors where its first segment is an entry — that is what separates
 * `scripts/check-prose.mjs` from `next/cache.js`, a specifier Node resolves. A span without `/`
 * anchors where an entry shares its stem, which catches the observed failure: naming a real file
 * with the wrong extension. A bare filename matching nothing is left alone, since prose says
 * `index.ts` about many files that are not here.
 */
function anchorsOf(span, root, base) {
  if (NOT_A_PATH.test(span) || !EXTENSION.test(span)) return [];
  const slashed = span.includes("/");
  const key = slashed ? span.split("/")[0] : span.replace(EXTENSION, "");
  const anchors = [];
  if ((slashed ? entriesOf(root) : stemsOf(root)).has(key)) anchors.push(root);
  if (base !== root && (slashed ? entriesOf(base) : stemsOf(base)).has(key)) anchors.push(base);
  return anchors;
}

/**
 * True when git would ignore the path. A gitignored file is absent on purpose — every `CATALOG.md`
 * is generated at install — so naming one in prose is correct, and an escape comment would only
 * record that the check is too blunt.
 */
function isDeliberatelyAbsent(span, root) {
  try {
    execFileSync("git", ["check-ignore", "-q", span], { cwd: root, stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

/** @param file absolute path the text came from; spans resolve against it and against `root`. */
export function danglingFileRefs(root, file, text) {
  const base = dirname(file);
  const seen = new Set();
  const dangling = [];
  for (const [, span] of text.matchAll(CODE_SPAN)) {
    if (seen.has(span)) continue;
    const anchors = anchorsOf(span, root, base);
    if (anchors.length === 0) continue;
    seen.add(span);
    if (!anchors.some((dir) => existsSync(join(dir, span))) && !isDeliberatelyAbsent(span, root)) {
      dangling.push(span);
    }
  }
  return dangling;
}
