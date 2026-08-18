import type { NextConfig } from "next";

/**
 * `transpilePackages`: the studio consumes the demo's catalog, registry and blocks as
 * TypeScript source — the demo is an app and builds no dist for anyone to import.
 */
const nextConfig: NextConfig = {
  transpilePackages: ["demo"],
};

export default nextConfig;
