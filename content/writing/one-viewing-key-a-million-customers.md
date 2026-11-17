---
title: "One viewing key, a million customers: account design, compact blocks and the real cost of finding incoming money"
topic: "zcash from the protocol up · lecture 2"
blurb: "Lecture 2 of a ten-part engineering series. We price shielded payment discovery from the account model down to the decryption loop, with compact blocks and trial-decryption timings measured on Zcash mainnet and testnet."
draft: true
---

![One viewing key, a million customers: what it costs a backend to find incoming money on Zcash](/writing/one-viewing-key-a-million-customers/cover.png)

**If a million customers each need a way to pay you on Zcash, how many keys should your backend watch, and what does each of those keys cost you every 25 seconds?**

That's today's question, and most engineers coming to Zcash answer it wrong the first time. The instinct from every other payments system is that cost follows addresses: a million customers means a million addresses means a million rows in an index, and an index lookup is cheap. On a shielded chain, that instinct points you at the wrong number. By the end of this lecture you will know which number to watch instead, you will have measured it on your own machine, and you will be able to size a scanner for a real workload before you write any of it.

**Welcome back to "Zcash from the protocol up".** In Lecture 1 we followed one payment through the stack in eight steps, and I said step 8, *discover*, is where most of a wallet backend's cost lives. Today we price step 8. The running example is still the shielded lane I built for Corridor Finance, which pays suppliers privately on Zcash testnet and lets an auditor check one customer's payments with a viewing key. The contrast case is still sealForge, my sealed-bid auction system, also on testnet. Today they turn out to sit at opposite ends of the same design decision, which is useful, because it lets you see that the decision is a choice and not a law.

**How this class works.** Same as last time: history where it explains a design, then the mechanism, then something you run. Every number I give you today was either measured by me on 17 November 2026, with the command shown so you can repeat it, or comes from a ZIP or a source file I name. Where I'm making a judgement rather than reporting a measurement, I'll say so.

## What I expect you to know already

You need Lecture 1, or the equivalent: what a shielded action is, that its 580-byte encrypted note holds the value and a 512-byte memo, and that an indexer serves compact blocks to wallets. Beyond that, the working knowledge of a backend engineer is enough.

| You already know | Where we use it today |
| --- | --- |
| Indexed lookups, and why a B-tree query is cheap | The transparent model, and why it stops working the moment the data is encrypted |
| Diffie-Hellman key agreement, at the "two parties derive a shared secret" level | Every trial decryption is one key agreement, and that is the expensive part |
| Stream ciphers and authenticated encryption | How a wallet reads 52 bytes of a note without the authentication tag |
| Protocol Buffers and gRPC streams | The CompactBlock message is a protobuf, streamed from the indexer |
| Capacity planning: throughput per worker, peak versus average, headroom | The whole second half of the lecture |
| Reading a little Rust and Python | Two short Rust programs and one Python planner in the lab |

You still don't need curve arithmetic. I'll tell you which operation is expensive and roughly why, and then we'll treat it as a measured constant, which is how you treat it in production anyway.

**What you will be able to do by the end.** Five outcomes:

1. Explain why detection cost on Zcash grows with the number of viewing keys you watch, and not with the number of addresses you hand out.
2. Derive a fresh address per customer or per invoice from one account, and map an incoming payment back to it.
3. Read a CompactBlock and say what it carries, what it leaves out, and what that costs you later.
4. Price a scanner in core-seconds per block from three numbers, and size it for the bursts the chain actually produces.
5. Choose an account granularity knowing what it fixes for you on day one: scan cost, disclosure, and what an auditor can be shown.

![Fig 01. The ten-lecture map, with today's lecture highlighted](/writing/one-viewing-key-a-million-customers/fig-01.png)

*Fig 01. Lecture 2 is the first piece of the wallet backend core. Lectures 3 and 4 build on the scanner we size today: the indexer that feeds it, and the ledger that books what it finds.*

# Part I: The account model

## 1. The exchange habit: one transparent address per customer

Let's start with the design almost every exchange and payment processor reaches for first, because it works on Bitcoin and on Zcash's transparent pool, and because seeing exactly where it works tells you exactly where it stops.

You give each customer their own transparent address. When money arrives at that address, you know who sent it, because the address *is* the customer reference. Detection is a lookup: the node keeps an index from address to unspent outputs, and you ask it. In Zebra that is the `getaddressutxos` and `getaddresstxids` RPCs, and you can see the limits in Zebra's `zebra-rpc/src/methods.rs`: at most **10,000 addresses per request** (`MAX_REQUEST_ADDRESSES`), and at most **100,000 results** before the node rejects the query and asks you to narrow the height range (`MAX_ADDRESS_QUERY_RESULTS`).

Price that for a million customers and it is perfectly manageable. One poll is a hundred requests of ten thousand addresses each, the node does an index lookup per address, and the cost grows linearly with addresses at a small constant per address. Adding the millionth customer costs about what adding the first one did. This is the mental model most of us bring to Zcash, and on the transparent pool it's correct.

It also publishes everything. Every customer's balance, every payment, every amount and every time is readable by anyone with a block explorer, and because one address belongs to one customer, the chain hands a stranger a ready-made map of your customer book. For a payout system like Corridor's, that is the problem we came to Zcash to solve: suppliers don't want their competitors reading what they were paid. So the index-friendly design is ruled out for the money we care about, and the question becomes what replaces the index.

## 2. Why shielded detection flips the cost model

The transparent design relies on one fact: the node can read the address on every output, so it can build an index keyed on it. A shielded output has no readable address. As we saw in Lecture 1, an action carries a note commitment, an ephemeral public key and a ciphertext, and nothing in those bytes says who it's for. The node cannot build an index of what it cannot read, and neither can the indexer.

So discovery works the other way round. The wallet takes every shielded output on the chain and asks, for each one, "is this mine?" The only way to answer is to try to decrypt it with your own key. That's **trial decryption**, and it's the single most important operation in this lecture.

![Fig 02. One trial decryption: one incoming viewing key against one compact action](/writing/one-viewing-key-a-million-customers/fig-02.png)

*Fig 02. One trial, step by step. The key agreement in step 1 is a variable-base scalar multiplication on the Pallas curve, and it dominates the cost. Everything after it is cheap symmetric work. A miss and a hit cost almost the same, because you only learn which one it was at step 5.*

Here is what happens in one trial, for the Orchard-protocol action format that both the Orchard and Ironwood pools use:

1. **Key agreement.** Multiply the action's ephemeral public key `epk` by your incoming viewing key `ivk`: `sharedSecret = [ivk] epk`. If the sender meant this note for you, this is the same secret the sender computed from your address, which is how two parties agree on a key without talking.
2. **Key derivation.** Hash the shared secret and `epk` with BLAKE2b under the personalisation `Zcash_OrchardKDF` to get a symmetric key.
3. **Decrypt 52 bytes.** Run the ChaCha20 keystream over the first 52 bytes of the ciphertext. Those bytes are the start of the note plaintext: a lead byte (1), the diversifier (11), the value (8) and `rseed` (32).
4. **Rebuild the commitment.** You can't check the authentication tag, because it sits at the end of the full 580-byte ciphertext and we only have the first 52. So instead, recompute the note commitment from the plaintext you just decrypted.
5. **Compare.** If your recomputed commitment equals the action's `cmx`, the note is yours and you now know its value. If not, it was garbage, and the note belongs to someone else.

Steps 2 to 5 are microseconds of hashing and stream-cipher work. Step 1 is the cost. A scalar multiplication on an elliptic curve is the expensive primitive here, and you pay it once per **(viewing key, action)** pair, whether the trial hits or misses.

That gives us the cost model, and it is worth writing down as a formula because the rest of the lecture is this formula with numbers in it:

```text
work per block  =  K  ×  I  ×  A  ×  t

K  viewing-key accounts you watch
I  incoming viewing keys per account (2: external and internal, see below)
A  shielded actions and outputs in the block
t  time for one trial on one core
```

There's no term for addresses in that formula. That's the flip. On the transparent pool, cost grows with the number of addresses you index. On the shielded pools, cost grows with the number of keys you hold, times the size of the chain, and it doesn't care how many addresses each key has handed out.

The `I = 2` comes from how wallets use keys. Each account has an *external* incoming viewing key, for addresses you give to other people, and an *internal* one, for change sent back to yourself. A wallet has to try both, and librustzcash's scanner does exactly that: look for the `for scope in [Scope::External, Scope::Internal]` loops in `zcash_client_backend/src/scanning.rs`. If you only ever receive and never send from an account, you could skip the internal key, but most backends send, so count two.

## 3. Diversified addresses: one key, 2^88 addresses

If cost follows keys and not addresses, the obvious move is to hand out as many addresses as you like from as few keys as you can. Zcash was designed for exactly that, and the feature has a name: **diversified addresses**.

An Orchard-protocol address is a pair `(d, pk_d)`. The diversifier `d` is 11 bytes. The transmission key is `pk_d = [ivk] g_d`, where `g_d` is a curve point derived by hashing `d`. Look at what that means: the same `ivk` sits inside every address, so the same `ivk` opens notes sent to any of them. One key, one trial per action, however many addresses you've issued.

Where does `d` come from? ZIP 32 gives each account a 32-byte diversifier key `dk`, and the diversifier for index `j` is `d = FF1-AES256(dk, j)`, a format-preserving encryption of the 88-bit index. Two consequences matter to us:

- **The addresses are unlinkable.** Without the viewing key, two diversified addresses from the same account look like addresses from two different wallets, because each `d` is an encryption and each `pk_d` depends on it. So a fresh address per customer doesn't leak that those customers pay the same business.
- **The mapping runs backwards for free.** Because FF1 is a block cipher, the holder of `dk` can decrypt a diversifier back into its index. When a trial decryption hits, the plaintext includes `d`, so you recover `j`, and if `j` is your invoice number, you know which invoice was paid. Nothing to store.

For the Orchard protocol every one of the 2^88 indices gives a valid address. (Sapling also has diversified addresses, but roughly half of its diversifiers are invalid and get skipped, a small wrinkle you'll meet if you support Sapling receivers.) In practice you wrap the address in a Unified Address, per ZIP 316, which is the string a customer actually sees. sealForge scans both the Orchard and Ironwood pools with one Orchard-protocol incoming viewing key; open `crates/sealforge-scan/src/lib.rs` and you'll see `scan_compact_block` try the same `ivk` against `tx.actions` and `tx.ironwood_actions`.

So a merchant checkout that issues a million invoices from one account pays for one key. The scan cost of the millionth invoice is zero, and the cost of deriving its address is one scalar multiplication and one FF1 call, about 113 µs on my laptop (we'll measure it in the lab).

![Fig 03. Three ways to give a million customers somewhere to pay you](/writing/one-viewing-key-a-million-customers/fig-03.png)

*Fig 03. Three account models side by side. The transparent model is cheap to detect and public. One account per customer is private but multiplies the scan by a million. One account with a diversified address per customer is private and costs one key. The question is what the third model gives up, and that's section 4.*

## 4. The catch: a viewing key discloses the whole account

If diversified addresses were free in every sense, you'd always use one account and we'd be done. They're not, and the reason is the same property that makes them cheap: one key opens all of them.

A viewing key is a disclosure tool as well as a detection tool. Give someone your account's incoming viewing key and they can see every payment to every address that account ever issued. There is no way to cut a viewing key down to one diversified address, because the address *is* the key with a different `d`. So the account boundary is also the disclosure boundary. Whoever you'll ever need to show something to, they see the whole account or nothing.

And the boundary is fixed at creation. You can't split an account later without moving its funds into new accounts, which is a set of transactions with fees and a visible pattern. So the account model is one of the few decisions in this series that you genuinely can't refactor cheaply, and it should be made with three things on the table at once: scan cost, who needs to see what, and for how long.

Here's how the two reference projects and the makeshift one land on that decision:

- **Corridor's shielded lane: one vault per (customer, period).** Corridor's auditor needs to check one customer's payouts for one period, and nothing else. So each (customer, period) pair gets its own shielded vault, either a ZIP 32 account or a FROST 2-of-3 vault, and the auditor gets that one vault's viewing key and reruns the same scan Corridor's ledger reconciles against. That's the expensive end of the trade-off: every vault is a key the scanner watches, so 500 vaults is `K = 500`. I chose it deliberately, because the disclosure requirement is the product.
- **sealForge: one escrow per auction, viewing key published.** sealForge discloses an escrow to *everyone*: after an auction closes, the escrow's incoming viewing key is published so anyone can recompute the result. A fresh escrow per auction is what makes that safe, since publishing the key reveals that auction's bids and nothing from any other auction. Same tool as Corridor, opposite audience.
- **The makeshift checkout service: one account, a diversified address per invoice.** A merchant that never has to disclose one customer's payments separately can collapse everything into one account and issue an address per invoice. That's `K = 1` for any number of customers, and the price is that the only disclosure unit is "everything".

The pattern underneath is the lesson of this section: **account granularity, disclosure granularity and scan cost are the same decision.** If you need to show an auditor one customer, that customer needs their own key, and you pay for that key on every block forever.

![Fig 04. Account granularity is disclosure granularity is scan cost](/writing/one-viewing-key-a-million-customers/fig-04.png)

*Fig 04. The three reference designs placed on the trade-off. Moving left buys finer disclosure and costs keys. Corridor sits left because its auditor must see one customer and one period; the checkout service sits right because nobody needs anything finer than "the whole merchant".*

# Part II: Compact blocks and the work per block

## 5. What a CompactBlock carries, and what it leaves out

Now that we know the scanner's job is "try every key against every action", let's look at what it's actually fed. The indexer turns each full block into a **CompactBlock**, defined in `compact_formats.proto` in the lightwallet-protocol repository, and streams them over gRPC with `GetBlockRange`. I read the definitions below from the generated Rust in `zcash_client_backend 0.25.0-pre.2`.

A `CompactBlock` has the block's `height`, `hash`, `prevHash` and `time`, an empty `header` field reserved for later, a list of `CompactTx`, and a `ChainMetadata` with the size of the Sapling, Orchard and Ironwood note commitment trees at the end of the block. Each `CompactTx` has its index in the block, its `txid`, a `fee` when the server can compute it, and then one list per pool:

| Field | Type | Bytes per entry | What it's for |
| --- | --- | --- | --- |
| `spends` | `CompactSaplingSpend` | 32 (nullifier) | Detecting your own Sapling spends |
| `outputs` | `CompactSaplingOutput` | 116 (`cmu` 32, `ephemeralKey` 32, ciphertext 52) | Trial-decrypting Sapling outputs |
| `actions` | `CompactOrchardAction` | 148 (`nullifier` 32, `cmx` 32, `ephemeralKey` 32, ciphertext 52) | Orchard |
| `ironwood_actions` | `CompactOrchardAction` | 148 | Ironwood, the same message type as Orchard |
| `vin`, `vout` | `CompactTxIn`, `TxOut` | prevout, or value plus script | Transparent data, only if you ask for it |

Two things stand out. First, a compact action is 148 bytes against the full action's 820, so about 18%: the scanner gets the ephemeral key it needs for step 1 of Fig 02, the 52 bytes it needs for step 3 and the `cmx` it needs for step 5, and nothing else. The other 672 bytes, which include the rest of the ciphertext with the memo and the 80-byte `outCiphertext`, stay on the server. Second, transparent data is opt-in: the `BlockRange` request has a `pool_types` field, and if you leave it empty the server returns shielded data only. When I first measured this I saw `vin=0 vout=0` across five thousand blocks and briefly thought I'd found a bug, but no, that's the default.

![Fig 05. A full action against a compact action, and a CompactBlock's layout](/writing/one-viewing-key-a-million-customers/fig-05.png)

*Fig 05. The scanner gets 148 of each action's 820 bytes. The memo is in the 528 bytes of ciphertext it doesn't get, which is why every hit costs a second fetch (section 8).*

The design goal for compact blocks is spelled out in the proto comment: carry only what a wallet needs to detect payments to it, detect spends of its notes, update the witnesses it needs to spend, and spend transparent outputs it owns. Detection, which is our subject, needs the 148 bytes. Spend detection needs only the nullifiers, and that's a set lookup against the nullifiers of notes you already hold, so it's cheap and I'll leave it aside. Witness maintenance used to mean hashing every note commitment on the chain into your tree; current librustzcash wallets avoid most of that with the `GetSubtreeRoots` RPC and the `suggest_scan_ranges` logic in `zcash_client_backend::data_api::chain`, which together let a wallet scan the ranges that matter first and fill in the tree around its own notes.

## 6. Measured: what the chain actually carries

Formulas are only as good as the `A` you put in them, so let's measure `A`. I streamed the latest 5,000 compact blocks from public servers on 17 November 2026 with the first lab program, once on mainnet and once on testnet:

| | Mainnet (`zec.rocks`) | Testnet (`testnet.zec.rocks`) |
| --- | --- | --- |
| Heights | 3,577,678 – 3,582,677 | 4,626,363 – 4,631,362 |
| Compact bytes per block, average | 2,083 | 1,621 |
| Ironwood actions | 60,551 | 46,387 |
| Orchard actions | 309 | 38 |
| Sapling outputs / spends | 681 / 360 | 2 / 0 |
| Shielded outputs per block, average | 12.3 | 9.3 |
| Most shielded outputs in one block | 311 | 315 |

Ironwood carries almost everything, which is what you'd expect after the Orchard seal: Orchard actions only appear when funds leave the old pool, and Sapling is a trickle. Five thousand blocks is about 35 hours at 25-second spacing, and at 2 kB per block a wallet following the chain downloads roughly 7 MB of compact blocks a day on mainnet right now.

The average is the wrong number to plan with, though, and the mainnet data shows why better than I could have staged it.

![Fig 06. Shielded outputs per block across 5,000 mainnet blocks](/writing/one-viewing-key-a-million-customers/fig-06.png)

*Fig 06. 62% of blocks carry no shielded output at all, and the median is zero. Then, over about three hours, 153 blocks arrive with more than 250 outputs each, many of them back to back. Those 153 blocks hold 75% of all the shielded outputs in the sample.*

Look at the distribution: 3,104 of the 5,000 blocks (62%) had no shielded outputs, another 1,565 had between one and ten, and then there's a cluster of 153 blocks between heights 3,579,935 and 3,580,346, about three hours of chain, with more than 250 outputs each, often in consecutive blocks. The 99th percentile block has 303 outputs. I don't know who sent that burst, and for capacity planning it doesn't matter: someone can fill blocks, and your scanner has to keep up when they do.

There's a hard ceiling, and it's new. ZIP 218, the same proposal that brought 25-second blocks in NU7, also introduced per-block action limits: a global shielded budget of **330 actions per block** across all pools, at most 330 Orchard and at most 330 Ironwood actions, and at most 300 Sapling spends plus outputs. The ZIP's own rationale is partly about wallets: it calculates that under these limits the worst-case light-client load is 169 MB of bandwidth and **2.3 million trial decryptions per day**, down 37% in bandwidth from the old worst case despite three times as many blocks. That 2.3 million is 330 actions × 3,456 blocks a day × 2 keys per account, so the ZIP is doing the same arithmetic we are, for one account.

So we have three values of `A` to plan with: about 12 on an average block, about 300 at the 99th percentile, and 330 as the consensus cap. Plan for the cap. It's only 9% above the 99th percentile, and it's a bound the chain guarantees, which is more than you can say for any percentile.

## 7. Pricing the work per block

Now `t`, the time for one trial. I timed `try_compact_note_decryption` from `zcash_note_encryption 0.5.1` against real Ironwood actions from testnet (all 46,387 from the 5,000-block sample for one key, and a 932-action sample from a 1,000-block run for 10 and 100 keys), with randomly generated incoming viewing keys, on one core of an Apple M3 Pro, release build:

| Keys | Trials | One at a time | Batch API |
| --- | --- | --- | --- |
| 1 | 46,387 | 83 µs per trial | 51 µs per trial |
| 10 | 9,320 (932 actions) | 81 µs | 42 µs |
| 100 | 93,200 (932 actions) | 82 µs | 42 µs |

Every trial missed, which is the realistic case: nearly every action on the chain belongs to someone else, and a miss costs the same as a hit. The batch API, `zcash_note_encryption::batch::try_compact_note_decryption`, takes a slice of keys and a slice of outputs and amortises the per-output preparation across the batch, which roughly halves the cost here. librustzcash's own scanner batches for the same reason, through `BatchRunner`. I'll use **t = 42 µs per trial per core** from here on. Your number will differ, which is why the lab has you measure it.

Put the pieces together, `K × 2 × A × 42 µs`, and divide by the 25 seconds you have before the next block arrives:

| Accounts watched (K) | Average block (A = 12.3) | Full block (A = 330) | Cores to keep up with full blocks |
| --- | --- | --- | --- |
| 1 | 1 ms | 28 ms | 0.001 |
| 500 (Corridor's design target) | 0.5 s | 13.9 s | 0.55 |
| 10,000 | 10 s | 277 s | 11 |
| 1,000,000 (an account per customer) | 17 min | 7.7 hours | 1,109 |

That last row is the one I want you to remember. An account per customer, for a million customers, needs about a thousand cores *just to keep up with full blocks*, before you've done anything with what you found. The same million customers as diversified addresses on one account need 28 milliseconds of one core per full block. Same customers, same privacy from the outside world, a difference of six orders of magnitude, and the only thing that changed was where the account boundary sits.

![Fig 07. Cores needed to keep up, by number of accounts watched](/writing/one-viewing-key-a-million-customers/fig-07.png)

*Fig 07. Scan cost is linear in accounts, so on log axes it's a straight line, one for average blocks and one for full ones. The diversified-address design is a flat line at K = 1, however many customers it serves. The gap between average and full is the burst you saw in Fig 06, and it's 27×.*

Catch-up is the other bill. A new auditor, a restored backup or a new worker has to scan history, and history is paid at the average rate rather than the cap, because it's already happened. One day of mainnet history is 3,456 blocks; for Corridor's 500 vaults that's about 30 core-minutes per day of history at today's volume, so a year of history is about 180 core-hours. That parallelises cleanly across height ranges, which is how you should shard a rescan, and it's also why the account decision is irreversible in practice: every key you add, you also pay to scan backwards to its birthday.

## 8. The second fetch: memos cost a round trip each

The scanner now knows *that* a payment arrived and its value, from the 52 decrypted bytes. It doesn't know *what it's for*. The memo, the 512 bytes where Corridor puts its `INV-… / corridor:<ref>` invoice reference and sealForge puts its bid commitment, is in the part of the ciphertext the compact block left on the server.

So every hit costs a second fetch: `GetTransaction` with the txid, then full decryption with `try_note_decryption`, which this time checks the authentication tag and returns the memo. sealForge's scanner is written as exactly these two phases, and you can lift the pattern directly: `scan_compact_block` returns the txids that pay the escrow, and `decrypt_transaction` decrypts those transactions in full for each payment's value, output index and memo.

The good news for capacity planning is that the second fetch scales with *hits*, the payments you actually receive, and not with keys or chain volume. A full v6 transaction is a few kilobytes per action (our Lecture 1 specimen was 15,478 bytes for 4 actions), so even a busy backend fetches a modest amount. Budget it as one round trip per incoming payment, put a bounded worker pool in front of it, and make it idempotent on `(txid, output index)` because you will retry it.

The bad news is privacy, and it's the subject of Lecture 3. Asking the server for one specific transaction by txid tells the server which transaction you care about. The compact block stream was the same for every wallet, and the second fetch is not.

## 9. Sharding the scanner

With the cost model in hand, the scanner's architecture almost writes itself, but there are two different things you might shard, and they suit different jobs.

**Shard by keys for following the tip.** Every worker reads the same block stream and owns a slice of the keys. Each worker's work per block is `(its keys) × 2 × A × t`, so you size slices so that a full block, `A = 330`, fits inside the block time with headroom. When a worker finds a hit, it emits `(account, txid, output index, value)` to the second-fetch pool, which feeds the ledger. One stream, many key slices.

**Shard by height for catching up.** Rescans run over history, where the blocks are fixed and there's no deadline per block. Split the height range across workers and give each one every key that existed in its range. This is embarrassingly parallel, and it's how you bring a new auditor or a new worker up to the tip.

![Fig 08. The lane's scanner: one block stream, key shards, and the second fetch](/writing/one-viewing-key-a-million-customers/fig-08.png)

*Fig 08. The scanner we'll build on through the series. The shard manager assigns keys to tip workers from measured trial throughput, and hits go to a separate, bounded second-fetch pool. Rescans run on their own height-range workers so a new auditor never slows the tip.*

The shard manager is the makeshift component for this lecture, and its core is small enough to show. It takes your measured `t`, the number of accounts, the cores per worker and a headroom factor, and tells you how many workers you need for a full block:

```python
"""Size a sharded shielded scanner from your own measurements."""
import math, sys

BLOCK_SECONDS = 25       # NU7 target spacing (ZIP 218)
ACTION_CAP = 330         # max shielded actions per block (ZIP 218)
IVKS_PER_ACCOUNT = 2     # external and internal (change) scope

def plan(accounts, us_per_trial, cores_per_worker=4, headroom=0.5, actions=ACTION_CAP):
    """Workers needed so a full block is scanned within `headroom` of the block time."""
    trials = accounts * IVKS_PER_ACCOUNT * actions
    core_seconds = trials * us_per_trial / 1e6
    budget = BLOCK_SECONDS * headroom * cores_per_worker   # core-seconds one worker gives a block
    workers = max(1, math.ceil(core_seconds / budget))
    return {
        "core_seconds_per_full_block": round(core_seconds, 2),
        "workers": workers,
        "accounts_per_worker": math.ceil(accounts / workers),
    }

if __name__ == "__main__":
    accounts = int(sys.argv[1]) if len(sys.argv) > 1 else 500
    us = float(sys.argv[2]) if len(sys.argv) > 2 else 42.0
    print(plan(accounts, us))
```

With my 42 µs, 500 accounts fit in one four-core worker with half the block time to spare; 10,000 accounts need six workers of about 1,667 accounts each; a million accounts need 555. The headroom factor is a judgement call, and I use one half: a scanner that runs at 100% of the block time falls behind on the first slow block and never catches up, because there's no quiet period on a chain that keeps producing blocks.

# Part III: The lab

## 10. Measure the chain, time a trial, issue invoice addresses

You need a Rust toolchain and Python 3. Both Rust programs run as examples inside sealForge's `sealforge-chain` crate, which already depends on everything they need, so from a clone of [sealForge](https://github.com/Udoka-AM/sealForge), save each one under `crates/sealforge-chain/examples/` and run it with `cargo run --release -p sealforge-chain --example <name>`. Use a release build; trial decryption in a debug build is many times slower and will make your capacity plan wildly pessimistic.

**Step 1: measure `A` and `t` on real blocks.** This program streams the latest N compact blocks from a lightwallet server, counts what's in them, then times trial decryption of every Ironwood action against 1, 10 and 100 random keys, both one at a time and through the batch API. It's the program behind every number in sections 6 and 7.

```rust
// scan_cost.rs. Usage: scan_cost <url> <blocks> [counts]
use std::time::Instant;

use orchard::keys::{FullViewingKey, PreparedIncomingViewingKey, Scope, SpendingKey};
use orchard::note_encryption::{CompactAction, IronwoodVersion, NoteEncryptionDomain};
use prost::Message;
use sealforge_chain::connect;
use zcash_client_backend::proto::service::{BlockId, BlockRange, ChainSpec};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let url = std::env::args().nth(1).unwrap();
    let n: u64 = std::env::args().nth(2).unwrap().parse()?;
    let mut client = connect(&url).await?;
    let tip = client.get_latest_block(ChainSpec::default()).await?.into_inner().height;
    let start = tip - n + 1;
    let mut stream = client
        .get_block_range(BlockRange {
            start: Some(BlockId { height: start, hash: vec![] }),
            end: Some(BlockId { height: tip, hash: vec![] }),
            pool_types: vec![], // empty = shielded pools only
        })
        .await?
        .into_inner();

    let (mut blocks, mut bytes, mut outputs, mut max_in_block) = (0u64, 0u64, 0u64, 0u64);
    let mut actions = Vec::new();
    while let Some(b) = stream.message().await? {
        blocks += 1;
        bytes += b.encoded_len() as u64;
        let mut per = 0u64;
        for tx in &b.vtx {
            per += (tx.actions.len() + tx.ironwood_actions.len() + tx.outputs.len()) as u64;
            for a in &tx.ironwood_actions {
                if let Ok(c) = CompactAction::try_from(a) {
                    actions.push(c);
                }
            }
        }
        outputs += per;
        max_in_block = max_in_block.max(per);
    }
    println!("{blocks} blocks {start}..={tip}: {} compact bytes/block, {:.1} shielded outputs/block, max {max_in_block}",
        bytes / blocks.max(1), outputs as f64 / blocks.max(1) as f64);
    if std::env::args().nth(3).as_deref() == Some("counts") { return Ok(()); }

    for k in [1usize, 10, 100] {
        let ivks: Vec<PreparedIncomingViewingKey> = (0..k)
            .map(|i| {
                let mut seed = [7u8; 32];
                seed[..8].copy_from_slice(&(i as u64 + 1).to_le_bytes());
                let sk = loop {
                    let o: Option<SpendingKey> = SpendingKey::from_bytes(seed).into();
                    if let Some(sk) = o { break sk; }
                    seed[31] = seed[31].wrapping_add(1);
                };
                PreparedIncomingViewingKey::new(&FullViewingKey::from(&sk).to_ivk(Scope::External))
            })
            .collect();
        let trials = (k * actions.len()) as f64;

        let t = Instant::now();
        for ivk in &ivks {
            for a in &actions {
                let d = NoteEncryptionDomain::<IronwoodVersion>::for_compact_action(a);
                let _ = zcash_note_encryption::try_compact_note_decryption(&d, ivk, a);
            }
        }
        println!("k={k:>3} one at a time: {:.0} µs/trial", t.elapsed().as_secs_f64() * 1e6 / trials);

        let outs: Vec<_> = actions.iter()
            .map(|a| (NoteEncryptionDomain::<IronwoodVersion>::for_compact_action(a), a.clone()))
            .collect();
        let t = Instant::now();
        let _ = zcash_note_encryption::batch::try_compact_note_decryption(&ivks, &outs);
        println!("k={k:>3} batch:        {:.0} µs/trial", t.elapsed().as_secs_f64() * 1e6 / trials);
    }
    Ok(())
}
```

Run it against testnet first, because testnet's volume is smaller and the timing run finishes in a few minutes:

```bash
cargo run --release -p sealforge-chain --example scan_cost -- https://testnet.zec.rocks:443 1000
cargo run --release -p sealforge-chain --example scan_cost -- https://zec.rocks:443 5000 counts
```

The `counts` flag on the second line skips the timing, so you can survey mainnet without spending ten minutes decrypting it. Write down your batch `µs/trial` for 100 keys. That's your `t`.

**Step 2: issue invoice addresses from one account.** This is the core of the makeshift checkout service: invoice number in, address out, and on detection, address back to invoice number, with nothing stored in between.

```rust
// checkout.rs: one account, one diversified address per invoice.
use std::time::Instant;
use orchard::keys::{FullViewingKey, Scope, SpendingKey};

fn main() {
    let sk: SpendingKey = Option::<SpendingKey>::from(SpendingKey::from_bytes([42u8; 32])).expect("valid key");
    let ivk = FullViewingKey::from(&sk).to_ivk(Scope::External);

    // Invoice number -> diversifier index -> address. Nothing to store: the index is the invoice.
    let t = Instant::now();
    let addrs: Vec<_> = (0u64..100_000).map(|invoice| ivk.address_at(invoice)).collect();
    println!("derived {} invoice addresses in {:?}", addrs.len(), t.elapsed());

    // On detection, the decrypted note names its recipient address. Map it back to the invoice.
    let paid = &addrs[73_219];
    let j = ivk.diversifier_index(paid).expect("ours");
    let mut b = [0u8; 8];
    b.copy_from_slice(&j.as_bytes()[..8]);
    println!("payment to invoice {}", u64::from_le_bytes(b));

    // Any address not derived from this key is rejected.
    let other = FullViewingKey::from(&Option::<SpendingKey>::from(SpendingKey::from_bytes([9u8; 32])).unwrap())
        .to_ivk(Scope::External).address_at(0u64);
    println!("foreign address recognised: {}", ivk.diversifier_index(&other).is_some());
}
```

On my machine:

```text
derived 100000 invoice addresses in 11.27s
payment to invoice 73219
foreign address recognised: false
```

That's about 113 µs per address, so derive them on demand when an invoice is created rather than in bulk. `IncomingViewingKey::diversifier_index` decrypts the diversifier with FF1 and then re-derives the address to confirm it's really yours, which is why the foreign address comes back `false` instead of mapping to some random index. Never use a seed like `[42u8; 32]` for anything but this lab: a real account comes from a ZIP 32 seed you generated and stored properly.

**Step 3: size your scanner.** Save the planner from section 9 as `plan_shards.py` and run it with your own `t`:

```bash
python3 plan_shards.py 500 42
python3 plan_shards.py 10000 42
```

```text
{'core_seconds_per_full_block': 13.86, 'workers': 1, 'accounts_per_worker': 500}
{'core_seconds_per_full_block': 277.2, 'workers': 6, 'accounts_per_worker': 1667}
```

**Exercises.** Do these before Lecture 3; each one checks one of today's outcomes.

1. Run Step 1 on your own machine and on the smallest cloud instance you'd actually deploy to. How far apart are the two values of `t`, and what does that do to the worker count for 10,000 accounts?
2. Extend `scan_cost` to print the per-block output counts, then find the longest run of consecutive blocks above 250 outputs in the last 5,000 mainnet blocks. Would a scanner sized for the average have caught up by the end of that run? Show the arithmetic.
3. Corridor gives each (customer, period) its own vault. Design an alternative that gives the auditor the same one-customer, one-period view but watches fewer keys, and name what you had to give up. (Hint: think about what has to happen at the end of each period.)
4. Add a `Scope::Internal` key to `checkout.rs` and show that an internal address isn't recognised by the external key. Why would a backend that only ever receives still want to keep watching its internal key?

## What we covered, and where we go next

Let's check off the outcomes.

You can explain why shielded detection costs grow with keys: the chain can't be indexed by address, so the wallet trial-decrypts every action with every key it holds, and each trial is one key agreement. You can issue a fresh, unlinkable address per invoice from one account and map a payment back to its invoice with the diversifier key. You know a CompactBlock gives the scanner 148 of each action's 820 bytes, and that the memo needs a second fetch per hit. You can price a scanner as `K × 2 × A × t` and size it for the 330-action cap rather than the average. And you know that choosing an account boundary chooses your scan bill, your disclosure unit and your auditor's view, all at once and for good.

Here are the numbers worth keeping in your head from today:

| What | Value | Source |
| --- | --- | --- |
| Work per block | accounts × 2 keys × actions × time per trial | Section 2 |
| Time per trial | 42 µs batched, 82 µs one at a time (one M3 Pro core) | Measured, lab Step 1 |
| Max shielded actions per block | 330 across all pools | ZIP 218 |
| Shielded outputs per mainnet block | 12.3 average, 0 median, 303 at p99 | Measured, 5,000 blocks to 3,582,677 |
| Compact action | 148 bytes, against 820 for the full action | `compact_formats.proto`, ZIP 229 |
| Diversified addresses per account | 2^88, all valid for the Orchard protocol | ZIP 32 |
| Address derivation | about 113 µs per address | Measured, lab Step 2 |
| Zebra address RPCs | 10,000 addresses per request, 100,000 results | `zebra-rpc/src/methods.rs` |

**Next lecture: "The indexer layer".** Today we treated the compact block stream as given. Next time we look at the servers that produce it: how many wallets one indexer can serve, measured, now that Zaino and the zingod fork both exist, and what the server learns about each wallet from what it asks for, starting with the second fetch from section 8.

NOTE: Corridor's shielded lane and sealForge both run on Zcash testnet only. Neither has run on mainnet, and nothing here is financial advice. The timings are from one laptop and are a starting point, not a benchmark; measure on your own hardware before you size anything. Ecosystem facts are as of 17 November 2026 and checked against the sources below.

If you're running a shielded scanner at any scale, I'd really like to compare numbers with you, and both repositories are open to contributors.

## References

- [ZIP 218: 25-second Block Target Spacing](https://github.com/zcash/zips/blob/main/zips/zip-0218.md), including the per-block action limits
- [ZIP 32: Shielded Hierarchical Deterministic Wallets](https://zips.z.cash/zip-0032) and [ZIP 316: Unified Addresses and Unified Viewing Keys](https://zips.z.cash/zip-0316)
- [ZIP 229: Version 6 Transaction Format](https://zips.z.cash/zip-0229)
- [Zcash protocol specification](https://zips.z.cash/protocol/protocol.pdf): in-band secret distribution and key agreement for the Orchard protocol
- [compact_formats.proto and service.proto](https://github.com/zcash/lightwallet-protocol/tree/main/walletrpc)
- [librustzcash](https://github.com/zcash/librustzcash): `zcash_client_backend` scanning and `data_api::chain`, `zcash_note_encryption` (including the `batch` module), and the `orchard` crate's key types
- [Zebra `zebra-rpc/src/methods.rs`](https://github.com/ZcashFoundation/zebra/blob/main/zebra-rpc/src/methods.rs): `MAX_REQUEST_ADDRESSES` and `MAX_ADDRESS_QUERY_RESULTS`
- [Lecture 1: The Zcash stack after NU7](https://udokaam.dev/writing/zcash-stack-after-nu7-one-transaction-four-pools/)
- [Corridor: the Zcash shielded lane](https://github.com/Udoka-AM/corridor/blob/main/apps/docs/integrations/zcash.mdx) and [sealForge](https://github.com/Udoka-AM/sealForge), including `crates/sealforge-scan/src/lib.rs`
