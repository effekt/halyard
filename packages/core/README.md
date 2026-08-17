# @nubbin/core

The contract every other Nubbin package is built around. It defines what a block is, keeps the
catalog and the registry apart, and compiles a page document into an immutable artifact.

It has one runtime dependency — [Standard Schema](https://standardschema.dev) — and imports no
validator, no framework and no node builtin. A build gate fails on any of the three, so the
claim that it runs in a browser, a worker and a build step is checked rather than asserted.

```bash
npm install @nubbin/core@rc
```

```ts
import { defineBlock, defineCatalog, createRegistry, compile } from "@nubbin/core";
import { z } from "zod";

const heroSchema = z.object({ title: z.string() });

export const heroBlock = defineBlock({
  name: "Hero",
  schema: heroSchema,
  component: Hero,
  version: 1,
  slots: {},
});

const artifact = compile(documentVersion, catalog, registry, "/promotions/summer");
```

Props are inferred from the schema with `InferProps<typeof heroSchema>`, so nothing declares a
block's shape twice.

**Release candidate.** The API is settled enough to build against and not yet stable.

The design record, including the paths not taken, is at
<https://effekt.github.io/nubbin/>. MIT.
