// Finding the same claim written twice, over word runs rather than lines — a paragraph copied
// and re-wrapped shares no line with its original while being the same claim.
//
// `jscpd` cannot answer this question. Pointed at raw markdown it returns a real number for the
// wrong thing: every clone it finds anchors on ```markdown fences and on the `<!-- WRONG — … -->`
// scaffolding every rule file uses, and one clone matched a file against itself at identical line
// ranges. That shape is the house style, not a duplicated claim. So the prose is extracted first —
// frontmatter, fenced blocks, HTML comments and tables removed — and the measurement runs on what
// a reader would actually read.

const FENCE = /^\s*(?:```|~~~)/;
const TABLE_ROW = /^\s*\|/;
const LINK_TARGET = /\]\([^)]*\)/g;
const COMMENT = /<!--[\s\S]*?-->/g;
const WORD = /[a-z0-9][a-z0-9'-]*/g;
const CLOSE = "-->";

/** The index of a document's closing frontmatter fence, or -1 where it has none. */
function frontmatterEnd(lines) {
  return lines[0]?.trim() === "---" ? lines.indexOf("---", 1) : -1;
}

/** Resumes a comment opened on an earlier line, returning whatever follows its close. */
function resumeComment(line, state) {
  const close = line.indexOf(CLOSE);
  if (close === -1) return "";
  state.inComment = false;
  return line.slice(close + CLOSE.length);
}

/** Drops closed comments, and opens a multi-line one where a `<!--` has no close on its line. */
function dropComments(line, state) {
  const closed = line.replace(COMMENT, "");
  const open = closed.indexOf("<!--");
  if (open === -1) return closed;
  state.inComment = true;
  return closed.slice(0, open);
}

/**
 * One line's prose, or "" where the whole line is quoted material.
 *
 * A table is stripped with the fences and comments: its cells are labels and fragments, and two
 * tables listing the same set of gates match on the set rather than on any claim about it.
 */
function proseOf(line, state) {
  if (state.inFence) {
    state.inFence = !FENCE.test(line);
    return "";
  }
  if (FENCE.test(line)) {
    state.inFence = true;
    return "";
  }
  const afterComment = state.inComment ? resumeComment(line, state) : line;
  if (TABLE_ROW.test(afterComment)) return "";
  return dropComments(afterComment, state).replace(LINK_TARGET, "]");
}

/** A document as one prose string per line, "" for every line the extraction removed. */
export function extractProse(text) {
  const lines = text.split("\n");
  const state = { inFence: false, inComment: false };
  const opens = frontmatterEnd(lines);
  return lines.map((line, index) => (index <= opens ? "" : proseOf(line, state)));
}

/** Every word of a document's prose, each carrying the line it was read from. */
function tokenize(prose, file) {
  const tokens = [];
  prose.forEach((line, index) => {
    for (const word of line.toLowerCase().matchAll(WORD)) {
      tokens.push({ word: word[0], file, line: index + 1 });
    }
  });
  return tokens;
}

/**
 * Every file's tokens in one array, separated by a marker unique to the boundary it sits on. A
 * window spanning two documents therefore contains a word that occurs exactly once and can never
 * match, which is what keeps a clone inside a single file's text. The `#` cannot begin a word
 * `WORD` produces, so no real token can collide with one.
 */
function joinCorpus(documents) {
  const all = [];
  for (const { rel, prose } of documents) {
    all.push(...tokenize(prose, rel));
    all.push({ word: `#end ${rel}`, file: rel, line: 0 });
  }
  return all;
}

/** How far two matching windows stay identical, without the later one overrunning the earlier. */
function runLength(all, earlier, later, minRun) {
  let length = minRun;
  while (
    later + length < all.length &&
    earlier + length < later &&
    all[earlier + length].word === all[later + length].word
  ) {
    length += 1;
  }
  return length;
}

/** The window of `minRun` words starting at `at`, as a single comparable key. */
function windowKey(all, at, minRun) {
  let key = "";
  for (let offset = 0; offset < minRun; offset += 1) key += `${all[at + offset].word} `;
  return key;
}

/** A clone side as `path:first-last`, using the line numbers of the file it came from. */
function where(all, at, length) {
  const start = all[at];
  const end = all[at + length - 1];
  return `${start.file}:${start.line}-${end.line}`;
}

/**
 * Every maximal run of words that occurs twice in the corpus, as readable rows.
 *
 * A window is only matched against one that ends before it starts, so a phrase repeated inside its
 * own window cannot report itself — the failure mode that had `jscpd` matching a document against
 * itself at identical line ranges.
 */
export function findClones(documents, minRun) {
  const all = joinCorpus(documents);
  const seen = new Map();
  const clones = [];
  let at = 0;
  while (at + minRun <= all.length) {
    const key = windowKey(all, at, minRun);
    const earlier = seen.get(key);
    if (earlier === undefined || earlier + minRun > at) {
      if (earlier === undefined) seen.set(key, at);
      at += 1;
      continue;
    }
    const length = runLength(all, earlier, at, minRun);
    const words = [];
    for (let offset = 0; offset < length; offset += 1) words.push(all[earlier + offset].word);
    clones.push({
      sides: `${where(all, earlier, length)}  ≡  ${where(all, at, length)}`,
      length,
      words: words.join(" "),
    });
    at += length;
  }
  return { clones, words: all.length - documents.length };
}
