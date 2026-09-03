---
title: "The same protocol, twice: PDAs and a singleton"
topic: "cross-runtime"
blurb: "One custody specification implemented on Solana and on EVM. Where the account model forces the accounting to diverge, and where the security properties have to hold anyway."
draft: true
---

> Scaffold. Replace everything below, then set `draft: false` and add a
> `date: YYYY-MM-DD` line to the frontmatter to publish it.

Agents Circle needed custody-preserving vaults: a developer's trading agent
moves a trader's capital without ever being able to take it. I wrote that spec
once and implemented it twice — Anchor on Solana, Solidity on Polygon.

The security properties are identical. Almost nothing else is.

## The specification

<!-- State the invariants in runtime-neutral terms: who can move funds, under
     what constraint, and what must be impossible. -->

## Solana: a PDA per vault

<!-- Why a program-derived address per vault is natural here. Seeds, ownership,
     what signing means. -->

## EVM: why per-vault contracts are the wrong shape

<!-- Deployment cost per vault, and the singleton-with-internal-accounting
     alternative. This is where the implementations genuinely diverge. -->

## What changed, and what could not

<!-- The accounting moved from the account model into contract storage. The
     invariants did not move. Show the mapping. -->

## The part that nearly broke

<!-- The concrete near-miss. Readers remember the failure, not the diagram. -->
