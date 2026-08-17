---
"@nubbin/react": minor
---

`@nubbin/react` exports `BlockComponent`, `BlockRegistry` and `defineRegistry`. A block author
names their own component type as `BlockComponent<HeroProps>`; the registry holds
`BlockComponent<never>`, so a component declaring its own props is assignable to it — function
parameters are contravariant, and the widest props type is assignable from nothing. Installing
this package now installs React, because these types import `ReactNode`.
