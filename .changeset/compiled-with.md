---
"@nubbin/core": patch
---

`compile` now stamps the real package version into `compiledWith`. Every artifact produced by
`0.1.0-rc.0` through `rc.3` recorded `0.0.0`, which is worse than recording nothing — the field
exists so an artifact says what produced it.
