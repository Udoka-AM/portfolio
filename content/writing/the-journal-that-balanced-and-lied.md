---
title: "The journal that balanced and lied"
topic: "mutation testing"
blurb: "Sixteen tests passed against a settlement saga whose compensation order was reversed. What a balanced journal does not tell you, and what mutation testing does."
draft: true
---

> Scaffold. Replace everything below, then set `draft: false` and add a
> `date: YYYY-MM-DD` line to the frontmatter to publish it.

Arc's settlement saga moves money between Europe and Africa in steps, and every
step has a compensating action that undoes it. The ledger is double-entry, so
after any sequence — success or rollback — debits equal credits.

That property is exactly what made the bug invisible.

## The failure

<!-- What the compensation order was, what you changed it to, and why sixteen
     tests still passed. Be specific about which invariant held. -->

## Why balance is not correctness

A trial balance answers one question: does the arithmetic agree? It cannot
answer whether the entries describe what actually happened.

<!-- The distinction between an invariant that constrains totals and one that
     constrains sequence. This is the core of the piece. -->

## What mutation testing found

<!-- The mutant that survived. What it proved about the suite rather than the
     code — the tests asserted on final state and never on order. -->

## The assertion that was missing

<!-- The test you wrote afterwards. Show it. -->

## What I take from it

<!-- Short. Where else this class of bug hides: anything with a compensating
     action, anything where an invariant is cheap to satisfy accidentally. -->
