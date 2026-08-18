---
title: "Editing hints live beside the schema, not inside it"
summary: Why UI hints are a parallel structure keyed by field path
status: stable
---

# Editing hints live beside the schema, not inside it

A parallel structure keyed by field path. Considered and rejected: each validator's own
metadata slot behind one adapter — which avoids monkey-patching and reads well.

It loses because a validator's metadata registry is keyed by object identity, so a shared
schema constant carries one set of hints everywhere it is referenced. Extracting shared
sub-schemas is a rule here; identity-keyed hints are hostile to it. Standard Schema also
exposes only `validate()`, so in-schema authoring would mean an adapter per validator.

JSON Forms and react-jsonschema-form both keep a UI schema parallel to the data schema, and
Storybook keeps `argTypes` beside the component — hints stay parallel when the schema format
is foreign to the tool.
