import type { UnknownProps } from "./block.types";

/** How a field's value resolves at render. Absent means static — the value freezes into props. */
export type FieldHintData = "request" | { revalidate: number };

/**
 * Studio treatment for one schema path. Open by design: control resolution ranks testers over
 * these hints, so a consumer can carry keys core does not read.
 */
export interface FieldHint {
  label?: string;
  control?: string;
  data?: FieldHintData;
}

export interface BlockUi {
  /** Keyed by schema path (`title`, `cta.label`, `items[].icon`). Unresolvable paths fail registration. */
  fields?: Record<string, FieldHint>;
}

export interface BlockDocs {
  summary?: string;
  usage?: string;
}

/** Serializable data only — what the studio and CI read. Components live in the registry. */
export interface CatalogEntry {
  schema: unknown;
  ui?: BlockUi;
  defaults?: UnknownProps;
  docs?: BlockDocs;
}

export type Catalog = Record<string, CatalogEntry>;
