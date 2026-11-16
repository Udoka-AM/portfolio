---
title: "The Zcash stack after NU7: from zcashd to an all-Rust system, and how one transaction is laid out across four pools"
topic: "zcash from the protocol up · lecture 1"
blurb: "Lecture 1 of a ten-part engineering series. We follow one shielded payment through every program in today's Zcash stack, then take its 15,478 bytes apart field by field, on Zcash testnet."
draft: true
---

![The Zcash stack after NU7, and one transaction laid out across four pools](/writing/zcash-stack-after-nu7-one-transaction-four-pools/cover.png)

**If you sent one shielded payment on Zcash today, which programs would touch it, what would each of them see, and where in its bytes would the money actually be?**

That is the question we are going to answer in this lecture, and I want to answer it properly, the way you would want it answered if you were about to put a payments backend on top of this chain. By the end of the session you will be able to draw the whole stack from memory, point at the program that owns each job, and read a real Zcash transaction byte by byte with a forty-line script you wrote yourself.

**Welcome to the first lecture of "Zcash from the protocol up".** This is a ten-part series for backend engineers who know distributed systems but have not worked on Zcash. Every lecture adds one working part to the same system, a shielded payout backend, so the series ends with something you can run rather than a pile of notes. The running example is the shielded lane I built for Corridor Finance, which pays suppliers privately on Zcash testnet and lets an auditor check one customer's payments with a viewing key. The contrast case, where the same Zcash parts are used under a different trust model, is sealForge, my sealed-bid auction system, also on testnet. I will bring both in where they are evidence for a point, never as the point itself.

**How this class works.** I will teach the way I would at a whiteboard: a little history when it explains a design, then the mechanism, then something you can run. When I cite a rule, I cite the ZIP or the source file it comes from, so you can check me. Where something is still a draft or still moving, I will say so out loud, because Zcash changed more in 2026 than in any year before it and you deserve to know which parts are settled.

## What I expect you to know already

You do not need a cryptography background for this lecture. You need the working knowledge most backend engineers already carry, and I will show you exactly where each piece of it gets used.

| You already know | Where we use it today |
| --- | --- |
| Bitcoin-style transactions: inputs, outputs, fees, a UTXO set | Zcash's transparent pool is that model almost unchanged, and the shielded pools are built as a contrast to it |
| Hashes and Merkle trees | Every shielded output becomes a leaf in a note commitment tree, and every spend proves membership against a root |
| Public-key signatures | Each shielded spend carries a signature, and each pool carries a "binding" signature that proves the amounts balance |
| Client/server systems, JSON-RPC and gRPC | The stack is a set of services that talk over exactly these protocols |
| Reading little-endian integers and variable-length fields | The dissection in Part II is nothing more than this, done carefully |
| Docker, and reading a little Rust and Python | The lab at the end runs a local chain and two short programs |

What you do **not** need: elliptic-curve arithmetic, the inner workings of Halo 2, or how a zk-SNARK circuit is written. We will treat the proof as a black box with a known size and a known job, which is exactly how a backend treats it in production. Later lectures open some of those boxes when a design decision depends on what is inside.

**What you will be able to do by the end.** Five outcomes, and I will check them off as we go:

1. Name each program in the post-NU7 stack, what it owns, and how your backend should talk to it.
2. Trace one shielded payment from the wallet that builds it to the wallet that finds it.
3. Read a v6 transaction header and say which network upgrade it was built for.
4. Explain what each of the 820 bytes in a shielded action is for, and who can read them.
5. Explain how the chain counts money it cannot see, and why that mattered so much in 2026.

![Fig 01. The ten-lecture map, with today's lecture highlighted](/writing/zcash-stack-after-nu7-one-transaction-four-pools/fig-01.png)

*Fig 01. The series map. Today is the ground floor: the stack and the transaction. Everything after this builds on the vocabulary we set up here.*

# Part I: The stack

## 1. A short history in five upgrades and one bug

I always start with history, because almost every odd-looking detail in Zcash is a scar from a specific decision, and once you know which decision, the detail stops looking odd.

Zcash launched in 2016 with one shielded pool, **Sprout**. In 2018 the **Sapling** upgrade introduced a far more efficient second pool, and in 2019 **Blossom** halved the block target spacing from 150 seconds to 75 seconds. In 2022, **NU5** brought the third shielded pool, **Orchard**, built on the Halo 2 proof system, which needs no trusted setup, together with the version 5 transaction format (ZIP 225) and unified addresses (ZIP 316). For three years after that, if someone said "shielded Zcash", they mostly meant Orchard.

Then came 2026. On 29 May, security researcher Taylor Hornby, who had been asked to run an AI-assisted audit of the Orchard protocol, reported a soundness vulnerability in the Orchard Action circuit implementation. ZIP 257 records the response in plain terms: the bug "could have allowed balance violation and theft of funds", so use of Orchard was disabled immediately, and a corrected circuit was deployed in the **NU6.2** upgrade [ZIP 257].

Fixing the circuit closed the hole. It did not, by itself, restore confidence in the money already sitting in Orchard. That is what **NU6.3** was for. It introduced a fourth shielded pool, **Ironwood**, activated on mainnet at height 3,428,143 [ZIP 258]. Ironwood reuses the Orchard protocol almost unchanged, but it starts with a clean state, its supply integrity was backed by formal verification from the start, and every note in it is *quantum-recoverable*: if discrete-log cryptography ever has to be switched off, a recovery protocol can still return Ironwood funds to their owners [ZIP 229, ZIP 2005]. At the same moment, the Orchard pool was sealed: value can leave it, but it cannot enter it, and an Orchard action may only send to the same address as the note it spends [ZIP 2006]. The practical effect is a one-way door from Orchard into Ironwood.

The most recent upgrade, **NU7**, activated on mainnet at height 3,543,405 in November 2026 [Zebra 7.0.0 release]. It cut the block target spacing again, from 75 seconds to 25 seconds (ZIP 218), introduced per-block limits on shielded actions, and made version 4 transactions invalid. That last change quietly finishes Sprout: Sprout spends only exist in the v4 format, so once v4 is gone, Sprout funds have no transaction that can move them.

![Fig 02. Zcash's pools and upgrades on one timeline](/writing/zcash-stack-after-nu7-one-transaction-four-pools/fig-02.png)

*Fig 02. Four shielded pools, each born at an upgrade. Orchard is now exit-only; new shielded value lands in Ironwood.*

Hold on to one idea from this history, because it will come back three times today: **Zcash keeps each pool's books separately.** That design is what let the network contain a counterfeiting bug in one pool without having to doubt the others.

## 2. From one process to five components

For most of Zcash's life there was one program at the centre of everything: **zcashd**, a C++ codebase descended from Bitcoin Core. It was the consensus node, the wallet and the RPC server in one process. If you ran an exchange, a block explorer or a mining pool, you ran zcashd. Its repository is now archived.

Its jobs have been split across separate, mostly Rust, components. This is the single biggest change for anyone building on Zcash, so let's go through them one at a time.

![Fig 03. From the zcashd monolith to the post-NU7 stack](/writing/zcash-stack-after-nu7-one-transaction-four-pools/fig-03.png)

*Fig 03. The left side is what a Zcash backend looked like for years. The right side is what you deploy now, with each component's owner and the protocol your code uses to reach it.*

| Component | Its job | Maintained by | How your backend reaches it |
| --- | --- | --- | --- |
| **Zebra** (`zebrad`) | Consensus node: validates blocks and transactions, keeps chain state, serves JSON-RPC | Zcash Foundation | JSON-RPC; Zebra 7.0.0 was the first stable NU7 release |
| **Zakura** | A second consensus node, forked from Zebra and tuned for performance, with pruning, snapshots and a zcashd-compatible RPC mode | Valar Group, with Project Tachyon | JSON-RPC |
| **Indexer** (lightwalletd, Zaino, zingod) | Turns full blocks into *compact blocks* and serves them, plus transaction lookup and submission, over the CompactTxStreamer gRPC service | lightwalletd: ZODL. Zaino: the Zaino project. zingod: Zingo Labs, which left Zaino in November 2026 and now maintains this fork | gRPC (CompactTxStreamer) |
| **Zallet** | A full-node wallet with a zcashd-style RPC, built to replace the zcashd wallet; currently in beta | ZODL | JSON-RPC |
| **librustzcash** | The Rust libraries every modern wallet is built on: keys, addresses, transaction building, scanning, PCZT | ZODL | A library you link, not a service |

There is also a repository called Z3 whose stated purpose is the "grand unification of Zebra, Zaino and Zallet" into one deployable stack, which tells you where the ecosystem expects most operators to land.

**Why the split matters to a backend engineer.** Three consequences, and each of them will become a design rule later in the series.

First, these are separate scaling tiers and separate failure domains. A wallet service that serves ten thousand customers puts its load on the indexer, not the node, and an indexer that falls behind does not stop the node from validating. You size and monitor them separately.

Second, they upgrade on different schedules, and the gaps are real. Zebra 7.0.0 moved its state database to format v29, which earlier versions cannot read, so tools that read Zebra's state directly have to upgrade in the same window. My own sealForge regtest configuration leaves NU7 switched off for exactly this reason: the Zaino version it pins did not yet know NU7's consensus branch ID. When you run this stack, the slowest component sets your upgrade date.

Third, there are now two consensus implementations. That is healthy for the network and a new responsibility for you. In October and November 2026 the two nodes disagreed on the standard fee per logical action (Zakura used 400 zatoshis while Zebra used the ZIP 317 value) until Zakura moved to 1,000, and transactions could stop relaying between them in the meantime. Lecture 8 is about building a gateway that notices this kind of divergence before your customers do.

## 3. Follow one payment through the stack

Now let's make the diagram move. Here is the life of one shielded payment, the one we are going to dissect in Part II, from the wallet that builds it to the wallet that receives it.

![Fig 04. One shielded payment through the stack, step by step](/writing/zcash-stack-after-nu7-one-transaction-four-pools/fig-04.png)

*Fig 04. Eight steps from build to discovery. Notice that the recipient never talks to the node: it learns about its payment from compact blocks served by an indexer.*

1. **Build.** The sender's wallet selects notes it owns, picks an anchor (a recent root of the note commitment tree), creates the outputs and their encrypted memos, and produces the zero-knowledge proof. In Corridor's lane this is a PCZT, a partially constructed transaction, passed through create, prove, sign and combine stages (ZIP 374). Lecture 6 is entirely about that pipeline.
2. **Submit.** The finished transaction goes to an indexer's `SendTransaction` gRPC method, or straight to a node's `sendrawtransaction` RPC.
3. **Verify for the mempool.** The node checks the proof, every signature, that the anchor is a real past root, that no nullifier has been spent before, and that the fee meets policy. Only then does it enter the mempool.
4. **Gossip.** The node relays it to peers. This is where a fee-policy disagreement between implementations can strand a transaction.
5. **Mine.** A miner's block template includes it. Our specimen was mined at testnet height 4,412,453 in a block with exactly two transactions: the coinbase and our payment.
6. **Commit.** Every node that accepts the block appends the new note commitments to the pool's tree, adds the nullifiers to the spent set, and updates the pool's value balance. Hold on to that last part.
7. **Index.** The indexer reduces the block to a compact block: just the fields a wallet needs to detect its own payments.
8. **Discover.** The recipient's wallet downloads compact blocks, tries to decrypt each output with its viewing key, and finds the one meant for it. Because compact blocks leave memos out, it then fetches the full transaction to read the memo.

Step 8 is where most of a wallet backend's cost lives, and it is the subject of Lecture 2. For today, the point is simpler: there is no step where the recipient asks the node "do I have money?" Discovery is trial decryption over a stream, and that is a very different scaling problem from querying an address index.

# Part II: The transaction

## 4. Meet our specimen

Our specimen is a real transaction on Zcash **testnet**:

```text
txid    de5d25625a372d6d79d0b071f0727cdcf8a8718c48d69057fd060825c09d4a7b
height  4,412,453 (testnet)
size    15,478 bytes
```

It is the first batch the Corridor shielded lane ever settled: one transaction paying three suppliers, each with an encrypted invoice memo, which an auditor later matched three out of three using only a viewing key. I chose it because it is small enough to read in a lecture and real enough to have the awkward details that synthetic examples hide.

I fetched the raw bytes from a public lightwallet server with a few lines of Rust, using the `GetTransaction` call from step 8 of Fig 04 (the full program is in the lab), and parsed them with a short Python script that follows the v6 layout in ZIP 229 field by field. Everything in this part comes from those bytes. You will reproduce all of it yourself at the end.

![Fig 05. The 15,478 bytes of our specimen, drawn to scale](/writing/zcash-stack-after-nu7-one-transaction-four-pools/fig-05.png)

*Fig 05. The whole transaction drawn to scale. Three quarters of it is one proof.*

Before we zoom in, look at the proportions in Fig 05, because they teach the first lesson about cost. The header and counters are 26 bytes. The four shielded actions are 3,280 bytes. The proof is 11,808 bytes, 76% of everything. If you are ever asked why shielded transactions are larger than transparent ones, the honest one-line answer is: mostly the proof.

## 5. Reading the header: twenty bytes that pin the rules

The first twenty bytes are the same in every v6 transaction, and they tell a node which rulebook to apply. All integers are little-endian, so read each group of hex digits right to left.

| Offset | Bytes | Field | Raw hex | Decoded |
| --- | --- | --- | --- | --- |
| 0 | 4 | `header` | `06000080` | 0x80000006: the top bit is `fOverwintered`, always set; the low bits are version **6** |
| 4 | 4 | `nVersionGroupId` | `98b684d8` | 0xD884B698, the value ZIP 229 requires for v6 |
| 8 | 4 | `nConsensusBranchId` | `5b16a537` | 0x37A5165B, the **NU6.3** branch ID from ZIP 258 |
| 12 | 4 | `lock_time` | `00000000` | 0, no time lock |
| 16 | 4 | `nExpiryHeight` | `4a544300` | 4,412,490 |

Two of these deserve a pause.

**The consensus branch ID is a promise about which rules the signer agreed to.** It is part of what gets signed, so a transaction built for NU6.3 cannot be replayed under different rules. That safety property has a cost every wallet team feels: each network upgrade changes the branch ID, so every wallet has to ship a release, even when the transaction format itself does not change. NU7 did exactly that, moving the branch ID to 0x77190AD9. Lecture 9 looks at ZIP 248, the draft that tries to stop upgrades from breaking wallets this way.

**The expiry height is a deadline, and here it tells a small story.** librustzcash builds transactions with a default expiry delta of 40 blocks, so this one was built when the chain's next block was 4,412,450, and it was mined at 4,412,453, three blocks later. Had it sat in the mempool past 4,412,490, nodes would have dropped it. For a payments backend this is a gift: a transaction that has not been mined by its expiry height never will be, so "pending" has a hard upper bound, and your retry logic can be exact instead of hopeful.

## 6. Four pools, six counters

The next six bytes are the most compact summary of the transaction you will ever see.

| Offset | Field | Value | Meaning |
| --- | --- | --- | --- |
| 20 | `tx_in_count` | 0 | No transparent inputs |
| 21 | `tx_out_count` | 0 | No transparent outputs |
| 22 | `nSpendsSapling` | 0 | No Sapling spends |
| 23 | `nOutputsSapling` | 0 | No Sapling outputs |
| 24 | `nActionsOrchard` | 0 | No Orchard actions |
| 25 | `nActionsIronwood` | 4 | Four Ironwood actions |

A v6 transaction has a section for every pool: transparent, Sapling, Orchard and Ironwood. Each section starts with a count, and when the count is zero, everything else in that section is simply absent. That is why a transaction that touches only Ironwood pays just five bytes for the three pools it ignores [ZIP 229, Transaction Format, notes † ‡ § ◊].

For contrast, here is the other transaction in the same block, the coinbase that paid the miner: one transparent input, two transparent outputs, and zeros everywhere else, 181 bytes in all. Its expiry height is exactly the block height, 4,412,453, which is the rule for coinbase transactions. Its input script even carries the mining pool's ASCII tag, `Foundry Zcash Pool #PrivacyMatters`. Same format, same header, entirely different shape: the format is a set of optional pool sections, and each transaction fills in the ones it uses.

Now, why four actions for three suppliers? Because an action is not "one payment". **An action is a slot that can spend one note and create one note at the same time.** Three of the new notes go to the suppliers; the fourth is change returning to the vault. Where an action has nothing real to spend, the wallet fills the spend side with a dummy, so from outside every action looks the same. That uniformity is deliberate: an observer cannot count real spends or real recipients from the action count alone, only bound them.

## 7. Inside one action: 820 bytes and who can read them

Every Orchard-protocol action, in Orchard or Ironwood, is exactly 820 bytes, in seven fields. Here is action 0 of our specimen.

![Fig 06. The anatomy of one 820-byte action, and who can read each part](/writing/zcash-stack-after-nu7-one-transaction-four-pools/fig-06.png)

*Fig 06. Seven fields. Everyone can see all 820 bytes; the colour shows who can make sense of them.*

| Field | Bytes | What it is | Who can make use of it |
| --- | --- | --- | --- |
| `cv` | 32 | A commitment to the value moving through this action. It hides the amount but can be added to other commitments | Everyone, but only in sums: this is how the binding signature proves the books balance |
| `nullifier` | 32 | A unique marker for the note being spent | Every node stores it; a second use of the same nullifier is a double spend and is rejected. Only the owner could have computed it, and it cannot be linked back to the note it spends |
| `rk` | 32 | A randomized public key for this spend | Nodes use it to check the spend authorization signature |
| `cmx` | 32 | The commitment to the newly created note | Appended to the pool's note commitment tree. It is the leaf a future spend will prove membership against |
| `ephemeralKey` | 32 | A one-time public key for this output | The recipient combines it with their viewing key to derive the decryption key |
| `encCiphertext` | 580 | The encrypted note: recipient, value, randomness and a **512-byte memo**, plus a 16-byte tag | The recipient, or anyone holding their incoming viewing key |
| `outCiphertext` | 80 | Lets the sender recover what they sent | The sender, with their outgoing viewing key |

Look at where the money is. The value appears twice: committed in `cv` and encrypted inside `encCiphertext`. Neither is readable by a chain observer, yet the chain can still check that the transaction balances, because value commitments add up and the binding signature proves the total equals the declared value balance. This is the second appearance of today's big idea: the chain does arithmetic on amounts it cannot see.

Look also at the 512-byte memo inside the 580-byte ciphertext. That is where Corridor puts its invoice reference, `INV-… / corridor:<ref>`, and where sealForge puts its bid commitment. It is also why, in step 8 of Fig 04, the recipient has to fetch the full transaction: a compact block keeps only the nullifier, `cmx`, `ephemeralKey` and the first 52 bytes of `encCiphertext`, which is enough to detect a payment and learn its value, and drops the memo to stay small. Lecture 4 treats that memo as a reconciliation key and designs the format carefully.

## 8. The bundle trailer: flags, balance, anchor, proof and signatures

After the four actions come the fields that apply to the Ironwood bundle as a whole.

| Offset | Bytes | Field | Value in our specimen |
| --- | --- | --- | --- |
| 3,306 | 1 | `flagsIronwood` | `0x07`: `enableSpends`, `enableOutputs` and `enableCrossAddress` all set |
| 3,307 | 8 | `valueBalanceIronwood` | **+20,000** zatoshis |
| 3,315 | 32 | `anchorIronwood` | The root of the Ironwood note commitment tree that every spend in this bundle proves against |
| 3,347 | 3 | `sizeProofsIronwood` | 11,808 (a CompactSize: `fd` followed by a two-byte length) |
| 3,350 | 11,808 | `proofsIronwood` | One aggregated Halo 2 proof for all four actions |
| 15,158 | 256 | `vSpendAuthSigsIronwood` | Four 64-byte spend authorization signatures, one per action |
| 15,414 | 64 | `bindingSigIronwood` | One binding signature for the bundle |

Three of these are worth your full attention.

**The flags byte carries a 2026 scar.** `enableCrossAddress` is new at NU6.3. In the Orchard pool it must be zero, which is how the circuit enforces the seal from section 1: an Orchard action can only send to the address it spends from. In Ironwood it is set, because sending to other people is the whole point [ZIP 229, ZIP 2006].

**The value balance is the fee, and you can check it.** `valueBalanceIronwood` is the net value leaving the Ironwood pool: spends minus outputs. Here that is +20,000 zatoshis. With no transparent outputs and no other pools involved, value leaving the shielded pool has only one place to go, the fee. Now check it against ZIP 317, which charges a marginal fee of 5,000 zatoshis per logical action with a floor of two "grace" actions: 5,000 × max(2, 4) = 20,000. And remember that our specimen shared its block only with the coinbase: the miner's output in that coinbase is 125,020,000 zatoshis, and the trailing 20,000 is our fee arriving on the other side. You have just followed a fee from one transaction into another.

**The proof size is a formula, not a measurement.** ZIP 229 fixes it at 2,720 + 2,272 × n bytes for n actions, so four actions give 11,808 bytes, exactly what we read. For capacity planning this is wonderful news: a shielded transaction's size is predictable from its action count before you build it. It also explains why ZIP 317 prices by action and not by byte, and why NU7's new limits count shielded actions per block rather than bytes.

One more observation, and it is my favourite in the whole dissection. Corridor's lane also settled a batch from a **FROST 2-of-3 vault**, where no single server holds the spending key and two of three signers must cooperate (testnet transaction `878b44b8…`). I ran it through the same script. It is also 15,478 bytes, also four Ironwood actions, also a +20,000 fee, and its signatures are ordinary 64-byte signatures. Threshold custody leaves no trace in the transaction: the chain cannot tell a 2-of-3 vault from a single key. That is a privacy property and an operational one, and Lecture 6 builds on it.

## 9. How the chain counts money it cannot see

Now we can close the loop on the idea I asked you to hold since the history section.

Every node keeps a running balance for each pool. For a shielded pool, it is the negation of the sum of every `valueBalance` field ever accepted into that pool [ZIP 209]. Our specimen moved Ironwood's balance down by 20,000 zatoshis, the fee leaving the pool. The rule that makes this a safety mechanism is short: if accepting a block would make any pool's balance negative, or push the total supply above the maximum, every node must reject the block [ZIP 209].

![Fig 07. Per-pool accounting: the turnstile that bounds the damage of a broken pool](/writing/zcash-stack-after-nu7-one-transaction-four-pools/fig-07.png)

*Fig 07. Each pool is a separately audited account. Value crosses between pools in the open, so even a counterfeiting bug inside one pool cannot withdraw more than was ever deposited into it.*

Think about what that means in May 2026. Suppose someone had used the Orchard soundness bug to create notes from nothing. Inside Orchard those fake notes would be indistinguishable from real ones, because that is what a privacy protocol does. But to take value *out* of Orchard, they would have to cross the turnstile, and the turnstile would refuse to let Orchard's public balance go below zero. Counterfeiting inside one pool cannot inflate the total supply. That is why the network could respond by sealing one pool and opening a fresh one, rather than doubting all of Zcash.

The turnstile has a price, and as engineers we should name it. Amounts that cross between pools are public. ZIP 229 says so directly: the turnstile "reveals the amounts in each transaction that cross between pools, including the amounts migrated into the Ironwood pool" [ZIP 229, Privacy Implications]. Our specimen leaks exactly one number, its fee, because nothing else crossed. A transaction that migrates funds from Orchard into Ironwood, or shields from transparent, leaks the amount it moves. A backend that wants to stay private keeps its money inside one shielded pool and crosses rarely, in amounts that do not identify anyone. Lecture 5 turns that into a payout design.

# Part III: The lab

## 10. Run the stack and dissect a transaction yourself

Reading about bytes is not the same as reading bytes, so let's finish at the keyboard. You need Docker, a Rust toolchain and Python 3.

![Fig 08. The lab: a local regtest chain and the two tools we use on it](/writing/zcash-stack-after-nu7-one-transaction-four-pools/fig-08.png)

*Fig 08. What you will have running at the end of the lab. Zebra in regtest mode with every upgrade through NU6.3 active from block 1, Zaino serving compact blocks over gRPC, and your two tools pointed at it, or at a public testnet server.*

**Step 1: start a private chain.** sealForge ships a regtest setup that runs Zebra with no peers and no proof of work, so blocks are mined on demand. From a clone of [sealForge](https://github.com/Udoka-AM/sealForge):

```bash
scripts/regtest.sh up <your-miner-unified-address>   # Zebra + Zaino
scripts/regtest.sh mine 101                          # coinbase matures after 100 blocks
scripts/regtest.sh height
```

Then ask the indexer what it thinks the chain is. This is the same health check I run before pointing anything at a new server:

```bash
cargo run -p sealforge-chain --example probe_lightwalletd -- http://127.0.0.1:8137
```

It prints the chain name, the tip height and the consensus branch ID the server is on. Run it against `https://testnet.zec.rocks:443` too, and compare.

**Step 2: fetch raw transaction bytes.** This is the program I used for the specimen. It asks a lightwallet server for one transaction by id and prints the raw hex. Note the `reverse()`: transaction ids are displayed byte-reversed, the same convention Bitcoin uses.

```rust
use zcash_client_backend::proto::service::TxFilter;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let url = std::env::args().nth(1).unwrap();
    let mut txid = hex::decode(std::env::args().nth(2).unwrap())?;
    txid.reverse(); // displayed txids are byte-reversed
    let mut client = sealforge_chain::connect(&url).await?;
    let raw = client
        .get_transaction(TxFilter { block: None, index: 0, hash: txid })
        .await?
        .into_inner();
    println!("height {}\n{}", raw.height, hex::encode(&raw.data));
    Ok(())
}
```

**Step 3: dissect it.** Here is the whole dissector. It follows the ZIP 229 table top to bottom, asserts every structural rule it can (the version group ID, the proof-size formula, no trailing bytes), and prints each field with its offset.

```python
"""Dissect a Zcash v6 (NU6.3+) transaction, field by field, per ZIP 229."""
import struct, sys

class Reader:
    def __init__(self, raw): self.b, self.p, self.rows = raw, 0, []
    def take(self, n, name):
        v = self.b[self.p:self.p + n]
        self.rows.append((self.p, n, name, v)); self.p += n
        return v
    def u32(self, name): return struct.unpack('<I', self.take(4, name))[0]
    def i64(self, name): return struct.unpack('<q', self.take(8, name))[0]
    def compact(self, name):              # Bitcoin CompactSize
        first = self.b[self.p]
        size = {0xfd: 3, 0xfe: 5, 0xff: 9}.get(first, 1)
        v = self.take(size, name)
        return first if size == 1 else int.from_bytes(v[1:], 'little')

def action_bundle(r, pool):              # Orchard and Ironwood share this encoding
    n = r.compact(f'nActions{pool}')
    for i in range(n):
        for field, size in [('cv', 32), ('nullifier', 32), ('rk', 32), ('cmx', 32),
                            ('ephemeralKey', 32), ('encCiphertext', 580), ('outCiphertext', 80)]:
            r.take(size, f'{pool}.action[{i}].{field}')
    if n == 0: return 0, 0
    r.take(1, f'flags{pool}')
    balance = r.i64(f'valueBalance{pool}')
    r.take(32, f'anchor{pool}')
    proof_len = r.compact(f'sizeProofs{pool}')
    assert proof_len == 2720 + 2272 * n, 'proof size rule (ZIP 229)'
    r.take(proof_len, f'proofs{pool}')
    for i in range(n): r.take(64, f'{pool}.spendAuthSig[{i}]')
    r.take(64, f'bindingSig{pool}')
    return n, balance

def dissect(raw):
    r = Reader(raw)
    header = r.u32('header')
    assert header >> 31 == 1 and header & 0x7fffffff == 6, 'not a v6 transaction'
    assert r.u32('nVersionGroupId') == 0xD884B698
    branch = r.u32('nConsensusBranchId')
    r.u32('lock_time'); expiry = r.u32('nExpiryHeight')
    t_in = r.compact('tx_in_count')
    for i in range(t_in):
        r.take(36, f'tx_in[{i}].prevout')
        r.take(r.compact(f'tx_in[{i}].script_len'), f'tx_in[{i}].script')
        r.take(4, f'tx_in[{i}].sequence')
    t_out = r.compact('tx_out_count')
    for i in range(t_out):
        r.i64(f'tx_out[{i}].value')
        r.take(r.compact(f'tx_out[{i}].script_len'), f'tx_out[{i}].script')
    s_sp = r.compact('nSpendsSapling'); r.take(96 * s_sp, 'vSpendsSapling')
    s_out = r.compact('nOutputsSapling'); r.take(756 * s_out, 'vOutputsSapling')
    sap_balance = r.i64('valueBalanceSapling') if s_sp + s_out else 0
    if s_sp: r.take(32, 'anchorSapling')
    r.take(192 * s_sp, 'vSpendProofsSapling'); r.take(64 * s_sp, 'vSpendAuthSigsSapling')
    r.take(192 * s_out, 'vOutputProofsSapling')
    if s_sp + s_out: r.take(64, 'bindingSigSapling')
    orchard = action_bundle(r, 'Orchard')
    ironwood = action_bundle(r, 'Ironwood')
    assert r.p == len(raw), 'trailing bytes'
    print(f'v6 tx, {len(raw):,} bytes, branch {branch:#010x}, expiry height {expiry:,}')
    print(f'transparent {t_in} in / {t_out} out · sapling {s_sp} spends / {s_out} outputs '
          f'· orchard {orchard[0]} actions · ironwood {ironwood[0]} actions')
    print(f'value balances (zat): sapling {sap_balance:+,} · orchard {orchard[1]:+,} · ironwood {ironwood[1]:+,}')
    for off, n, name, v in r.rows:
        if n == 0 or ('.action[' in name and '.action[0].' not in name): continue
        print(f'{off:>6}  {n:>6}  {name:<28} {v[:12].hex()}{"…" if n > 12 else ""}')

if __name__ == '__main__':
    dissect(bytes.fromhex(sys.argv[1]))
```

Run it on our specimen and the first three lines should read:

```text
v6 tx, 15,478 bytes, branch 0x37a5165b, expiry height 4,412,490
transparent 0 in / 0 out · sapling 0 spends / 0 outputs · orchard 0 actions · ironwood 4 actions
value balances (zat): sapling +0 · orchard +0 · ironwood +20,000
```

**Exercises.** Do these before Lecture 2; each one checks one of today's outcomes.

1. Dissect the FROST batch, `878b44b81d518e5d5333f9d21e5f4d6017c6ce16afbdf484eb7a038b7edd355c`, and list every field that differs from the single-key specimen. Then explain why the list is so short.
2. Dissect the coinbase of testnet block 4,412,453, `d42ae723ce18124c5dc3fc33d30588c65f131ed4e663727acba6e2bdf6899e19`. Decode its two outputs and find where our specimen's fee went. Then find out what the second output is for (start with ZIP 207).
3. On your regtest chain, dissect the coinbase of block 1, then extend the script so it refuses a transaction whose branch ID is not one it recognises. Which upgrade's branch ID would you have to add for a chain past NU7?
4. Using the proof-size formula and ZIP 317, write a function that predicts the size and fee of a payout to N suppliers before you build it. Check it against the specimen. Keep it, because Lecture 5 needs it.

## What we covered, and where we go next

Let's check off the outcomes.

You can now name the five components that replaced zcashd: Zebra and Zakura validate, the indexer turns blocks into compact blocks, Zallet replaces the zcashd wallet, and librustzcash is the library underneath all the wallets. You can trace a payment through eight steps and say which component owns each one. You can read a v6 header and see from its branch ID that our specimen was built for NU6.3. You know what each of the 820 bytes in an action is for, and that only the recipient's viewing key opens the 580 that matter to them. And you know how the chain keeps honest books per pool without seeing a single amount.

Here are the numbers worth keeping in your head from today:

| What | Value | Source |
| --- | --- | --- |
| Our specimen | 15,478 bytes, 4 Ironwood actions, fee 20,000 zat | Testnet `de5d2562…`, dissected above |
| One Orchard-protocol action | 820 bytes, of which 580 is the encrypted note with a 512-byte memo | ZIP 229 |
| Proof size | 2,720 + 2,272 × actions bytes | ZIP 229 |
| Standard fee today | 5,000 zat per logical action, minimum 2 actions | ZIP 317 (ZIP 2009 proposes 1,000) |
| Default expiry | 40 blocks after the target height | librustzcash `DEFAULT_TX_EXPIRY_DELTA` |
| NU6.3 (Ironwood) | Mainnet height 3,428,143, branch ID 0x37A5165B | ZIP 258 |
| NU7 | Mainnet height 3,543,405, branch ID 0x77190AD9, 25-second blocks | Zebra 7.0.0, ZIP 218 |

**Next lecture: "One viewing key, a million customers".** We take step 8 of Fig 04, discovery, and price it. You will see why a shielded backend's cost grows with the number of keys it watches rather than the number of addresses it hands out, and we will design customer accounts around that fact, using Corridor's vault-per-customer model and sealForge's escrow-per-auction model as the two ends of the trade-off.

NOTE: Corridor's shielded lane and sealForge both run on Zcash testnet only. Neither has run on mainnet, and nothing here is financial advice. Ecosystem facts are as of 16 November 2026 and checked against the sources below; Zcash is moving quickly, so check the current ZIPs before you build on a detail.

If you work on any of these components, or you are building a Zcash backend and want to compare notes, I would like to hear from you, and both repositories are open to contributors.

## References

- [ZIP 229: Version 6 Transaction Format](https://zips.z.cash/zip-0229)
- [ZIP 258: Deployment of the NU6.3 Network Upgrade](https://zips.z.cash/zip-0258)
- [ZIP 257: Deployment of the Orchard Temporary Vulnerability Mitigation and NU6.2](https://zips.z.cash/zip-0257)
- [ZIP 2005: Ironwood Quantum Recoverability](https://zips.z.cash/zip-2005)
- [ZIP 2006: Restricting Transfers into the Orchard Pool](https://zips.z.cash/zip-2006)
- [ZIP 209: Prohibit Out-of-Range Chain Value Pool Balances](https://zips.z.cash/zip-0209)
- [ZIP 317: Proportional Transfer Fee Mechanism](https://zips.z.cash/zip-0317) and [ZIP 2009](https://github.com/zcash/zips/blob/main/zips/zip-2009.md) (proposed)
- [ZIP 218: 25-second Block Target Spacing](https://github.com/zcash/zips/blob/main/zips/zip-0218.md)
- [ZIP 225: Version 5 Transaction Format](https://zips.z.cash/zip-0225)
- [Zebra 7.0.0 release](https://forum.zcashcommunity.com/t/zebra-7-0-0-release/58442) and [Zebra `network_upgrade.rs`](https://github.com/ZcashFoundation/zebra/blob/main/zebra-chain/src/parameters/network_upgrade.rs)
- [Zakura](https://github.com/zakura-core/zakura), [Zallet](https://github.com/zcash/zallet), [Z3](https://github.com/ZcashFoundation/z3), [lightwalletd](https://github.com/zcash/lightwalletd), [Zaino](https://github.com/zingolabs/zaino), [Announcing Zingod](https://forum.zcashcommunity.com/t/announcing-zingod/58973)
- [Fee divergence between Zebra and Zakura](https://forum.zcashcommunity.com/t/fee-divergence-between-zebra-and-zakura-questions/58564)
- [compact_formats.proto](https://github.com/zcash/lightwallet-protocol/blob/main/walletrpc/compact_formats.proto)
- [Corridor: the Zcash shielded lane](https://github.com/Udoka-AM/corridor/blob/main/apps/docs/integrations/zcash.mdx) and [sealForge](https://github.com/Udoka-AM/sealForge)
