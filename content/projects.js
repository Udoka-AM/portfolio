// Selected work. `hard` is the part that is actually worth reading: the thing
// that went wrong, stated plainly. Keep it specific — it is the differentiator.

export const PROJECTS = [
  {
    name: "Arc",
    kind: "simulation",
    line: "Cross-border stablecoin payments: double-entry ledger, settlement saga, chaos suite.",
    hard: "Reversing the compensation order passed all sixteen tests. The journal balanced and described the wrong step.",
  },
  {
    name: "Agents Circle",
    kind: "two runtimes",
    line: "Custody-preserving vaults for autonomous trading agents, built twice against one specification.",
    hard: "Solana gives each vault a PDA. On EVM that is pointless gas, so the accounting had to change and the security properties did not.",
  },
  {
    name: "RetinaOS",
    kind: "live",
    line: "Token discovery, wallet reputation, and a grounded market analyst for a chain with no tooling.",
    hard: "Shipped on keyless public APIs. The twenty-second refresh ceiling is written in the README, not hidden.",
  },
  {
    name: "bagsMarkets",
    kind: "in progress",
    line: "Market intelligence and trading operations for Solana: wallet-only identity, developer signals, and a job runtime with retries and a dead-letter queue.",
    hard: "npm records platform-specific binaries only for the platform that resolved them, so a lockfile built on macOS quietly omits what Linux CI needs. It broke the build three times before it got written down.",
  },
  {
    name: "Orynth",
    kind: "in progress",
    line: "Signal ingestion that will not call something an opportunity without evidence from two independent sources.",
    hard: "Entities with no signals were being scored against mock fixtures and fabricating results.",
  },
];
