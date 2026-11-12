/* ---------------------------------------------------------------------------
   Flagship projects.

   The four things this page is about. Every proof line carries the network it
   happened on, because "live" means nothing without it: mainnet is money,
   testnet and devnet are rehearsals, and the page says which is which.

   `net` drives the badge colour: mainnet reads as proven, everything else as
   not yet. `next` is what is still missing, stated plainly so nobody has to
   find it in a README.

   `team` lists people only where a team exists and each person has agreed to
   be named. Leave it out for solo work.
--------------------------------------------------------------------------- */

export const FLAGSHIP = [
  {
    id: "nelo",
    name: "Nelo",
    chains: "Solana",
    kind: "merchant payments",
    problem:
      "A shopkeeper takes stablecoin payments on the Android phone they already own and gets naira in their own bank account, even when the network drops mid-sale.",
    edge:
      "Solana's secp256r1 precompile verifies the phone's secure-element signature on chain, so a key that never leaves the chip can authorise a payment.",
    proof: [
      {
        net: "mainnet",
        text: "USDC cashed out to a Nigerian bank in 91 seconds",
        href: "https://github.com/Udoka-AM/nelo/blob/main/docs/EVIDENCE.md#mainnet-cash-out-proof",
      },
      {
        net: "devnet",
        text: "Offline payments: both phones without network, settled on reconnect",
        href: "https://explorer.solana.com/tx/5gkSdViA4ThH2v9DyLoP1X4XEdhh48sMrC3WEki5tuZKambZ2QfRsMrsMkPjYR3J5hpp2jkxCLYBozzmgZZ5BdRu?cluster=devnet",
      },
    ],
    next: "Not yet: vault audit, store launch, offline payments on mainnet.",
    links: [
      { label: "Demo video", href: "https://github.com/Udoka-AM/nelo/blob/main/docs/DEMO.md" },
      { label: "Evidence", href: "https://github.com/Udoka-AM/nelo/blob/main/docs/EVIDENCE.md" },
      { label: "Site", href: "https://udoka-am.github.io/nelo/" },
      { label: "Code", href: "https://github.com/Udoka-AM/nelo" },
    ],
  },
  {
    id: "corridor-finance",
    name: "Corridor Finance",
    chains: "Tempo · Stellar",
    kind: "cross-border payouts",
    problem:
      "Payment companies send stablecoin payouts into Africa that settle exactly once, on their own keys, with every bank credit traceable to the on-chain payment that caused it.",
    edge:
      "Tempo's stablecoin-native assets and memos carry one 32-byte reference into the bank narration. On Stellar, anchors and SEPs reach local payout partners, and the same reference fits MEMO_HASH exactly.",
    proof: [
      {
        net: "mainnet",
        text: "2.90 USDC.e on Tempo became ₦3,891.48 in a Nigerian bank in 74 seconds (11 Oct 2026)",
        href: "https://corridor.udokaam.dev/status/evidence",
      },
      {
        net: "testnet",
        text: "Corridor Hub and the Ramp payout API run end to end on Stellar testnet, against Stellar's Anchor Platform (SEP-31)",
        href: "https://docs.corridorfinance.tech/status/evidence/",
      },
    ],
    next: "Not yet: no anchor signed on Stellar, and no local currency moved there.",
    links: [
      { label: "corridorfinance.tech", href: "https://corridorfinance.tech" },
      { label: "Tempo docs", href: "https://corridor.udokaam.dev" },
      { label: "Hub + Ramp docs", href: "https://docs.corridorfinance.tech" },
      { label: "Code", href: "https://github.com/CorridorHub" },
    ],
    team: ["Udoka A.M.", "David Pere", "Etinosa", "Onyela"],
  },
  {
    id: "agent-circle",
    name: "Agent Circle",
    chains: "Hyperliquid",
    kind: "AI trading agents",
    problem:
      "Traders back AI trading agents without handing over custody: the agent can trade the vault, and only the trader can withdraw.",
    edge:
      "Each vault is a HyperEVM contract with its own HyperCore account, so one account reaches perps, HIP-3 and HIP-4 markets, and the contract checks position and drawdown limits before every order.",
    proof: [
      {
        net: "testnet",
        text: "Contracts on HyperEVM testnet (chain 998) since 4 Nov · 246 tests, 98.3% line and 85.2% branch coverage",
        href: "https://github.com/Agents-Circle/agent-circle-evm",
      },
      {
        net: "testnet",
        text: "Public testnet and Circle Arena Season 0, a paper-trading season, run 16 Nov to 5 Dec",
        href: "https://docs.agentscircle.network",
      },
    ],
    next: "Unaudited. Builder codes and fast mode come later.",
    links: [
      { label: "agentscircle.network", href: "https://agentscircle.network" },
      { label: "Docs", href: "https://docs.agentscircle.network" },
      { label: "Code", href: "https://github.com/Agents-Circle" },
    ],
    team: ["Udoka A.M.", "David Pere"],
  },
  {
    id: "sealforge",
    name: "sealForge",
    chains: "Zcash",
    kind: "private markets",
    problem:
      "Sealed-bid auctions where every bid stays private and anyone can still recompute the clearing price, the winners and every bidder's outcome.",
    edge:
      "Shielded transfers hide the bids, a published viewing key lets anyone rescan the chain after close, and FROST 2-of-3 splits escrow authority across three trustees.",
    proof: [
      {
        net: "testnet",
        text: "Two auctions settled on Zcash testnet, with 7 and 25 bids (v0.1.0)",
        href: "https://github.com/Udoka-AM/sealForge/blob/main/docs/evidence/testnet-genesis.md",
      },
      {
        net: "testnet",
        text: "Refund linkability measured at 0.1%, against 100% for the naive design",
        href: "https://github.com/Udoka-AM/sealForge/blob/main/docs/evidence/linkability.md",
      },
    ],
    next: "Not yet: mainnet needs caps, independent trustees and an external review.",
    links: [
      { label: "sealforge.udokaam.dev", href: "https://sealforge.udokaam.dev/" },
      { label: "Audit view", href: "https://sealforge.udokaam.dev/audit/" },
      { label: "Code", href: "https://github.com/Udoka-AM/sealForge" },
    ],
  },
];
