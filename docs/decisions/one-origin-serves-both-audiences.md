---
title: "One origin serves both audiences"
summary: Why one domain is canonical and the other two redirect to it
status: stable
---

# One origin serves both audiences

`nubbin.io` is canonical. `nubbin.dev` and `nubbin.ca` redirect to it permanently, and are held
rather than allowed to lapse.

A page that sells the product and a page that documents it answer different questions, and one
page attempting both serves neither with force. They are therefore two paths on the same origin,
and moving between them is an ordinary navigation. Each view has an address, so it can be linked,
indexed and sent to someone. A switch held only in client state gives the second view no URL, and
a view nobody can link to is one nobody arrives at.

Rejected: a domain per audience, with the developer site living at `nubbin.dev`. The name says
who it is for and the TLD is on the HSTS preload list, so the reading is right. It loses on two
counts. Cross-document View Transitions are same-origin only, so the switch between the two views
degrades from a transition to a page load exactly when it is the thing being demonstrated. And
inbound links divide across two origins rather than accumulating on one, which costs the newer
surface the most. A redirect supplies the mnemonic without either cost.

Holding `nubbin.io` also settles the collision recorded in
[#74](https://github.com/effekt/nubbin/issues/74), which rested on that name belonging to someone
else.

The documentation's address is settled with the generator, in
[the design-site entry](the-design-site-runs-docusaurus.md), because a host and a generator
constrain each other. It is served from GitHub Pages until this origin has more than a
landing page on it.
