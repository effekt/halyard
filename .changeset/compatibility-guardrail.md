---
"@nubbin/core": minor
---

`@nubbin/core` exports `checkCompatibility`, which answers the question the whole publish model
rests on: would this registry fail to serve an artifact a live route pointer already references?
It is `checkRollback` over every pointer instead of one artifact, and it reports the delta a
reader can act on — route, artifact hash, block, the version the page was compiled against, and
the version registered now, with `null` for a block the registry has lost. A pointer whose hash
the store cannot resolve is reported too, since that route is broken with no registry change
involved. `formatCompatibilityReport` renders it for a CI log.

It takes the pointers and artifacts a caller has read rather than an `ArtifactStore`, because a
store call inside `core` would put IO in the package whose portability is the point, and would
exclude any consumer whose live state does not sit behind that interface. `checked` is on the
report so a run that reached no pointers cannot be mistaken for one that cleared them.
