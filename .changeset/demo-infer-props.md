---
"@nubbin/core": patch
---

No runtime change. The example application now types its block props with `InferProps` from
this package rather than zod's `z.infer`, so the reference an adopter copies demonstrates the
validator-agnostic type.
