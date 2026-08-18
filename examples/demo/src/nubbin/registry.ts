import { createRegistry } from "@nubbin/core";
import { BLOCKS } from "./blocks.constants";

/**
 * Schemas and components together — what `compile` validates a document against, and what its
 * `registryFingerprint` is taken over. Publishing needs this; rendering does not.
 */
export const registry = createRegistry(BLOCKS);
