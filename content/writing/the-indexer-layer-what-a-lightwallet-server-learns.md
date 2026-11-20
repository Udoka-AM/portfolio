---
title: "The indexer layer: what one lightwallet server costs, what it learns about each wallet, and when to run your own"
topic: "zcash from the protocol up · lecture 3"
blurb: "Lecture 3 of a ten-part engineering series. We measure what one wallet session costs a Zcash indexer, work out how many wallets one server can carry, list what each request tells the server, and check two independent servers against each other on mainnet."
date: 2026-11-20
draft: false
---

![The indexer layer: what one lightwallet server costs, what it learns about each wallet, and when to run your own](/writing/the-indexer-layer-what-a-lightwallet-server-learns/cover.png)

**Every shielded wallet and every shielded backend gets its view of the chain from an indexer it didn't write, so how many wallets can one of those servers carry, what does it learn about each of them, and what happens to you if it gets something wrong?**

In Lecture 2 we treated the compact block stream as something that just arrives. We priced the work a scanner does on it, sized the scanner for full blocks, and noted at the end that every payment you receive costs a second fetch, a request that names one transaction. Today we look at the servers that produce that stream. By the end of the lecture you will know what one wallet session costs a server in bytes and round trips, measured on mainnet, you will be able to estimate how many wallets one server can take, and you will have a table of exactly what each request in the protocol tells the person running it. Then we'll decide when a backend should stop using public servers, and what it should run instead.

**Welcome back to "Zcash from the protocol up".** This is the series where every lecture adds one working part to the same system, a shielded payout backend. The running example is still the shielded lane I built for Corridor Finance, which pays suppliers privately on Zcash testnet and lets an auditor check one customer's payments with a viewing key. The contrast case is still sealForge, my sealed-bid auction system, also on testnet. Today they disagree in a useful way, because one of them needs its indexer to be private and the other needs its auditor's indexer to be independent, and those turn out to be two different requirements.

**How this class works.** History where it explains a design, then the mechanism, then something you run. Every number today was either measured by me on 20 November 2026, with the program shown so you can repeat it, or comes from a protocol file, a release note or a source file I name. Where I'm making a judgement or an assumption rather than reporting a measurement, I'll say so, and today there's one big assumption, in the capacity model, that you should replace with your own traffic.

## What I expect you to know already

You need Lectures 1 and 2, or the equivalent: what a compact block carries and leaves out, that a wallet finds its money by trial decryption, and that every hit needs a second fetch for the memo. Beyond that, the working knowledge of a backend engineer covers it.

| You already know | Where we use it today |
| --- | --- |
| gRPC services, unary calls and server streams | The 22 methods of `CompactTxStreamer`, and which of them stream |
| TLS, and what it does and doesn't hide | What the server sees, against what someone watching the wire sees |
| Bandwidth and concurrency planning | How many wallets one server can carry, and what limits it first |
| Rate limits and per-client fairness | The admission limits in lightwalletd v0.6.2 and zingod v1.2 |
| Trusting a cache you don't control | What an indexer can get wrong, and how a wallet notices |
| Reading a little Rust and Python | Two short Rust programs and one Python planner in the lab |

**What you will be able to do by the end.** Five outcomes, checked off at the end:

1. Name the three indexer implementations you can run today and say what sits behind a public server's hostname.
2. Price one wallet session in bytes and round trips, and say which part of it grows with time offline.
3. Estimate how many wallets one server can carry from a bandwidth budget and a reconnect pattern.
4. Read the protocol's request list and say, for each request, what it tells the server about the wallet that sent it.
5. Decide when a backend should run its own indexer, and check an indexer against a second, independent one.

![Fig 01. The ten-lecture map, with today's lecture highlighted](/writing/the-indexer-layer-what-a-lightwallet-server-learns/fig-01.png)

*Fig 01. Lecture 3 is the middle of the wallet backend core. Lecture 2 sized the scanner, today we look at what feeds it, and Lecture 4 books what it finds.*

# Part I: The layer

## 1. Why there's a server between the wallet and the chain

A Zcash full node validates the chain. It isn't built to serve a million phones, and it was never meant to: its RPC interface answers questions about blocks and transactions in the node's own formats, and a wallet that asked it for every block would download every transparent input, every proof and every full 820-byte action it will never decrypt. So the Electric Coin Company put a separate service between the node and the wallet, **lightwalletd**. It reads blocks from the node, cuts each one down to a compact block (the 148-bytes-per-action format from Lecture 2) and serves the result over a gRPC service called `CompactTxStreamer`. The service definition lives in `service.proto` in the lightwallet-protocol repository, and every implementation since has kept to it, so a wallet can point at any of them.

There are three you can run today, and two of them are new enough that a lot of documentation hasn't caught up:

- **lightwalletd**, in Go, maintained in `zcash/lightwalletd`. Version 0.6.2 shipped on 18 November 2026, two days ago, with new admission limits that we'll come back to in section 5.
- **Zaino**, in Rust, from Zingo Labs, built to follow Zebra after `zcashd` was retired. Its latest release is 0.10.1, from 29 September 2026.
- **zingod**, also from Zingo Labs. Version 1.0.0 shipped on 7 November 2026 and its release notes include a migration guide "coming from Zaino 0.10", so read it as the next step after Zaino. It reads the chain from 1 to 64 validators it trusts, Zebra or Zakura, can also follow Zcash peers to keep serving through a validator outage, keeps its own indexes on disk, and serves the same `CompactTxStreamer` service. Version 1.2.0 came out yesterday, 19 November.

![Fig 02. The indexer layer: validators, indexers, and the wallets and backends that read from them](/writing/the-indexer-layer-what-a-lightwallet-server-learns/fig-02.png)

*Fig 02. Validation stays in the node and indexing moves to a separate process. Every wallet and every backend scanner talks to an indexer, never to the node directly, so whoever runs the indexer sees every wallet's requests.*

The split is the point of this lecture. The validator decides what the chain is. The indexer decides what each wallet is told the chain is, and it sees every request each wallet makes. Those are two different trust relationships, and most wallets hand the second one to a server they've never thought about.

## 2. What's actually serving wallets right now

Before we price anything, let's look at who is answering. Every implementation answers `GetLightdInfo` with its vendor, its version and the version string of the node behind it, so one call per server tells you what's running. I asked every public mainnet server I could find on 20 November 2026, using the lab's first program:

| Hostname | Indexer | Node behind it |
| --- | --- | --- |
| `zec.rocks` | ECC LightWalletD v0.6.1, built 2 November | Zebra 7.1.0 |
| `na.zec.rocks` | ECC LightWalletD v0.6.1 | Zebra 7.1.0 |
| `eu.zec.rocks` | ECC LightWalletD v0.6.1 | Zakura 1.8.8 on the first call, Zebra 7.1.0 on a later one |
| `ap.zec.rocks` | ECC LightWalletD v0.6.1 | Zakura 1.8.8 |
| `sa.zec.rocks` | ECC LightWalletD v0.6.1 | Zebra 7.1.0 |
| `zcash.mysideoftheweb.com` | ECC LightWalletD v0.6.0, built 20 October | Zebra 7.0.0 |
| `testnet.zec.rocks` (testnet) | ECC LightWalletD v0.6.1 | Zakura 1.8.8 |

Two older hostnames that still appear in wallet configs, `mainnet.lightwalletd.com` and `lwd1.zcash-infra.com`, no longer resolve.

Three things in that table matter for a backend. First, every public server I reached runs lightwalletd, none of them v0.6.2 yet, so the new limits from two days ago aren't deployed on the servers most wallets use. Second, the zec.rocks fleet mixes the two consensus implementations, and the same hostname answered from Zakura in one call and from Zebra in a later one. That's a load balancer doing its job, and it means you don't choose the node that answers you. In Lecture 1 I mentioned that Zebra and Zakura disagreed on the standard fee for a few weeks in October, and a transaction could relay through one and not the other; behind a mixed hostname, which node you got would decide whether your transaction went through. Third, the whole public mainnet I could find comes down to two operators, which will matter when we want an independent second opinion in section 8.

## 3. The request surface: 22 methods, four jobs

`service.proto` defines 22 methods on `CompactTxStreamer`. Grouped by what a wallet uses them for, there are only four jobs:

| Job | Methods | Notes |
| --- | --- | --- |
| Follow the chain | `GetLatestBlock`, `GetBlock`, `GetBlockRange`, `GetTreeState`, `GetLatestTreeState`, `GetSubtreeRoots`, `GetLightdInfo` | `GetBlockRange` is the stream from Lecture 2. Two nullifier-only variants are deprecated in favour of `GetBlockRange` with `poolTypes` |
| Fetch one transaction | `GetTransaction` | By txid only. The `(block, index)` form is in the message but not supported |
| Mempool and sending | `GetMempoolTx`, `GetMempoolStream`, `SendTransaction`, `GetStandardFee` | `GetStandardFee` is new, the ZIP 317 marginal fee as the node reports it |
| Transparent addresses | `GetTaddressTxids`, `GetTaddressTransactions`, `GetTaddressBalance`, `GetTaddressBalanceStream`, `GetAddressUtxos`, `GetAddressUtxosStream` | Index lookups, the exchange model from Lecture 2 section 1 |

`Ping` is the 22nd, and it's for testing only. Hold on to this grouping, because in Part III each group turns out to leak something different.

# Part II: What a wallet costs a server

## 4. Measured: one wallet session

A wallet that opens after some time offline does roughly the same things in the same order. It asks for the tip, streams compact blocks from where it stopped, fetches the commitment-tree data it needs to spend (a tree state, and subtree roots on a first sync), and makes one `GetTransaction` per payment it found. I measured each of those against mainnet on 20 November, three runs against `zec.rocks` and one against `eu.zec.rocks`, with a session that had been offline for one day, 3,456 blocks, ending at height 3,591,632. Then once on testnet for comparison:

| Request | Mainnet | Testnet |
| --- | --- | --- |
| `GetLatestBlock`, median of 10 | 172–208 ms | 199 ms |
| `GetBlockRange`, one day (3,456 blocks) | 9.08 MB in 5.8–9.3 s (0.97–1.57 MB/s) | 0.63 MB in 1.6 s |
| Shielded transactions in that day | 24,140, in 1,306 of 3,456 blocks | 1,031, in 910 blocks |
| `GetTreeState` | 2,600 bytes, about 200 ms | 2,344 bytes |
| `GetSubtreeRoots`, Orchard + Ironwood | 791 roots, 57 kB | 20 roots, 1.5 kB |
| `GetSubtreeRoots`, Sapling | 1,129 roots, 81 kB | 6 roots, 437 bytes |
| `GetTransaction`, 20 recent shielded txs | 198–221 ms, median 9,200 bytes, largest 15,625 | 214 ms, 9,166 bytes |

The byte count was identical to the byte in every run, which is what you'd want from a deterministic format. The time wasn't: the same 9.08 MB took between 5.8 and 9.3 seconds, and that spread is the server and the network, not the data.

Two things changed since Lecture 2, three days ago. A day of mainnet compact blocks is 9.08 MB now, about 2.6 kB per block, against 2.1 kB per block in the 5,000-block window I measured on 17 November. And 38% of blocks in this window had a shielded transaction, against 38% in the earlier one, so the share of non-empty blocks held steady while what's in them grew. Volume on this chain moves fast enough that any number you plan with should carry the date you measured it.

Look at what dominates the session. Everything except the block stream is small: a tree state is 2.6 kB, the subtree roots a wallet needs for Ironwood are 1.5 kB, and even a first sync's Orchard roots are 55 kB. Those are paid in round trips, about 200 ms each from my connection, not in bytes. The stream is paid in bytes, and its size depends on one thing only: how long the wallet was away. One day is 9 MB, a week is 64 MB, a month is 272 MB, and that's the number that decides how many wallets a server can carry.

![Fig 03. One wallet session after a day offline: what it asks for, and what each part costs](/writing/the-indexer-layer-what-a-lightwallet-server-learns/fig-03.png)

*Fig 03. A day's catch-up is 9.08 MB of compact blocks, and everything else in the session is a few kilobytes and a round trip. The second fetch repeats once per payment found, so its count depends on the wallet, not the chain.*

## 5. How many wallets can one server carry?

Now we can answer the question in the title, as a model with measured inputs. I didn't load-test anyone's public server to get it, and you shouldn't either. What we can do is find the first limit a server hits, and with these numbers that's the uplink.

Start with the cheap case. A wallet that stays connected and follows the tip receives 9.08 MB a day, which is about 105 bytes a second. A server with a 1 Gbit/s uplink, run at half capacity so it has headroom, has 62.5 MB/s to give, which is enough for roughly 600,000 always-connected wallets. Bandwidth isn't the problem for wallets that never leave.

Real wallets leave. Phones close apps, laptops sleep, and a wallet that opens after a day away needs the whole day at once, as fast as the server will send it. So the load on a server is set by two things you don't control: how long people stay away, and how many of them open the app in the same hour. The planner below takes both as inputs. The peak-hour share is my assumption, 10% of a day's opens in the busiest hour, and it's the input you should replace first with your own traffic:

```python
"""How many wallets can one indexer serve? A bandwidth model from your own measurements."""
import math, sys

BLOCKS_PER_DAY = 3456          # 86,400 s / 25 s (ZIP 218)

def plan(mb_per_day=9.08, days_away=1.0, peak_hour_share=0.10,
         uplink_gbps=1.0, headroom=0.5, stream_mb_s=1.4):
    """Wallets one server can take if each opens once a day after `days_away` offline."""
    catch_up_mb = mb_per_day * days_away                  # one wallet's sync on opening
    budget_mb_s = uplink_gbps * 125 * headroom            # usable uplink, MB/s
    opens_per_s = budget_mb_s / catch_up_mb               # syncs the uplink can feed per second
    wallets = int(opens_per_s * 3600 / peak_hour_share)   # if the peak hour holds this share of opens
    streams = math.ceil(opens_per_s * catch_up_mb / stream_mb_s)  # syncs in flight at the peak
    return {"catch_up_mb": round(catch_up_mb, 1), "wallets": wallets, "streams_at_peak": streams}

if __name__ == "__main__":
    days = float(sys.argv[1]) if len(sys.argv) > 1 else 1.0
    mb = float(sys.argv[2]) if len(sys.argv) > 2 else 9.08
    print(plan(mb_per_day=mb, days_away=days))
```

| Typical time away | Catch-up per open | Wallets one 1 Gbit/s server carries | Syncs in flight at the peak |
| --- | --- | --- | --- |
| 1 day | 9.1 MB | about 248,000 | 45 |
| 1 week | 63.6 MB | about 35,000 | 45 |
| 1 month | 272 MB | about 8,300 | 45 |

The interesting column is the last one. However long people stay away, a saturated uplink at the stream rate I measured, about 1.4 MB/s per wallet, carries about 45 syncs at once. What changes is how long each sync lasts, so a population of weekly users fills the same 45 slots with seven times the bytes and the server carries a seventh as many of them. If your wallet's users open it weekly, plan for weekly.

![Fig 04. Wallets one server can carry, by how long they stay away](/writing/the-indexer-layer-what-a-lightwallet-server-learns/fig-04.png)

*Fig 04. Capacity falls in proportion to time away, because catch-up bytes grow with it. The always-connected case at the top is bandwidth-cheap; the wallets that open once a month are the expensive ones. The peak-hour share of 10% is an assumption, so redraw this with your own traffic.*

**The software limits come next, and they changed this week.** lightwalletd v0.6.2 added three admission limits after a set of security advisories: at most 32 requests being received at once across all connections (`--max-concurrent-recv`), at most 16 MiB of `SendTransaction` data in flight, and a 30-second idle timeout on client streams. A request over a limit is refused with `UNAVAILABLE` instead of queued. zingod's limits are documented in its book: 2,048 requests in progress, lowered to as few as 128 while the CPU falls behind, at most 100 streams per connection, and each IP address (an IPv6 /64 counts as one) gets at most a sixteenth of the request limit, so "it takes 16 addresses to fill a node".

That last rule matters more to a backend than to a phone. A scanner fleet running from one IP address against someone else's zingod gets a sixteenth of the server, by design. And the zingod docs say plainly that "a refusal ends a wallet's sync: pepper-sync and librustzcash do not retry", so if you're building on librustzcash, the retry with backoff is your code to write.

## 6. Your backend is one very heavy wallet

Turn the model around and look at your own scanner. From Lecture 2, a scanner's CPU cost grows with the number of keys it watches. Its bandwidth doesn't. Corridor's lane, watching 500 vault keys, downloads the same 9.08 MB a day as a phone watching one, because the compact block stream is the same for every client. Keys cost cores and the chain costs bytes, and only the second one lands on the indexer.

What does land on the indexer from a backend is the second fetch, and it scales with payments received. A payout backend that receives 1,000 payments a day makes 1,000 `GetTransaction` calls, about 9 MB at the median size I measured and 1,000 round trips. That's modest for a server. It's also, as we're about to see, the most revealing thing a backend does.

# Part III: What the server learns, and what it can get wrong

## 7. What each request tells the server

TLS protects the connection from people watching the wire. It does nothing about the server, which reads every request in the clear because it has to answer it. So the right question for each method is: if the operator logged this request with the IP address and time it came from, what would they know?

| Request | What the operator learns | How bad |
| --- | --- | --- |
| `GetLightdInfo`, `GetLatestBlock`, `GetSubtreeRoots`, `GetMempoolStream` | That a wallet is online, and when | Low: everyone asks the same thing |
| `GetBlockRange(start, end)` | Where the wallet stopped last time, so how long it was away; on a first sync, roughly when the wallet was created | Medium: a timeline per IP |
| `GetTreeState(height)` | On a new wallet, its birthday height; on a spend, the anchor height it will use | Medium: a birthday is a strong fingerprint |
| `GetTransaction(txid)` | This IP cares about this transaction, which almost always means it's a payment to it or from it | High: it names the transaction |
| `SendTransaction(tx)` | This IP sent this transaction | High: it ties a transaction to its sender's network address |
| `GetTaddress*`, `GetAddressUtxos` | Every transparent address in the request, linked together as one owner | High: and the whole list arrives in one request |
| `GetMempoolTx(exclude)` | Which mempool transactions the wallet already has | Low to medium |

![Fig 05. What each request tells the server](/writing/the-indexer-layer-what-a-lightwallet-server-learns/fig-05.png)

*Fig 05. The block stream is the same for every wallet, which is what makes shielded scanning private from the server. The requests that break that sameness are the ones that name something: a transaction, an address, a height.*

Look at the top row against the rest. The compact block stream is private from the server for the same reason scanning is expensive: every wallet downloads everything, so asking for it says nothing about which parts you could decrypt. Everything you do afterwards with what you found is a request that names it.

The second fetch is the clearest case, so let's put a number on how much cover it gets. The obvious defence is decoys: when you fetch your transaction, fetch some others from the same block so the server can't tell which one you wanted. In the day I measured, the median non-empty mainnet block held **2** shielded transactions. So an in-block decoy hides you among about two candidates, and the server already knows the block, because it streamed it to you seconds ago. Decoys drawn from across the chain hide you better and cost about 9.2 kB and a round trip each, so ten of them per payment is ten times the second-fetch bill. That's a real option for a phone. For a backend there's a cheaper answer in section 9.

One more leak sits under all of these. Each row is one request, but the operator sees them together, by IP address and by connection, so a `GetBlockRange` that says "away for 19 hours", a `GetTreeState` with a birthday and three `GetTransaction` calls arriving from the same address make one profile. TLS hides none of that from the server, and someone watching the wire still sees the sizes and timing of the responses even when they can't read them.

## 8. What the server can get wrong, and how a wallet notices

The other half of trusting an indexer is integrity. A server can omit a transaction, so a wallet misses a payment. It can serve a stale tip or a branch the network has abandoned. It can refuse a `SendTransaction` or quietly not relay it. It can do all of these by mistake, from a stuck node or a bad deploy, far more often than on purpose, and a wallet should catch them either way.

librustzcash already checks a lot as it scans. In `zcash_client_backend/src/scanning.rs` the `ScanError` type names the checks: `PrevHashMismatch` when a block's parent hash doesn't match the previous block, `BlockHeightDiscontinuity` when heights skip, and `TreeSizeMismatch` when "the note commitment tree size ... at the proposed new block is not equal to the size at the previous block plus the count of this block's outputs". That last one is the important check against omission: each compact block carries the tree sizes in its `ChainMetadata`, so a server that drops one action from a block without adjusting the sizes fails the check right there.

What those checks can't catch is a server that lies consistently. A compact block's `header` field is reserved and empty, so the wallet never sees proof of work, and a server that drops a transaction and reduces every later tree size to match produces a chain that passes all three checks. The lie surfaces later, when the wallet's commitment tree no longer matches the real one and a spend gets rejected, which is a bad time to find out.

The cheap defence is a second opinion from someone else. Take two indexers run by different operators, ask both for the same blocks, and compare the hash, the parent hash and the three tree sizes. If any differ, one of them is wrong, and you stop trusting both until you know which. I ran that check on 20 November between `zec.rocks` and `zcash.mysideoftheweb.com`, sampling every 20th block over the latest 2,000: **100 heights, 0 disagreements**. That's the expected result, and it's the one you want logged every hour, because the day it changes is the day you need to know.

Independence is the point of the check, and it's narrower than it looks. Those two servers have different operators but run the same indexer software, and today the public mainnet has only two operators that I could find. A check between two servers behind the same load balancer would prove nothing at all, and a check whose second opinion runs the same software catches operator mistakes but not a bug the two share. Your own indexer on a different implementation, Zakura behind one and Zebra behind the other, gives you a stronger second opinion than any public server can.

## 9. The design: an indexer gateway for the lane

Now put it together for a backend. Everything that's bad about public indexers for a payout backend comes from two facts: the operator sees the requests that name your transactions, and you can't check a server you depend on without a second, independent one. Both are fixed by running the indexer yourself, and that's the makeshift component for this lecture: an **indexer gateway**.

![Fig 06. The lane's indexer gateway](/writing/the-indexer-layer-what-a-lightwallet-server-learns/fig-06.png)

*Fig 06. The scanner from Lecture 2 reads only from the backend's own indexer, which reads from two validators running different implementations. Second fetches and sends never leave the backend. A cross-checker compares sampled blocks against one public server, which only ever sees requests for blocks.*

The parts:

1. **Two validators, two implementations.** A Zebra node and a Zakura node. zingod takes up to 64 trusted validators and benches one that answers wrongly, and Lecture 8 is entirely about running the two side by side.
2. **Your own indexer.** zingod or lightwalletd, on the same private network as the scanner. Now the second fetch and `SendTransaction` go to your own process, and the only party that learns which transactions you care about is you.
3. **The scanner from Lecture 2**, reading only from that indexer. Because your indexer has no other users, the per-IP share and the admission limits are yours to set.
4. **A cross-checker.** Every N blocks, compare hash, parent hash and tree sizes between your indexer and one public server run by someone else, and page someone on any disagreement. The public server sees requests for blocks and nothing else, which tells it only that you exist.

The cost is operational: a validator's storage and sync time, an indexer's storage, and a process to monitor. zingod's operator docs ask for NVMe for its indexes, read through `mmap`, and offer a published index snapshot so a new node skips most of its first sync. For a backend that moves other people's money, that cost buys the two things in this lecture. For a phone wallet it usually doesn't, and that's why public servers exist.

**Where the two reference projects stand.** Corridor's lane today syncs through `zcash-devtool` against the public `testnet.zec.rocks`, which is fine for testnet, and its docs already name the Z3 node stack as the production path. For mainnet, the gateway above comes before the first real payout, because with a public server, every supplier payout the lane confirms is a `GetTransaction` the server operator can see. sealForge's design document made the same call early, choosing a self-hosted Zebra and indexer for "no third-party seeing our scan pattern".

sealForge also shows the requirement turned around. Its auditor checks an auction by rescanning the escrow with the published viewing key, and its threat model tells the auditor to do that through "a lightwallet server of the auditor's choice". If the auditor used the coordinator's indexer, a coordinator hiding a bid could have its own indexer hide the same bid, and the audit would agree with the lie. So the backend wants an indexer only it can see, and the auditor wants an indexer the backend doesn't run.

# Part IV: The lab

## 10. Probe a server, cross-check two, size a fleet

You need a Rust toolchain and Python 3. As in Lecture 2, the Rust programs run as examples inside sealForge's `sealforge-chain` crate, which already has the gRPC client and its TLS set up. From a clone of [sealForge](https://github.com/Udoka-AM/sealForge), save each one under `crates/sealforge-chain/examples/` and run it with `cargo run --release -p sealforge-chain --example <name>`.

**Step 1: price one wallet session.** This program prints what the server is running, then measures each part of a session that has been offline for N blocks: round trip, catch-up stream, tree state, subtree roots, and twenty second fetches. It's the program behind section 2's table and every number in section 4.

```rust
// indexer_session.rs: what one wallet session costs an indexer, and what it tells it.
// Usage: indexer_session <url> <blocks>
use std::time::Instant;

use prost::Message;
use sealforge_chain::connect;
use zcash_client_backend::proto::service::{
    BlockId, BlockRange, ChainSpec, Empty, GetSubtreeRootsArg, ShieldedProtocol, TxFilter,
};

fn median(mut v: Vec<f64>) -> f64 {
    v.sort_by(|a, b| a.partial_cmp(b).unwrap());
    v[v.len() / 2]
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let url = std::env::args().nth(1).unwrap();
    let n: u64 = std::env::args().nth(2).unwrap().parse()?;
    let mut c = connect(&url).await?;

    let info = c.get_lightd_info(Empty {}).await?.into_inner();
    println!("server: {} {} over {}", info.vendor, info.version, info.zcashd_subversion);

    // 1. Round trip: the floor under every request a wallet makes.
    let mut rtt = Vec::new();
    for _ in 0..10 {
        let t = Instant::now();
        c.get_latest_block(ChainSpec::default()).await?;
        rtt.push(t.elapsed().as_secs_f64() * 1e3);
    }
    let tip = c.get_latest_block(ChainSpec::default()).await?.into_inner().height;
    println!("GetLatestBlock: median {:.0} ms", median(rtt));

    // 2. Catch-up: one wallet that was offline for `n` blocks.
    let start = tip - n + 1;
    let t = Instant::now();
    let mut s = c
        .get_block_range(BlockRange {
            start: Some(BlockId { height: start, hash: vec![] }),
            end: Some(BlockId { height: tip, hash: vec![] }),
            pool_types: vec![],
        })
        .await?
        .into_inner();
    let (mut bytes, mut shielded_txs) = (0u64, Vec::new());
    let mut per_block = Vec::new();
    while let Some(b) = s.message().await? {
        bytes += b.encoded_len() as u64;
        let txs: Vec<_> = b
            .vtx
            .iter()
            .filter(|tx| !tx.ironwood_actions.is_empty() || !tx.actions.is_empty() || !tx.outputs.is_empty())
            .map(|tx| (b.height, tx.txid.clone()))
            .collect();
        if !txs.is_empty() {
            per_block.push(txs.len() as f64);
        }
        shielded_txs.extend(txs);
    }
    let secs = t.elapsed().as_secs_f64();
    println!(
        "GetBlockRange {n} blocks: {:.2} MB in {:.1} s ({:.2} MB/s), {} shielded txs in {} blocks, median {} per non-empty block",
        bytes as f64 / 1e6, secs, bytes as f64 / 1e6 / secs, shielded_txs.len(), per_block.len(),
        if per_block.is_empty() { 0.0 } else { median(per_block.clone()) }
    );

    // 3. Tree state: what a wallet asks for when it starts or spends.
    let t = Instant::now();
    let ts = c.get_tree_state(BlockId { height: tip - 1, hash: vec![] }).await?.into_inner();
    println!("GetTreeState: {} bytes, {:.0} ms", ts.encoded_len(), t.elapsed().as_secs_f64() * 1e3);

    // 4. Subtree roots: the shortcut that lets a wallet skip most of the tree.
    for (name, p) in [("sapling", ShieldedProtocol::Sapling), ("orchard", ShieldedProtocol::Orchard), ("ironwood", ShieldedProtocol::Ironwood)] {
        let t = Instant::now();
        let mut s = c
            .get_subtree_roots(GetSubtreeRootsArg { start_index: 0, shielded_protocol: p as i32, max_entries: 0 })
            .await?
            .into_inner();
        let (mut k, mut b) = (0, 0);
        while let Some(r) = s.message().await? {
            k += 1;
            b += r.encoded_len();
        }
        println!("GetSubtreeRoots {name}: {k} roots, {b} bytes, {:.0} ms", t.elapsed().as_secs_f64() * 1e3);
    }

    // 5. The second fetch: one GetTransaction per hit. This is the request that names a transaction.
    let sample: Vec<_> = shielded_txs.iter().rev().take(20).collect();
    let (mut lat, mut sizes) = (Vec::new(), Vec::new());
    for (_, txid) in &sample {
        let t = Instant::now();
        let raw = c
            .get_transaction(TxFilter { block: None, index: 0, hash: txid.clone() })
            .await?
            .into_inner();
        lat.push(t.elapsed().as_secs_f64() * 1e3);
        sizes.push(raw.data.len() as f64);
    }
    println!(
        "GetTransaction x{}: median {:.0} ms, median {:.0} bytes, max {:.0} bytes",
        sample.len(), median(lat), median(sizes.clone()),
        sizes.iter().cloned().fold(0.0, f64::max)
    );
    Ok(())
}
```

```bash
cargo run --release -p sealforge-chain --example indexer_session -- https://testnet.zec.rocks:443 3456
cargo run --release -p sealforge-chain --example indexer_session -- https://zec.rocks:443 3456
```

On my machine, the mainnet run printed:

```text
server: ECC LightWalletD v0.6.1 over /Zebra:7.1.0/
GetLatestBlock: median 208 ms
GetBlockRange 3456 blocks: 9.08 MB in 6.4 s (1.42 MB/s), 24140 shielded txs in 1306 blocks, median 2 per non-empty block
GetTreeState: 2600 bytes, 187 ms
GetSubtreeRoots sapling: 1129 roots, 81321 bytes, 234 ms
GetSubtreeRoots orchard: 770 roots, 55495 bytes, 320 ms
GetSubtreeRoots ironwood: 21 roots, 1533 bytes, 199 ms
GetTransaction x20: median 221 ms, median 9313 bytes, max 15625 bytes
```

The program fetches twenty real transactions it has no interest in. That's harmless, and it's also a small demonstration of section 7: the server now holds a log line saying your IP asked for those twenty.

**Step 2: cross-check two indexers.** This is the core of the gateway's cross-checker: two servers, the same heights, compare hash, parent hash and the three tree sizes.

```rust
// cross_check.rs: ask two independent indexers about the same blocks and compare.
// Usage: cross_check <url-a> <url-b> <blocks> <every>
use sealforge_chain::connect;
use zcash_client_backend::proto::service::{BlockId, ChainSpec, Empty};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let a_url = std::env::args().nth(1).unwrap();
    let b_url = std::env::args().nth(2).unwrap();
    let n: u64 = std::env::args().nth(3).unwrap().parse()?;
    let every: u64 = std::env::args().nth(4).unwrap().parse()?;
    let (mut a, mut b) = (connect(&a_url).await?, connect(&b_url).await?);
    for (name, c) in [("a", &mut a), ("b", &mut b)] {
        let i = c.get_lightd_info(Empty {}).await?.into_inner();
        println!("{name}: {} {} over {}", i.vendor, i.version, i.zcashd_subversion);
    }
    // Stay a few blocks behind the lower tip so both servers have settled.
    let tip_a = a.get_latest_block(ChainSpec::default()).await?.into_inner().height;
    let tip_b = b.get_latest_block(ChainSpec::default()).await?.into_inner().height;
    let top = tip_a.min(tip_b) - 10;
    let (mut checked, mut differ) = (0, 0);
    let mut h = top - n + 1;
    while h <= top {
        let x = a.get_block(BlockId { height: h, hash: vec![] }).await?.into_inner();
        let y = b.get_block(BlockId { height: h, hash: vec![] }).await?.into_inner();
        let sizes = |m: &Option<zcash_client_backend::proto::compact_formats::ChainMetadata>| {
            m.as_ref().map(|m| (m.sapling_commitment_tree_size, m.orchard_commitment_tree_size, m.ironwood_commitment_tree_size))
        };
        let same = x.hash == y.hash && x.prev_hash == y.prev_hash && sizes(&x.chain_metadata) == sizes(&y.chain_metadata);
        if !same {
            differ += 1;
            println!("height {h}: servers disagree");
        }
        checked += 1;
        h += every;
    }
    println!("{checked} heights checked from {} to {top}, {differ} disagreements", top - n + 1);
    Ok(())
}
```

```bash
cargo run --release -p sealforge-chain --example cross_check -- https://zec.rocks:443 https://zcash.mysideoftheweb.com:9067 2000 20
```

```text
a: ECC LightWalletD v0.6.1 over /Zebra:7.1.0/
b: ECC LightWalletD v0.6.0 over /Zebra:7.0.0/
100 heights checked from 3589654 to 3591653, 0 disagreements
```

It stays ten blocks behind the lower of the two tips, so a block one server has and the other hasn't reached yet doesn't show up as a false alarm. In production you'd also re-check a disagreement a few blocks later before paging anyone, because two honest servers can briefly sit on different sides of a one-block reorg.

**Step 3: size a fleet.** Save the planner from section 5 as `plan_indexer.py` and run it with your own numbers. The first argument is days away, the second your measured MB per day:

```bash
python3 plan_indexer.py 1
python3 plan_indexer.py 7
```

```text
{'catch_up_mb': 9.1, 'wallets': 247797, 'streams_at_peak': 45}
{'catch_up_mb': 63.6, 'wallets': 35399, 'streams_at_peak': 45}
```

**Exercises.** Do these before Lecture 4; each one checks one of today's outcomes.

1. Run Step 1's `GetLightdInfo` against every server your wallet or SDK has configured by default. Which ones resolve, what are they running, and how many different operators are behind them?
2. Run Step 1 with 3,456 blocks and with 24,192 blocks (a week). Is catch-up time linear in blocks on your connection? If not, where does it bend, and what does that do to the planner's stream rate?
3. Change the planner so a fraction of wallets stay connected all day and follow the tip. How much does moving 20% of users to a background sync raise the number of wallets one server carries?
4. A phone wallet can't run its own indexer. Design a second fetch for it that leaks less than one `GetTransaction` per payment, and price it in bytes and round trips using today's numbers. What's the smallest cover set you'd accept, and why?
5. Extend `cross_check` to also compare `GetTreeState` at one height between the two servers. Which kind of lie from section 8 does that catch that the block comparison alone might miss?

## What we covered, and where we go next

Let's check off the outcomes.

You can name the three indexers, lightwalletd, Zaino and zingod, and you know that every public mainnet server I found runs lightwalletd, over Zebra or Zakura, sometimes both behind one hostname. You can price a wallet session: about 200 ms per small request, and a catch-up stream of 9.08 MB per day offline that dominates everything else. You can estimate a server's capacity from its uplink and its users' habits, and you know the limits in lightwalletd v0.6.2 and zingod that refuse work rather than queue it. You can read the request list and say which requests name something, with `GetTransaction` and `SendTransaction` the clearest. And you know why a payout backend runs its own indexer over two validators, checked against a public server it never sends a txid to.

Here are the numbers worth keeping from today:

| What | Value | Source |
| --- | --- | --- |
| One day of mainnet compact blocks | 9.08 MB, about 2.6 kB per block | Measured, 20 Nov 2026, lab Step 1 |
| Round trip for a small request | about 200 ms from my connection | Measured, lab Step 1 |
| Second fetch, one shielded transaction | median 9.2 kB | Measured, 20 recent mainnet txs |
| Shielded txs per non-empty mainnet block | median 2 | Measured, one day to 3,591,632 |
| Wallets per 1 Gbit/s server, daily users | about 248,000, with a 10% peak hour | Model, lab Step 3 |
| lightwalletd v0.6.2 admission | 32 requests received at once, 16 MiB of sends | v0.6.2 release notes |
| zingod admission | 2,048 requests, 1/16 per IP, 100 streams per connection | zingod book, DoS protection |
| Cross-check, two operators | 100 heights, 0 disagreements | Measured, lab Step 2 |

**Next lecture: "A ledger that never books twice".** The scanner finds payments and the gateway fetches their memos. Next time we book them: a double-entry ledger that turns `(txid, output index)` into exactly one entry however many times the scanner, the second fetch or a reorg replays it, and that matches the chain when an auditor reruns the same scan.

NOTE: Corridor's shielded lane and sealForge both run on Zcash testnet only. Neither has run on mainnet, and nothing here is financial advice. The capacity figures are a model built on one day's measurements and an assumed peak hour, not a load test of anyone's server. Ecosystem facts are as of 20 November 2026 and checked against the sources below.

If you run a lightwallet server, public or private, I'd really like to compare session numbers with you, and both repositories are open to contributors.

## References

- [lightwallet-protocol](https://github.com/zcash/lightwallet-protocol): `walletrpc/service.proto` and `compact_formats.proto`
- [lightwalletd v0.6.2 release notes](https://github.com/zcash/lightwalletd/releases/tag/v0.6.2), including `--max-concurrent-recv`, `--max-concurrent-sendtx-mib` and `--client-stream-idle-timeout`
- [Zaino](https://github.com/zingolabs/zaino), release 0.10.1
- [zingod](https://github.com/zingolabs/zingod): v1.0.0 and v1.2.0 release notes, and the operator book's first-sync, DoS-protection and wallet-methods pages
- [librustzcash](https://github.com/zcash/librustzcash): `zcash_client_backend/src/scanning.rs`, the `ScanError` continuity checks
- [ZIP 218: 25-second Block Target Spacing](https://github.com/zcash/zips/blob/main/zips/zip-0218.md)
- [Lecture 1: The Zcash stack after NU7](https://udokaam.dev/writing/zcash-stack-after-nu7-one-transaction-four-pools/) and [Lecture 2: One viewing key, a million customers](https://udokaam.dev/writing/one-viewing-key-a-million-customers/)
- [Corridor: the Zcash shielded lane](https://github.com/Udoka-AM/corridor/blob/main/apps/docs/integrations/zcash.mdx) and [sealForge](https://github.com/Udoka-AM/sealForge), including `docs/02-TRD.md` and `docs/THREAT-MODEL.md`
