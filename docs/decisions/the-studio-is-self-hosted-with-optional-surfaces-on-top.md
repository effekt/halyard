---
title: "The studio is self-hosted, with optional surfaces on top"
summary: Why running the editor yourself makes the iframe canvas unproblematic
status: stable
---

# The studio is self-hosted, with optional surfaces on top

A consumer deploys and runs it alongside their own storage and CDN. That is what makes its
iframe canvas unproblematic: the person deploying the studio also controls the site's
headers, so `frame-ancestors` is a configuration line rather than a wall. A hosted vendor
cannot make that assumption, which is why one ships a browser extension whose stated job is
rewriting those headers.

An extension and an in-site script are optional surfaces for editing in place. Both are free.
The rule that lets one bundle serve all three: **learn about the page only through the DOM** —
never a `window` global, never framework internals.
