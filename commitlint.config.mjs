/** @type {import('@commitlint/types').UserConfig} */
export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "scope-enum": [
      2,
      "always",
      ["docs", "repo", "deps", "examples", "studio", "site", "core", "next", "react", "store-fs"],
    ],
  },
};
