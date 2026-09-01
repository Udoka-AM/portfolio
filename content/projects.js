/* ---------------------------------------------------------------------------
   Selected work.

   `kind` doubles as the tile's eyebrow, so it has to say something true about
   the state of the thing — not a serial number.

   `hard` is the part worth reading: what went wrong, or the decision that cost
   something, stated plainly. Keep it specific.

   `featured` promotes a tile to the accent border. Keep it to two or three.
--------------------------------------------------------------------------- */

export const PROJECTS = [
  {
    name: "Arc",
    kind: "simulation",
    featured: true,
    line: "Cross-border stablecoin payments: double-entry ledger, settlement saga, chaos suite.",
    hard: "Reversing the compensation order passed all sixteen tests. The journal balanced and described the wrong step.",
    tags: ["TypeScript", "Ledger", "Sagas", "Postgres"],
  },
  {
    name: "Agents Circle",
    kind: "two runtimes",
    featured: true,
    line: "Custody-preserving vaults for autonomous trading agents, built twice against one specification.",
    hard: "Solana gives each vault a PDA. On EVM that is pointless gas, so the accounting had to change and the security properties did not.",
    tags: ["Rust", "Anchor", "Solidity", "Foundry"],
  },
  {
    name: "Fiat-Crypto Tracker",
    kind: "protocol · magicblock",
    featured: true,
    href: "https://github.com/Udoka-AM/fiat-crypto-tracker",
    line:
      "Protocol-level MagicBlock ephemeral rollup integration for cross-border rate infrastructure. An Anchor program holds fiat-to-crypto rates in a PDA, delegates that account to an ephemeral rollup for high-frequency oracle writes, then settles back to Solana mainnet. Built for the everyday case: quoting USD against NGN often enough to be useful, at a cost that survives it.",
    hard:
      "Delegation is implemented twice on two branches — by hand on serializebypass, through the SDK macros on mbInt. Keeping both is the point: the macros hide exactly the serialisation the manual path has to get right. Presented as the MagicBlock integration demo at the Web3Lagos Conference 2025 workshop.",
    tags: ["Rust", "Anchor", "MagicBlock ER", "Oracles"],
  },
  {
    name: "StakeZone",
    kind: "in progress",
    href: "https://github.com/Udoka-AM/stakezone",
    line:
      "A global prediction market on Fantasy Premier League performance, settled on Solana. Managers import an existing FPL team, stake against a weekly pool, and are paid out on tiered percentiles once official results land. Anchor program covers pool creation, entry, scoring, and distribution.",
    hard:
      "Each market is its own liquidity pool, funded entirely by entrants — no market makers, no capital of mine at risk. That makes escrow the whole design: funds lock at entry and cannot move until the oracle reports, so the failure everyone should worry about is a result feed that never arrives.",
    tags: ["Rust", "Anchor", "SPL", "FPL API"],
  },
  {
    name: "RetinaOS",
    kind: "live",
    line: "Token discovery, wallet reputation, and a grounded market analyst for a chain with no tooling.",
    hard: "Shipped on keyless public APIs. The twenty-second refresh ceiling is written in the README, not hidden.",
    tags: ["TypeScript", "Node", "Public APIs"],
  },
  {
    name: "bagsMarkets",
    kind: "in progress",
    line: "Market intelligence and trading operations for Solana: wallet-only identity, developer signals, and a job runtime with retries and a dead-letter queue.",
    hard: "npm records platform-specific binaries only for the platform that resolved them, so a lockfile built on macOS quietly omits what Linux CI needs. It broke the build three times before it got written down.",
    tags: ["TypeScript", "Solana", "Queues", "Postgres"],
  },
  {
    name: "Orynth",
    kind: "in progress",
    line: "Signal ingestion that will not call something an opportunity without evidence from two independent sources.",
    hard: "Entities with no signals were being scored against mock fixtures and fabricating results.",
    tags: ["TypeScript", "Ingestion", "Scoring"],
  },
];
