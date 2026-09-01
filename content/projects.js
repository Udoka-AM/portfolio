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
    name: "Arc",
    kind: "simulation · docs",
    featured: true,
    href: "https://arc-doc.mintlify.site/",
    line:
      "Cross-border stablecoin and fiat infrastructure for the EU↔Africa corridor — the backend of a payments business that moves money between Europe and Africa in seconds. Multichain rails, a double-entry ledger, and settlement modelled as a finite state machine so every transfer has one legal next step.",
    hard:
      "Reversing the compensation order passed all sixteen tests. The journal balanced and described the wrong step.",
    tags: ["TypeScript", "Ledger", "Sagas", "Postgres"],
  },
  {
    name: "Agents Circle",
    kind: "two runtimes",
    featured: true,
    href: "https://agentscircle.vercel.app",
    line:
      "A marketplace for autonomous trading agents in prediction markets. Developers list self-built, self-hosted agents; traders allocate capital those agents trade on their behalf. Custody-preserving vaults built twice against one specification — Anchor on Solana, Solidity on Polygon.",
    hard:
      "Solana gives each vault a PDA. On EVM that is pointless gas, so the accounting had to change and the security properties did not.",
    tags: ["Rust", "Anchor", "Solidity", "Foundry"],
  },
  {
    name: "RetinaOS",
    kind: "live",
    featured: true,
    href: "https://retinaos.xyz",
    line:
      "The intelligence layer for Robinhood Chain: real-time token discovery, wallet reputation scoring, and a market analyst grounded in live on-chain data. Launched onto a chain barely a month old that was already among the highest by DEX volume — hundreds of tokens, no tooling built for the terrain.",
    hard:
      "Retina Terminal runs on free public data APIs, so the twenty-second refresh ceiling is written in the README rather than hidden. A first-party indexer for chain 4663 is in progress to replace them.",
    tags: ["TypeScript", "Next.js", "Robinhood Chain", "Indexer"],
  },
  {
    name: "Fiat-Crypto Tracker",
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
    kind: "security · rektoff",
    href: "https://github.com/Udoka-AM/Solana-Lending-Protocol-AUDIT",
    line:
      "A security audit of MetaLend, a Solana lending protocol — multi-asset markets, interest-bearing cTokens, flash loans with external callbacks, and oracle-priced liquidation. Eight vulnerabilities across static review and exploit development: five critical, two high, one medium. Real-time project for the Rektoff security cohort.",
    hard:
      "Findings are not claims. Each one ships with a test that runs the attack — flash-loan reentrancy through the external CPI callback, a PDA seed collision, and an oracle manipulation that makes a healthy position liquidatable.",
    tags: ["Rust", "Anchor", "Security audit", "Exploit dev"],
  },
];
