---
title: "Content is not in git"
summary: Why git is at most a write-only mirror, never the primary store
status: stable
---

# Content is not in git

Considered seriously, because git gives content one identity and one history. Rejected as
the primary store: publishing would become a deploy, non-technical authors would need
repository access, and JSON merge conflicts would be authored by people who cannot resolve
them.

Environment parity does not require git — it requires there to be **one document**. A single
store with per-version status makes "staging" a read perspective rather than a copy, so
drift is unrepresentable.

A one-way mirror to a content repo remains open as an audit and disaster-recovery path. It
is write-only, so it carries none of the costs above.
