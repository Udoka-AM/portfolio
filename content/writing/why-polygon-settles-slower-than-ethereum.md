---
title: "Why Polygon settles slower than Ethereum"
topic: "finality"
blurb: "Block time is not settlement time. Where the difference comes from, and why a payments system has to care about the second number."
draft: true
---

> Scaffold. Replace everything below, then set `draft: false` and add a
> `date: YYYY-MM-DD` line to the frontmatter to publish it.

Polygon produces blocks in about two seconds. Ethereum takes twelve. Ask which
settles faster and most people answer with those numbers, which is the wrong
comparison.

## Block time is not settlement time

<!-- Define both plainly. Block time is production cadence; settlement is the
     point after which reversal is infeasible. -->

## Where Polygon's finality actually comes from

<!-- Checkpointing to Ethereum: what gets committed, how often, and what that
     means for the real wait before funds are safe to release. -->

## Ethereum's finality

<!-- Casper FFG, epochs, justified vs finalised. Keep it to what a payments
     engineer needs. -->

## The number that matters to a payments system

<!-- The operational question: how long before you credit a beneficiary. Tie it
     to a corridor with real amounts and a real counterparty risk. -->

## What this changes about design

<!-- Chain choice as a settlement-risk decision, not a fee decision. -->
