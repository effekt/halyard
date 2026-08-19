---
title: "Rich text is typed data, never markup"
summary: Why inline structure is a schema core owns, and what a marked string and a per-feature paragraph type each cost
status: stable
---

# Rich text is typed data, never markup

`core` exports `richText()`, a Standard Schema over an ordered array of blocks, each an ordered
array of spans. A span is `{ text, marks?, href? }` and a block is `{ kind, spans }`. Both
`marks` and `kind` are closed sets. The consumer renders the tree with a component from their
own design system; `core` ships no renderer and no CSS, and a mark names what a run *is* rather
than how it looks. Nothing in the value is parsed and nothing is evaluated at render, so
[artifacts contain data, never code](artifacts-contain-data-never-code.md) holds by
construction rather than by promise. A block declares `body: richText()`, and that call is what
makes every rich-text field in a registry findable by a scan.

The schema is hand-written against `@standard-schema/spec`, so
[`core` depends on nothing](core-depends-on-nothing.md) still holds.

## What forced it

Every text field a block declares is one opaque string, and a sentence that links a word inside
itself has nowhere to put the link. The reference pages this repository publishes lose content
to exactly that: `examples/demo/src/app/reference/about/page.tsx` carries an anchor to
`/security` inside a sentence, and `examples/demo/src/app/reference/security/page.tsx` carries
an anchor to `/changelog` and a `<strong>` clause inside two more. A page builder whose own
reference site cannot be composed from its blocks has answered the question already.

## What it beat

**A marked opaque string** holding HTML or a serialized rich-text document. Markup inside a
string is a styling channel the schema cannot see, and content that has any use for the channel
will use it. Rendering the string needs either `dangerouslySetInnerHTML` or a parser, and both
reopen sanitization — a question this model declines rather than answers.

**Refusing inline content**, treating inline structure as a block boundary and accepting the
loss. Splitting a sentence across two blocks so that a word inside it can be a link produces two
sentences, neither of which is the one that was written.

**Widening a paragraph type per inline feature** — `{ text, href? }` first, and whatever the
next page needs after that. It carries the `/about` anchor and still drops the `/security`
emphasis, so it is not one decision but a schema decision remade for every construct real
content turns out to contain. A closed mark set makes that decision once.

## What it forecloses, and the argument against it

An inline construct outside the mark set is unavailable until someone adds it as a member. An
author who wants a superscript opens an issue, and the enum is where the answer lands.

The cost is that `core` now holds an opinion about what a kind of content *is*, where every
opinion it held before was about how content is described. That is a real widening of its remit
and the strongest argument against this record. It is defensible on two grounds. The schema is
opt-in: a block that declares no `richText()` field is unaffected by any of it. And refusing the
opinion does not avoid it — it moves it, leaving every consumer to invent a rich-text shape of
their own, which puts the same decision in every codebase and agreement between none of them.
