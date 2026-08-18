---
title: "Props inferred from the schema, never declared"
summary: Why a block's props type is derived, so it cannot drift
status: stable
---

# Props inferred from the schema, never declared

A hand-written props interface beside a schema is a second definition of one contract, free
to drift. `InferProps<typeof xSchema>`, exported by `core`, makes drift impossible rather
than merely discouraged. It resolves to Standard Schema's `InferOutput`, so a component sees
what `validate()` returned rather than what the author typed.
