/**
 * A JSON Schema node as the walker sees it: plain data whose keys are read one at a time and
 * narrowed at each read. Wide on purpose — the projection is produced by the validator, and the
 * walker trusts nothing about its shape beyond what it checks.
 */
export type JsonSchemaNode = Record<string, unknown>;
