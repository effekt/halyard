import { join } from "node:path";

/** Content-addressed, so the hash is the whole filename — nothing else disambiguates it. */
export function artifactPath(root: string, hash: string): string {
  return join(root, "artifacts", `${hash}.json`);
}
