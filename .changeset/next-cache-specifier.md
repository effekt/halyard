---
"@nubbin/next": patch
---

The package can now be imported outside a bundler. It imported `next/cache`, a bare subpath
that resolves only through a bundler — Next ships no `exports` map and ESM does not do
extension resolution, so plain Node failed at import with `ERR_MODULE_NOT_FOUND`. Because the
package entry re-exports everything, that took the read-path functions down with it. The
specifier is now `next/cache.js`, which resolves both ways.
