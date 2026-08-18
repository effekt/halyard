---
title: "core depends on nothing"
summary: The portability constraint dependency-cruiser enforces
status: stable
---

# `core` depends on nothing

It has to run in a browser (the studio validates drafts client-side), a worker, and a CI
step. A single `node:` or `react` import ends that. Enforced by dependency-cruiser rather
than by review.
