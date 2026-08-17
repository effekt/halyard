import { join } from "node:path";
import { createFsArtifactStore } from "@nubbin/store-fs";

/** cwd is `examples/demo` for both the scripts and the Next server, so both see one store. */
export const demoStore = createFsArtifactStore(join(process.cwd(), ".nubbin"));
