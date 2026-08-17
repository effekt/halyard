---
"@nubbin/core": minor
---

`createRegistry` resolves every slot `allow` entry against the blocks it holds and throws on one
that matches none, naming each unresolvable entry with its block and slot. An entry naming no
registered block used to produce a slot that rejected every child forever, including the one the
author meant. Resolution runs once the whole array is ingested, so a block may still name a
sibling declared after it.
