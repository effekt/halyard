# @nubbin/core

The Nubbin contract: define blocks, split catalog from registry, and compile a page document into an immutable artifact.

| Export | Kind | Summary |
|---|---|---|
| [`fieldNodeAt`](src/adapters/fieldNodeAt.ts) | fn | Builds the FieldNode for one schema node, attaching members only when the kind is enum. |
| [`isJsonSchemaNode`](src/adapters/isJsonSchemaNode.ts) | fn | Narrows a raw JSON Schema value to a node the walker can read keys from. |
| [`isStandardJsonSchemaCapable`](src/adapters/isStandardJsonSchemaCapable.ts) | fn | True when a schema exposes the Standard JSON Schema converter — the only door the adapter reads a schema through, so… |
| [`JsonSchemaNode`](src/adapters/jsonSchema.types.ts) `Descend` | type | A JSON Schema node as the walker sees it: plain data whose keys are read one at a time and narrowed at each read. |
| [`kindOfJsonSchema`](src/adapters/kindOfJsonSchema.ts) | fn | Maps one JSON Schema node to the field kind the studio renders it as. |
| [`projectJsonSchema`](src/adapters/projectJsonSchema.ts) | fn | Projects a schema to JSON Schema through the Standard JSON Schema converter. |
| [`resolveHintPaths`](src/adapters/resolveHintPaths.ts) | fn | A hint keyed to a path the schema does not have is invisible at runtime: the inspector falls back to default treatment… |
| [`walkArrayItems`](src/adapters/walkArrayItems.ts) | fn | Emits the row shape at `path[]`, then the fields beneath it, so hints can target rows. |
| [`walkJsonSchema`](src/adapters/walkJsonSchema.ts) | fn | Emits the fields beneath one JSON Schema node. |
| [`walkObjectProperties`](src/adapters/walkObjectProperties.ts) | fn | Emits one field per property, then the fields beneath it, using dotted paths. |
| [`walkUnionBranches`](src/adapters/walkUnionBranches.ts) | fn | Emits the fields of every branch under the union's own path, so hints reach branch fields. |
| [`zodAdapter`](src/adapters/zodAdapter.ts) | const | Reads a zod schema for the studio and hint resolution, entirely through the Standard JSON Schema converter the schema… |
| [`Artifact`](src/artifact.types.ts) `Holes` `ResolveNode` `ArtifactNode` `RoutePointer` `Manifest` `ArtifactStore` | type | The compiled result of one document version. |
| [`artifactNodeOf`](src/artifactNodeOf.ts) | fn | Builds one resolved node, slots wired later. |
| [`assertBlockVersion`](src/assertBlockVersion.ts) | fn | A block version below 1 has no artifact that could record it. |
| [`assertDataHintAddressable`](src/assertDataHintAddressable.ts) | fn | A `data` hint turns its field into a hole resolved at render, and a hole addresses one object field — `[]` names every… |
| [`assertMigrateKeys`](src/assertMigrateKeys.ts) | fn | A migrate key must name a version this block actually reaches: 2 up to its current version. |
| [`assertSlotAllows`](src/assertSlotAllows.ts) | fn | An `allow` entry matching no registered block is silent and inverted: the slot rejects every child forever, including… |
| [`assertSlotBounds`](src/assertSlotBounds.ts) | fn | A slot whose min exceeds its max is one no composition could satisfy. |
| [`assertValidDefaults`](src/assertValidDefaults.ts) | fn | `defaults` is what a freshly dropped block renders with, so defaults that fail their own schema produce a block that is… |
| [`Block`](src/block.types.ts) `UnknownProps` `InferProps` `SlotConstraint` | type |  |
| [`Catalog`](src/catalog.types.ts) `FieldHintData` `FieldHint` `BlockUi` `BlockDocs` `CatalogEntry` | type |  |
| [`checkRollback`](src/checkRollback.ts) | fn | Compares what the artifact was compiled against with the registry live now. |
| [`compile`](src/compile.ts) | fn | Orchestration only. |
| [`CompileError`](src/CompileError.ts) | class | Carries every issue found in one pass, so an author fixing six problems sees six. |
| [`CompileIssueCode`](src/compileError.types.ts) `CompileIssue` | type |  |
| [`createRegistry`](src/createRegistry.ts) | fn | Sorted by name so registration order cannot change the fingerprint, and built from name and version alone so unrelated… |
| [`defineBlock`](src/defineBlock.ts) | fn | Identity at runtime; its job is to fix the generic parameters at the call site so props are inferred from the schema… |
| [`defineCatalog`](src/defineCatalog.ts) | fn | The serializable half of the catalog/registry split: schema, ui, defaults, docs — no components. |
| [`denormalize`](src/denormalize.ts) | fn | Resolves the flat `{root, elements}` index into a self-contained tree. |
| [`disallowedChildren`](src/disallowedChildren.ts) | fn | Flags each child whose block the slot's allow list rejects. |
| [`DocumentMeta`](src/document.types.ts) `Node` `DocumentVersion` | type |  |
| [`FieldKind`](src/field.types.ts) `FieldNode` `SchemaAdapter` | type |  |
| [`findCycles`](src/findCycles.ts) | fn | Iterative depth-first walk carrying a visiting set — recursion risks a stack overflow on a deep document and gives a… |
| [`findDanglingChildren`](src/findDanglingChildren.ts) | fn | A slot referencing an id with no element would silently vanish at denormalization. |
| [`findSlotViolations`](src/findSlotViolations.ts) | fn | Checks the union of declared and filled slot names, so a required slot a node omits entirely is caught as surely as one… |
| [`findUnknownBlocks`](src/findUnknownBlocks.ts) | fn | A node naming a block the registry lacks can never resolve to a component. |
| [`findUnreachable`](src/findUnreachable.ts) | fn | A node no slot reaches would be dropped silently by denormalization, so it is an error here. |
| [`fnv1a`](src/fnv1a.ts) | fn | FNV-1a, 32-bit. |
| [`formatIssuePath`](src/formatIssuePath.ts) | fn | Joins a Standard Schema issue path into the dotted form hints and field nodes use. |
| [`SlotEdge`](src/graph.types.ts) `CycleState` `CycleFrame` | type | One parent-to-child slot reference, flattened for walking. |
| [`hashArtifact`](src/hashArtifact.ts) | fn | Serializes with sorted keys before hashing — object key order reflects insertion order, which is a compilation… |
| [`isStandardSchema`](src/isStandardSchema.ts) | fn | Narrows to a schema exposing `~standard.validate` — the one door validation goes through, whichever validator the… |
| [`isUnknownProps`](src/isUnknownProps.ts) | fn | Narrows a parsed value to a props record. |
| [`parseMatchKind`](src/parseMatchKind.ts) | fn | matchKind is parsed from the route at publish, never caller-supplied. |
| [`partitionProps`](src/partitionProps.ts) | fn | Splits validated props by `ui.fields[key].data`: absent means static and the value freezes into `props`; `request` or… |
| [`pushCycleFrame`](src/pushCycleFrame.ts) | fn | Opens one node in the depth-first walk: marks it visiting and stacks its edges. |
| [`reachableIds`](src/reachableIds.ts) | fn | Every id a slot walk from the root can reach, whether or not an element backs it. |
| [`Registry`](src/registry.types.ts) | type |  |
| [`resolveAllProps`](src/resolveAllProps.ts) | fn | Validates and partitions every node's props in one pass, collecting issues instead of stopping at the first, so compile… |
| [`RollbackCheck`](src/rollback.types.ts) | type |  |
| [`setAtPath`](src/setAtPath.ts) | fn | Copy-on-write down one dotted path. |
| [`setNodeProp`](src/setNodeProp.ts) | fn | The first document operation: a new `DocumentVersion` with one prop set on one node, copy-on-write, every other node… |
| [`slotBoundIssues`](src/slotBoundIssues.ts) | fn | Checks a slot's occupancy against its declared bounds, driven by data so min and max share one shape. |
| [`slotEdges`](src/slotEdges.ts) | fn | Flattens a node's slots into one edge list, so walkers loop once instead of twice. |
| [`slotIssuesAt`](src/slotIssuesAt.ts) | fn | Checks one filled slot against its declared constraint: existence, bounds, and allow list. |
| [`standardValidate`](src/standardValidate.ts) | fn | Runs the real schema's `validate()` — never the JSON Schema projection. |
| [`unknownAllowEntries`](src/unknownAllowEntries.ts) | fn | Every `allow` entry on this block that `known` does not resolve, quoted with its slot. |
| [`usedBlockVersions`](src/usedBlockVersions.ts) | fn | Only the blocks the document names — a route loads what its artifact lists, so naming unused blocks would load them too. |
| [`validateNodeProps`](src/validateNodeProps.ts) | fn | Validates one node's draft props against the real schema and returns the value `validate()` parsed — never the input… |
| [`validateStructure`](src/validateStructure.ts) | fn | Returns issues rather than throwing, so compile can report every structural problem in one pass — an author fixing six… |
| [`NUBBIN_VERSION`](src/version.constants.ts) | const | Stamped into every artifact as `compiledWith`, so an artifact records what produced it. |
| [`wireSlots`](src/wireSlots.ts) | fn | Second pass of denormalization: replaces child ids with the built nodes they name. |
