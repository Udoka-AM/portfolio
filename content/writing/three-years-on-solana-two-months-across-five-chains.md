---
title: "Three years on Solana, two months across five chains: an honest build report"
topic: "build report · Nov 2026"
blurb: "Why I started building on Tempo, Stellar, Hyperliquid and Zcash alongside Solana, what each project does, the chain feature it rests on, and exactly what is proven on which network."
date: 2026-11-09
draft: true
---

For three years I built on one chain. Solana is where I learned how money moves on-chain. I started as a university student shipping my first products, then worked in developer relations at Superteam Nigeria, MagicBlock and QuickNode, taught more than 5,000 developers, and finally built Nelo, a merchant payments app that is now live on Solana mainnet.

Two months ago I made a decision that might look like wandering from the outside: I started building on other chains alongside Solana.

It wasn't wandering. The problems I care about sit in one place: money moving between people, businesses and the banking system, much of it in and out of Africa, in ways you can check afterwards. Over three years I kept running into parts of those problems that one chain doesn't solve natively and another one does. A cross-border payout needs a reference that travels with the money into a bank statement. A trading agent needs an account that can trade but can't withdraw. A sealed-bid auction needs bids nobody can read until the right moment. Each of those has a chain whose core design already handles the hard part.

So I set one rule for the two months that followed: start from the problem, find the chain whose native primitive solves it, build on that primitive, and label every claim with the network it ran on. Mainnet means mainnet, and testnet means testnet.

This is the report: five projects, what each one does, why it lives where it lives, who it's for, and exactly what's proven.

## The short version

| Project | The problem | Chain and native edge | What's proven |
| --- | --- | --- | --- |
| Nelo | Shopkeepers need to accept stablecoins and receive naira on the phone they already own | Solana: secp256r1 precompile, fast finality | USDC cash-outs live on mainnet; offline payments on devnet |
| Corridor Finance | Payment companies need cross-border payouts that settle exactly once, on their own keys | Tempo: stablecoin-native assets and payment memos. Stellar: anchors, SEPs, MEMO_HASH | Payout on Tempo mainnet; Stellar Hub and Ramp on testnet |
| Agent Circle | Traders want to back AI agents without giving up custody | Hyperliquid: one HyperCore account; contracts that own trading accounts; builder codes | HyperEVM testnet; public launch 16 Nov |
| sealForge | Auctions where bids stay private but the result can be audited | Zcash: shielded pool, viewing keys | Two auctions settled on testnet |
| Tempo × Solana Swap | Moving stablecoins between Tempo and Solana | Across, routed via Base | Live on mainnet |

## 1. Nelo, on Solana: the phone is the payment terminal

**The problem.** A shopkeeper in Nigeria doesn't want a crypto app. They want to get paid, see naira in their bank account, and avoid buying new hardware. Card terminals are expensive, settlement can take days, and the network drops.

**Why Solana.** Two native features do the heavy lifting. The first is the secp256r1 precompile. Solana programs can verify P-256 signatures, the curve that phone secure elements use, so a key that never leaves the phone's chip can authorise a payment the chain accepts. The second is speed: with Alpenglow activated and 200 ms slots targeted, the on-chain leg of a payment is no longer the slow part. Deep USDC liquidity does the rest.

**What I built.** Merchants accept USDC and cash out to a Nigerian bank through paj.cash, a payout partner. For offline payments, the customer's phone signs a 202-byte voucher inside its StrongBox secure element against USDC already locked in the customer's own vault. The merchant's phone checks the voucher with no network. When a device reconnects, a relayer submits the voucher, and the precompile verifies the same signature on chain. The codebase has more than 500 tests. The bug that cost me the most time: P-256 signatures have to be normalised to low-S, and the library I used doesn't do that by default.

**The business.** Nelo earns a 0.91% net take on payments. Merchants keep their own keys, and the naira leg runs through a payout partner. Since the CBN's 5 Nov rules, confirming that partner's registration is part of the product.

**What's proven.** On mainnet, USDC cash-outs reach a Nigerian bank in as little as 91 seconds. On devnet, offline vouchers work end to end.

## 2. Corridor Finance, on Tempo and Stellar: payouts that happen exactly once

**The problem.** A payment company sending stablecoins to a supplier or a family in Nigeria needs three things that most stacks don't provide together. The payout must happen once and never twice on a retry. It must run on the company's own keys. And the bank credit must be traceable to the on-chain payment that caused it.

**Why Tempo.** Tempo is a payments-first chain. Stablecoins are native assets, fees can be paid in stablecoins, and every transfer can carry a memo. Corridor uses that memo for a 32-byte reference that follows the payment all the way into the bank narration, so reconciliation stops being a spreadsheet job.

**What I built on Tempo.** A payout engine that records every external step before waiting on it, so a retry resumes instead of paying again. The route runs from Tempo through Base to Solana via Across, then to a Nigerian bank via Paj. It has 107 tests, plus an optional Zcash shielded lane for supplier payments that need privacy.

**What's proven on Tempo.** On Tempo mainnet on 11 Oct, 2.90 USDC.e left the vault and ₦3,891.48 reached a Nigerian bank account 74 seconds later.

**Why Stellar as well.** Corridor still runs on Tempo. Alongside it I built a Stellar-native version, because Stellar's anchor network solves a different part of the problem: licensed payout businesses in many countries that already speak shared standards, the SEPs. SEP-31 covers cross-border payments, and our 32-byte reference fits exactly into a MEMO_HASH. Corridor Hub is the Stellar-native router, and Corridor Ramp is the hosted payout API on top of it. Today, a business that wants five anchors does five integrations; with the Hub it does one. Both have 145 tests and run on testnet. No anchor has signed on yet, and that's the next job. Stellar's Bell upgrade (mainnet vote on 23 Nov) adds muxed contract addresses, which fit Ramp's per-customer balances, and we're testing them now.

**Who it's for.** Payment companies and fintechs that pay out into Nigeria and other African markets and want to keep their own keys and an audit trail regulators can follow.

**The team.** This is where I'm not building alone: David, Etinosa and Onyela have worked on parts of the engineering.

## 3. Agent Circle, on Hyperliquid: agents that can trade but can't withdraw

**The problem.** AI trading agents are getting good. Backing one usually means handing over your keys or depositing into a pool someone else controls, and the risk limits live "in the bot", which makes them only as reliable as the bot.

**Why Hyperliquid.** Every user has one HyperCore account that spans perps, spot, builder-deployed perps (HIP-3) and outcome markets (HIP-4). HyperEVM contracts can read that account's state and send orders to it, so a contract can own a trading account. Builder codes let an app earn a fee on the orders it routes. Custody, execution and revenue are all native to the chain.

**What we built.** Each trader's vault is its own minimal-proxy contract (an EIP-1167 clone) with its own HyperCore account. The agent gets permission to trade; only the trader can withdraw. In vault mode, the contract checks position and drawdown limits before an order goes out. The suite has 246 tests, with 98.3% line coverage and 85.2% branch coverage, up from 51%.

**The business.** Agent builders keep 80% of the performance fee their agents earn.

**What's proven.** It has run on HyperEVM testnet (chain 998) since 4 Nov. It's unaudited. The public testnet launch and Season 0, a paper-trading season, open on Monday 16 Nov. I'm building it with David.

**What's around it.** Hyperliquid is adding regulated rails (HIP-3*, an FCM filing, ICE's plan with Trade.xyz), and since 9 Nov it has an L2 in Elysium. Regulated money will ask every trading agent who can withdraw. We built the answer into the account.

## 4. sealForge, on Zcash: private bids, public results

**The problem.** On a transparent chain, a sealed-bid auction leaks every bid.

**Why Zcash.** The shielded pool keeps bids private, and viewing keys let anyone recompute the result from the chain once the key is published.

**What I built.** The auction key is split with FROST into a 2-of-3 threshold, so no single operator can open bids early. Refund addresses are validated when a bid comes in, because one bad address once froze a whole refund batch. It's at v0.1.0.

**What's proven.** Two auctions, with 7 and 25 bids, have settled on Zcash testnet.

## 5. Tempo × Solana Swap: the bridge that refuses bad trades

It's live on mainnet. It moves stablecoins between Tempo and Solana in two Across legs routed through Base, refuses pairs it can't fill instead of leaving funds stuck halfway, and keeps the integrator credential on the server.

## What two months on five chains taught me

1. **Choose the chain for its primitive.** Every project above starts from a feature that its chain provides natively. That's what makes the work durable.
2. **Money infrastructure has the same three requirements on every chain:** one reference per payment from end to end, retries that can't pay twice, and books that match the chain.
3. **Labels build trust.** Writing "testnet" next to a claim costs nothing and earns credibility you can't buy.
4. **Depth transfers.** Three years on Solana is why each new chain took weeks, not months.
5. **Supervision is arriving on every rail at once.** The CBN's rules took effect on 5 Nov, and Hyperliquid is building regulated rails. Build so a supervisor can follow every payment.

## Next four weeks

- Agent Circle: public testnet and Season 0 on 16 Nov.
- Corridor Ramp: muxed contract addresses on Stellar testnet before the 23 Nov vote.
- Nelo and Corridor: confirm our partners' registrations under the CBN rules for the naira legs.
- Nelo: a reviewed path for offline payments from devnet to mainnet.

## Come build

Everything here is open source and labelled by network. If you build payments, trading infrastructure or privacy tooling, the repos are below, and contributions are welcome.

[Nelo](https://github.com/Udoka-AM/nelo) · [Corridor Finance](https://github.com/CorridorHub) · [Agent Circle](https://github.com/Agents-Circle) · [sealForge](https://github.com/Udoka-AM/sealForge)
