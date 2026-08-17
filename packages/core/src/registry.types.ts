import type { Block } from "./block.types";

export interface Registry {
  get(name: string): Block | undefined;
  names(): string[];
  /** Hash of every block name and version. Nothing else. */
  fingerprint(): string;
}
