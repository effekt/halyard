import { createMemoryArtifactStore } from "./createMemoryArtifactStore";
import { runArtifactStoreContract } from "./runArtifactStoreContract";

runArtifactStoreContract("memory", async () => createMemoryArtifactStore());
