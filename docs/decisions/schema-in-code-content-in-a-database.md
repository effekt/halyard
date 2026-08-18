---
title: "Schema in code, content in a database"
summary: Why the contract ships with the code while content publishes without a deploy
status: stable
---

# Schema in code, content in a database

The contract ships with the code that consumes it, so two environments cannot hold
different versions of it. Content does not — it changes hourly, by people without a
checkout, and must publish without a deploy.

Rejected: schema in a hosted service. That is what forces reconciliation tooling, promotion
runbooks, and a caching tier, and it is the failure this project exists to avoid.
