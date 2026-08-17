---
"@nubbin/core": patch
---

Tooling only. Every package is now installed from its own tarball into an empty project and
imported before a release, so a package that resolves in the workspace but not on a consumer's
disk fails a gate rather than a user.
