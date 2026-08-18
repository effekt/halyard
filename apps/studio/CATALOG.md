# studio

The Nubbin editor's first vertical slice: parse a catalog, preview a draft, publish an artifact.

| Export | Kind | Summary |
|---|---|---|
| [`GET`](src/app/api/artifact/[[...slug]]/route.ts) | fn | The slice's other publish path: the compiled artifact itself, as a file the caller can carry to any store. |
| [`POST`](src/app/api/edit/route.ts) | fn | One field commit. |
| [`POST`](src/app/api/publish/route.ts) | fn | Unauthenticated on purpose: the studio deploys behind the consumer's own gate — a VPN, a reverse proxy, existing auth —… |
| [`RootLayout`](src/app/layout.tsx) `metadata` | component |  |
| [`Page`](src/app/page.tsx) | component | Everything on this page is derived: routes from the demo's fixtures, blocks and fields from its catalog's schemas. |
| [`Page`](src/app/preview/[[...slug]]/page.tsx) | component | The demo's own render path — `compile` into `Renderer` with the demo's block registry — given the current draft instead… |
| [`BlockFields`](src/components/BlockFields.tsx) | component | One palette entry: the field rows are read from the schema itself, never authored beside it. |
| [`BooleanField`](src/components/BooleanField.tsx) | component | A checkbox commits the moment it changes — there is no typing to wait out. |
| [`EnumField`](src/components/EnumField.tsx) | component | Enum members come from the schema itself, so the select cannot offer a value the validator would refuse. |
| [`FieldControl`](src/components/FieldControl.tsx) | component | One field row: the control for the field's kind, holding the last rejection the compiler returned for it. |
| [`EditableFieldProps`](src/components/fieldControl.types.ts) | type | What every editable control receives: its field, the last rejection, and the commit. |
| [`FieldRow`](src/components/FieldRow.tsx) | component | The shared shell of every control: the field's path as its label, the control itself, and the compiler's rejection when… |
| [`Inspector`](src/components/Inspector.tsx) | component | The panel beside the canvas: pick a node, then edit its fields. |
| [`NodePicker`](src/components/NodePicker.tsx) | component | Every node in the draft as a real button — the keyboard's path to selection, beside the canvas's click-to-select. |
| [`NumberField`](src/components/NumberField.tsx) | component | Numbers commit on blur, as parsed numbers — an empty or unchanged input commits nothing. |
| [`PreviewEditor`](src/components/PreviewEditor.tsx) | component | The editing shell around the rendered draft: canvas left, inspector right, selection shared between them, and a server… |
| [`PreviewToolbar`](src/components/PreviewToolbar.tsx) | component | Chrome above the rendered draft: where it points, what publishing it would do, and both publish paths — the store and… |
| [`ReadOnlyField`](src/components/ReadOnlyField.tsx) | component | The kinds without a single control — `array`, `object`, `union`, `unknown`, and any `items[]` path — shown as data… |
| [`StringField`](src/components/StringField.tsx) | component | Strings commit on blur, not per keystroke — the preview refreshes on commit… |
| [`useCanvasPick`](src/components/useCanvasPick.ts) | fn | Selection by pointing at the page itself: a capture-phase listener reads the `data-nubbin-node` the renderer stamps on… |
| [`useSelectionMark`](src/components/useSelectionMark.ts) | fn | Marks the selected block in the canvas so the stylesheet can outline it. |
| [`commitDraftEdit`](src/nubbin/commitDraftEdit.ts) `DraftEditRejection` | fn | The commit half of editing: apply one field edit, compile the result, and keep it only if it compiled — the preview… |
| [`compileDraft`](src/nubbin/compileDraft.ts) | fn | The studio's compile seam: the current draft — fixture plus in-process edits — against the demo's own catalog and… |
| [`compileVersion`](src/nubbin/compileVersion.ts) | fn | One compile seam for stored drafts and candidate edits alike: the demo's catalog and registry are what this studio… |
| [`draftFilePath`](src/nubbin/draftFilePath.ts) | fn | One draft file per route. |
| [`draftsDir`](src/nubbin/draftsDir.ts) | fn | Where the studio's drafts survive a restart: a gitignored directory beside the app, one file per route, overwritten in… |
| [`InspectorField`](src/nubbin/inspector.types.ts) `InspectorNode` | type | One schema field with the draft's current value beneath it, ready for a field control. |
| [`isAddressablePath`](src/nubbin/isAddressablePath.ts) | fn | Whether a client-supplied path names something `setNodeProp` can address: every dotted segment a non-empty field name,… |
| [`isEditableField`](src/nubbin/isEditableField.ts) | fn | The kinds this slice commits from a single control. |
| [`parseDraftEdit`](src/nubbin/parseDraftEdit.ts) `DraftEdit` | fn | Checks an untrusted request body against the edit shape — `undefined` over a throw, so the endpoint answers a malformed… |
| [`postDraftEdit`](src/nubbin/postDraftEdit.ts) | fn | The client half of a commit: one field edit posted to the studio's edit endpoint. |
| [`prefixedRoute`](src/nubbin/prefixedRoute.ts) | fn | `/` maps to the bare prefix — `/preview/` and `/preview` are different URLs to Next. |
| [`previewNowPayload`](src/nubbin/previewNowPayload.ts) | fn | In-process source for what the demo's `/api/now` serves over HTTP, so a preview needs no demo server running. |
| [`publishDraft`](src/nubbin/publishDraft.ts) | fn | Write, then move the pointer — a pointer at an unwritten hash is a live 404, and the store rejects it. |
| [`publishState`](src/nubbin/publishState.ts) | fn | One toolbar line: how the store's pointer relates to this draft's compile. |
| [`readDraft`](src/nubbin/readDraft.ts) | fn | The current draft for a route: the committed fixture, overlaid by the draft file the last committed edit wrote — so an… |
| [`readDraftFile`](src/nubbin/readDraftFile.ts) | fn | ENOENT is a value — a route nothing ever edited reads as `undefined`, so it falls back to its committed fixture. |
| [`resolveStudioHole`](src/nubbin/resolveStudioHole.ts) | const | Always fresh, never fetched: a draft preview answers "what would this page say now", so both hole kinds resolve per… |
| [`studioStore`](src/nubbin/studioStore.ts) | const | The demo's own store, reached from the studio's cwd (`apps/studio`): this studio edits the demo site, so publishing… |
| [`toInspectorNodes`](src/nubbin/toInspectorNodes.ts) | fn | The inspector's whole input, derived per render: every node in the draft, each field read from the block's schema and… |
| [`valueAtPath`](src/nubbin/valueAtPath.ts) | fn | Reads the value beneath one dotted path — `undefined` for anything unset, and for an `items[]` segment, which names… |
| [`withFieldValue`](src/nubbin/withFieldValue.ts) | fn | Pairs one described field with the value the draft currently holds at its path. |
| [`writeDraftFile`](src/nubbin/writeDraftFile.ts) | fn | Overwrite in place — the slot holds one draft per route and no history. |
