---
title: "Standard Schema, not zod"
summary: Why validation binds to an interface any validator can satisfy
status: stable
---

# Standard Schema, not zod

The pitch is "bring your own integration"; hard-coding a validator contradicts it. Standard
Schema is types-plus-one-method, so the cost is near zero and a consumer can use zod,
valibot, or arktype.

zod is a devDependency because tests must run against a real implementation.
