---
title: "Blocks are server components"
summary: Why a client block fails loudly rather than gaining a second render path
status: stable
---

# Blocks are server components

A block is invoked and its root cloned. A client reference cannot be invoked on the server, so a
client block does not render at all — React throws `Attempted to call X() from the server`, which
`invokeBlock` lets through untouched because the block's own failure is more informative than
anything the renderer could substitute.

Supporting client blocks would need a second render path emitting `createElement(component, …)`
without invoking, which makes `data-nubbin-node` part of every block's public prop contract and
requires each client block to spread rest props onto its root. That is a contract no gate can
check, failing silently as an unselectable region, in exchange for a case no consumer has asked
for.

The alternative was a wrapper element around each block, which stamps reliably. It was rejected
because it changes the consumer's layout, and Nubbin holds no opinion about styling.
