/* ---------------------------------------------------------------------------
   Documentation.

   The product docs are Mintlify deployments served from this domain — each on
   its own subdomain, so the keywords in them accrue here rather than to
   mintlify.app. `where` names the host, and the outbound links carry no
   `nofollow`, so the relationship stays visible to a crawler.
--------------------------------------------------------------------------- */

export const DOCS = [
  {
    name: "Solana Developer Resources",
    where: "GitHub",
    cta: "View repo",
    href: "https://github.com/Udoka-AM/Solana-developer-resources/tree/main/README.md",
    line:
      "Reading, tooling, and reference material for getting started on Solana, kept in order rather than scattered.",
  },
  {
    name: "Arc",
    where: "arc.udokaam.dev",
    cta: "Read docs",
    href: "https://arc.udokaam.dev/",
    line:
      "Ledger invariants, the settlement state machine, and the chaos suite that proves them.",
  },
  {
    name: "Agent Circle",
    where: "docs.agentscircle.network",
    cta: "Read docs",
    href: "https://docs.agentscircle.network",
    line:
      "Per-trader vaults on HyperEVM, each with its own HyperCore account: what the agent can do, what only the trader can do, and Circle Arena's seasons.",
  },
  {
    name: "RetinaOS",
    where: "retinaos.udokaam.dev",
    cta: "Read docs",
    href: "https://retinaos.udokaam.dev/",
    line:
      "Public API surface, refresh ceilings, and the wallet reputation model, stated up front.",
  },
  {
    name: "Corridor on Tempo",
    where: "corridor.udokaam.dev",
    cta: "Read docs",
    href: "https://corridor.udokaam.dev/",
    line:
      "The decision log, the hub-and-spoke routing model, and why settlement, liquidity and privacy each sit on a different chain.",
  },
  {
    name: "Corridor Hub + Ramp",
    where: "docs.corridorfinance.tech",
    cta: "Read docs",
    href: "https://docs.corridorfinance.tech",
    line:
      "The Stellar-native payout router and the hosted Ramp API: one integration instead of one per anchor, with the payout reference carried in MEMO_HASH.",
  },
  {
    name: "Nelo",
    where: "nelo.udokaam.dev",
    cta: "Read docs",
    href: "https://nelo.udokaam.dev/",
    line:
      "A card-free payment taken on the Android phone a shopkeeper already owns — settled in USDC on Solana, shown to them in their own currency, and paid into their own bank by a payout partner.",
  },
];
