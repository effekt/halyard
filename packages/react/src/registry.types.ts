import type { UnknownProps } from "@nubbin/core";
import type { ReactNode } from "react";

/**
 * `P` is the block's own props, so a block author has a name for their component —
 * `BlockComponent<HeroProps>`. Async is allowed because rendering happens on the server.
 */
export type BlockComponent<P extends UnknownProps = UnknownProps> = (
  props: P,
) => ReactNode | Promise<ReactNode>;

/**
 * name → lazy importer. A literal map of `import()` calls, so the bundler emits a chunk per block.
 *
 * The stored props type is `never` because parameters are contravariant: a component that reads
 * `title` cannot stand in for one obliged to accept any record, so `BlockComponent<UnknownProps>`
 * here would reject every real block ([#88](https://github.com/effekt/nubbin/issues/88)). The
 * render site widens back with a single cast, because it is what holds the props compile
 * validated against the block's schema.
 */
export type BlockRegistry = Record<string, () => Promise<BlockComponent<never>>>;
