#!/usr/bin/env node

// Writes `NUBBIN_VERSION` from the version in `packages/core/package.json`.
//
// `compile` stamps it into every artifact as `compiledWith`, so an artifact records what produced
// it. The constant was hand-written and never moved: `0.1.0-rc.0` shipped stamping `0.0.0`, which
// makes the field worse than absent — it looks like an answer.
//
// Generated rather than asserted, because changesets bumps the manifest and nothing else. A check
// that only complained would fail every release and be fixed by hand each time. The assertion that
// the file on disk is what this would write lives in `tests/coreVersionStamp.test.mjs`, where the
// runner owns the verdict.
//
// Usage: node scripts/sync-core-version.mjs

import { writeFile } from "node:fs/promises";
import { coreVersionConstant } from "./coreVersionConstant.mjs";

const { version, text, file } = await coreVersionConstant();
await writeFile(file, text);
console.log(`✅ NUBBIN_VERSION set to ${version}.`);
