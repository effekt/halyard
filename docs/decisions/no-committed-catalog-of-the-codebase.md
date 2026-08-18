---
title: "No committed catalog of the codebase"
summary: Why the codebase map is generated on demand into a gitignored path
status: stable
---

# No committed catalog of the codebase

A generated index goes stale and conflicts on every branch that adds a unit. `pnpm map`
produces one on demand into a gitignored path instead.
