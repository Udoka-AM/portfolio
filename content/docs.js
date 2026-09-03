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
    name: "Agents Circle",
    where: "agentscircle.udokaam.dev",
    cta: "Read docs",
    href: "https://agentscircle.udokaam.dev/",
    line:
      "One specification, two runtimes: PDA custody on Solana against a singleton on EVM.",
  },
  {
    name: "RetinaOS",
    where: "retinaos.udokaam.dev",
    cta: "Read docs",
    href: "https://retinaos.udokaam.dev/",
    line:
      "Public API surface, refresh ceilings, and the wallet reputation model, stated up front.",
  },
];
