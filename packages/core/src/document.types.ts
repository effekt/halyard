import type { UnknownProps } from "./block.types";

export interface DocumentMeta {
  title: string;
  description?: string;
  robots?: string;
  canonical?: string;
}

/** The authoring shape: children are id references, so every editor operation is by id. */
export interface Node {
  id: string;
  block: string;
  props: UnknownProps;
  /** Slot name → ordered child ids. */
  slots?: Record<string, readonly string[]>;
}

export interface DocumentVersion {
  documentId: string;
  version: number;
  /**
   * Ordered entry elements — the artifact's tree is these, denormalized, in this order. See
   * [A document has many roots](../../../docs/decisions/a-document-has-many-roots.md).
   */
  roots: readonly string[];
  elements: Record<string, Node>;
  meta: DocumentMeta;
  createdAt: string;
  createdBy: string;
}
