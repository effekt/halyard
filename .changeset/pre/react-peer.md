---
"@nubbin/react": patch
---

Installing this package no longer installs React. It declared React as a peer dependency, which
npm installs by default, while importing nothing from it — the units it ships today resolve
holes and set values at a path, and neither renders. The peer returns with the renderer, which
is the point at which it becomes true.
