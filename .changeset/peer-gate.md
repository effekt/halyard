---
"@nubbin/core": patch
---

Tooling only. A package declaring a peer dependency nothing in it imports now fails a gate.
npm installs peers by default, so an unused one is something a consumer receives for nothing.
