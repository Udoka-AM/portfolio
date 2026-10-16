/* ---------------------------------------------------------------------------
   Selected work, most recent first.

   `kind` doubles as the tile's eyebrow, so it has to say something true about
   the state of the thing — not a serial number.

   `line` is what it is. `hard` is the part worth reading: the failure, or the
   decision that cost something. Keep both tight; the tile is a hook, not a
   case study.

   `href` should be the best public destination — the live product where one
   exists, the docs where they are the real artefact, the repository otherwise.
   Never link a private repo.
--------------------------------------------------------------------------- */

export const PROJECTS = [
  {
    name: "sealForge",
    summary:
      "Sealed-bid auctions on Zcash. The clearing price is public; the bidders are not.",
    kind: "zecathon \u00b7 private markets",
    featured: true,
    href: "https://seaforge.udokaam.dev/",
    line:
      "An open-source kit for private, verifiable sales settled in shielded ZEC. Bid from any Zcash wallet by scanning one QR, escrow spend authority is split across three trustees with FROST 2-of-3, and after close anyone can rescan the chain with the published viewing key and recompute the price, the winners and every bidder\u2019s outcome.",
    hard:
      "A bid memo\u2019s refund address was stored unchecked, so a single malformed one broke every refund batch it joined \u2014 blocking refunds for everyone in that batch. Unusable addresses are now dropped at ingest: the bid still counts, and its refund goes to manual review.",
    tags: ["Rust", "Zcash", "FROST", "WASM"],
  },
  {
    name: "Corridor",
    summary:
      "Stablecoin settlement and treasury rails for payment companies moving money into and out of Africa.",
    kind: "settlement · live demo",
    featured: true,
    href: "https://corridorapp.udokaam.dev/",
    line:
      "Collect EUR or USD abroad and pay out NGN or KES without pre-funding foreign bank accounts. Tempo is the settlement hub, Solana carries on and off-ramp liquidity, an optional Zcash lane settles suppliers privately, and one double-entry ledger reconciles all three.",
    hard:
      "A live testnet hop burned the USDC and Circle's attestation completed, but the final mint is restricted to Across's own relayer, which never ran it. Every leg is compensated independently now, and funds sit in a Corridor address between hops rather than in flight.",
    tags: ["TypeScript", "Tempo", "Solana", "Zcash FROST"],
  },
  {
    name: "Tempo × Solana Swap",
    summary:
      "Non-custodial stablecoin swaps between Tempo and Solana, composed through Base.",
    kind: "live",
    featured: true,
    href: "https://tempo-solana-swap.pages.dev/",
    line:
      "Non-custodial stablecoin swaps between Tempo and Solana mainnet. The browser never holds a bridge credential — same-origin Pages Functions validate each leg, inject the integrator ID server-side, and hand back short-lived quotes.",
    hard:
      "Across has no direct Tempo↔Solana route, so every swap is composed as two independent legs through Base. Pairs it cannot actually fill are rejected rather than quoted synthetically — a real price or none.",
    tags: ["TypeScript", "Across", "Tempo", "Cloudflare Pages"],
  },
  {
    name: "Nelo",
    summary:
      "Card-free payments on the phone a shopkeeper already owns — and the sale still completes offline.",
    kind: "in progress · solana mobile",
    href: "https://udoka-am.github.io/nelo/",
    line:
      "Accept payments on the Android phone a shopkeeper already owns. The money settles in USDC on Solana, the merchant sees their own currency, and a licensed partner pays it into their own bank — and the sale still completes when neither phone has a network.",
    hard:
      "@noble/curves does not default to low-S on P-256, and a high-S signature does not settle on chain. Two facts that cost a day if you meet them late, now pinned by tests on every signing path.",
    tags: ["Rust", "Anchor", "StrongBox", "secp256r1"],
  },
  {
    name: "Arc",
    summary:
      "Cross-border stablecoin and fiat infrastructure for the EU↔Africa corridor.",
    kind: "simulation · docs",
    href: "https://arc.udokaam.dev/",
    line:
      "Cross-border stablecoin and fiat infrastructure for the EU↔Africa corridor — the backend of a payments business that moves money between Europe and Africa in seconds. Multichain rails, a double-entry ledger, and settlement modelled as a finite state machine so every transfer has one legal next step.",
    hard:
      "Reversing the compensation order passed all sixteen tests. The journal balanced and described the wrong step.",
    tags: ["TypeScript", "Ledger", "Sagas", "Postgres"],
  },
  {
    name: "Agents Circle",
    summary:
      "A marketplace for autonomous trading agents, with custody-preserving vaults built twice.",
    kind: "two runtimes",
        href: "https://agentscircle.network",
    line:
      "A marketplace for autonomous trading agents in prediction markets. Developers list self-built, self-hosted agents; traders allocate capital those agents trade on their behalf. Custody-preserving vaults built twice against one specification — Anchor on Solana, Solidity on Polygon.",
    hard:
      "Solana gives each vault a PDA. On EVM that is pointless gas, so the accounting had to change and the security properties did not.",
    tags: ["Rust", "Anchor", "Solidity", "Foundry"],
  },
  {
    name: "RetinaOS",
    summary:
      "The intelligence layer for Robinhood Chain — token discovery, wallet reputation, live analysis.",
    kind: "live",
        href: "https://retinaos.xyz",
    line:
      "The intelligence layer for Robinhood Chain: real-time token discovery, wallet reputation scoring, and a market analyst grounded in live on-chain data. Launched onto a chain barely a month old that was already among the highest by DEX volume — hundreds of tokens, no tooling built for the terrain.",
    hard:
      "Retina Terminal runs on free public data APIs, so the twenty-second refresh ceiling is written in the README rather than hidden. A first-party indexer for chain 4663 is in progress to replace them.",
    tags: ["TypeScript", "Next.js", "Robinhood Chain", "Indexer"],
  },
  {
    name: "Fiat-Crypto Tracker",
    summary:
      "Protocol-level MagicBlock ephemeral rollup integration for cross-border rate infrastructure.",
    kind: "protocol · magicblock",
    href: "https://github.com/Udoka-AM/fiat-crypto-tracker",
    line:
      "Protocol-level MagicBlock ephemeral rollup integration for cross-border rate infrastructure. An Anchor program holds fiat-to-crypto rates in a PDA, delegates it to a rollup for high-frequency oracle writes, then settles back to mainnet.",
    hard:
      "Delegation is implemented twice, on two branches — by hand, and through the SDK macros that hide exactly the serialisation the manual path has to get right. Demoed at Web3Lagos 2025.",
    tags: ["Rust", "Anchor", "MagicBlock ER", "Oracles"],
  },
  {
    name: "bagsMarkets",
    summary:
      "Market intelligence and trading operations for Solana, built around Bags.",
    kind: "in progress",
    href: "https://github.com/Udoka-AM/bagsMarket",
    line:
      "Market intelligence and trading operations for Solana, built around Bags: wallet-only identity, developer signals, semantic search over market history, and a job runtime with retries and a dead-letter queue.",
    hard:
      "npm records platform-specific binaries only for the platform that resolved them, so a lockfile built on macOS quietly omits what Linux CI needs. It broke the build three times before it got written down.",
    tags: ["NestJS", "Postgres + pgvector", "Bags SDK", "Helius"],
  },
  {
    name: "SprintIQ",
    summary:
      "An on-chain quiz platform for communities, with rewards settled on Solana.",
    kind: "live · grant",
    href: "https://github.com/Udoka-AM/SprintIQ",
    line:
      "An on-chain quiz platform for communities, with rewards settled on Solana. Organisers run timed rounds, players earn from a funded prize pool, and results resolve on-chain. Solana Foundation grant recipient.",
    hard:
      "Quiz rounds are real-time but settlement is not, so scoring had to be authoritative off-chain and only the payout committed on-chain — the alternative was paying for every wrong answer.",
    tags: ["TypeScript", "Next.js", "Anchor", "Prisma"],
  },
  {
    name: "StakeZone",
    summary:
      "A global prediction market on Fantasy Premier League performance, settled on Solana.",
    kind: "in progress",
    href: "https://github.com/Udoka-AM/stakezone",
    line:
      "A global prediction market on Fantasy Premier League performance, settled on Solana. Import an FPL team, stake against a weekly pool, get paid on tiered percentiles once official results land.",
    hard:
      "Each market is its own liquidity pool, funded entirely by entrants — no market makers. That makes escrow the whole design, and a result feed that never arrives the failure worth worrying about.",
    tags: ["Rust", "Anchor", "SPL", "FPL API"],
  },
  {
    name: "Orynth Lab",
    summary:
      "An operating-intelligence layer for founders — from market gap to launch to monitoring.",
    kind: "in progress",
    href: "https://github.com/Udoka-AM/orynthLabs",
    line:
      "An operating-intelligence layer for founders. It finds market gaps worth building into, reads the product being built, judges whether an onchain economy makes sense around it, hands off to Orynth for the launch, then keeps monitoring the company afterwards.",
    hard:
      "Entities with no signals were being scored against mock fixtures and fabricating results. Nothing is called an opportunity now without evidence from two independent sources.",
    tags: ["TypeScript", "Ingestion", "Scoring", "LLM"],
  },
  {
    name: "Solana Lending Protocol Audit",
    summary:
      "A security audit of a Solana lending protocol: eight findings, each with a working exploit.",
    kind: "security · rektoff",
    href: "https://github.com/Udoka-AM/Solana-Lending-Protocol-AUDIT",
    line:
      "A security audit of MetaLend, a Solana lending protocol — multi-asset markets, interest-bearing cTokens, flash loans with external callbacks, and oracle-priced liquidation. Eight vulnerabilities across static review and exploit development: five critical, two high, one medium. Real-time project for the Rektoff security cohort.",
    hard:
      "Findings are not claims. Each one ships with a test that runs the attack — flash-loan reentrancy through the external CPI callback, a PDA seed collision, and an oracle manipulation that makes a healthy position liquidatable.",
    tags: ["Rust", "Anchor", "Security audit", "Exploit dev"],
  },
];
