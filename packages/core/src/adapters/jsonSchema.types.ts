import type { FieldNode } from "../field.types";
/**
 * A JSON Schema node as the walker sees it: plain data whose keys are read one at a time and
 * narrowed at each read. Wide on purpose — the projection is produced by the validator, and the
 * walker trusts nothing about its shape beyond what it checks.
 */
export type JsonSchemaNode = Record<string, unknown>;

/** How a walker descends into a nested node. Injected so a recursive walk can be
 * split across files without the files importing one another in a cycle. */
export type Descend = (node: JsonSchemaNode, basePath: string) => FieldNode[];
