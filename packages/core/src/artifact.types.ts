import type { UnknownProps } from "./block.types";
import type { FieldHintData } from "./catalog.types";
import type { DocumentMeta, Node } from "./document.types";

/** Field path → how the field resolves at render. */
export type Holes = Record<string, FieldHintData>;

/** Per-node validation and partitioning, injected into `denormalize` so the walk stays pure. */
export type ResolveNode = (node: Node) => { props: UnknownProps; holes: Holes };

/** Resolved — no lookups, no dangling references possible. */
export interface ArtifactNode {
  id: string;
  block: string;
  /** Frozen fields only — literal values. */
  props: UnknownProps;
  holes?: Holes;
  slots?: Record<string, ArtifactNode[]>;
}

/** The compiled result of one document version. Immutable and content-addressed. */
export interface Artifact {
  /** Content address — the identity. */
  hash: string;
  route: string;
  documentId: string;
  documentVersion: number;
  registryFingerprint: string;
  /** What this was compiled against — only the blocks the document uses. */
  blockVersions: Record<string, number>;
  tree: ArtifactNode[];
  meta: DocumentMeta;
  compiledWith: string;
}

/** The only mutable state in the output layer — one independently-writable record per route. */
export interface RoutePointer {
  route: string;
  matchKind: "exact" | "param" | "prefix";
  /** Artifact currently live at this route. */
  hash: string;
  updatedAt: string;
}

/** Advisory aggregation over every pointer, for the studio's route list and CI. */
export interface Manifest {
  routes: RoutePointer[];
  generatedAt: string;
}

/** The output layer's whole IO surface. Adapters implement it; core only returns values for it. */
export interface ArtifactStore {
  read(hash: string): Promise<Artifact | null>;
  write(artifact: Artifact): Promise<void>;
  manifest(): Promise<Manifest>;
  pointer(route: string): Promise<RoutePointer | null>;
  publish(route: string, hash: string): Promise<void>;
  unpublish(route: string): Promise<void>;
}
