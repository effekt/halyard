---
title: "Pinned versions and a 3-day cooldown"
summary: The two supply-chain controls, and why either alone leaks
status: stable
---

# Pinned versions and a 3-day cooldown

A range is a standing instruction to install unreviewed code on a schedule set by whoever
holds the publishing token. Pinning removes the automatic upgrade; `minimumReleaseAge`
covers the window where a pin is deliberately bumped to something freshly hijacked. Either
control alone leaks.

3 days, not 7: real npm compromises are caught in hours — the September 2025 `chalk` and
`debug` takeover was detected and removed the same day — and the attacks that survive a week
need a window no tolerable cooldown provides.
