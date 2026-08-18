---
title: "The studio does not own identity"
summary: Auth is an adapter where the studio must know its caller, and none behind your own gate is supported
status: stable
---

# The studio does not own identity

The studio writes drafts and moves the production pointer for a route, and nothing said who
may open it — a question that gets expensive late, because a session boundary retrofitted
after the studio exists runs through the publish path.

Two deployments are supported. Behind the consumer's own gate — a VPN, a reverse proxy, the
application's existing auth — the studio carries no authentication of its own, and that is a
supported deployment rather than a misconfiguration: self-hosting makes it a complete answer
for a large share of installs, provided the need for the gate is documented rather than
assumed. Where the studio itself must know the caller, the boundary is an `IdentityProvider`
adapter the consumer implements. That shape is reserved, not invented here:
[`adapters.md`](https://github.com/effekt/nubbin/blob/main/.claude/rules/adapters.md) already
scopes itself to `packages/auth-*`, and
[`package-boundaries.md`](https://github.com/effekt/nubbin/blob/main/.claude/rules/package-boundaries.md)
already places auth among the interfaces `core` declares and an adapter implements. No
`IdentityProvider` interface is declared yet; the publish and edit routes state in their own
comments that they are unauthenticated on purpose
([#85](https://github.com/effekt/nubbin/issues/85)).

Built-in users and sessions in the authoring store were rejected: they make Nubbin the owner
of an account system, a kind of data ownership the architecture refuses for everything that
is not a page. The live question was narrower — whether an unauthenticated default is
tolerable in a product whose job is publishing to production — and self-hosting answers it:
the operator who deploys the studio is the operator who controls what stands in front of it.
