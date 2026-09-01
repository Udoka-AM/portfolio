/* ---------------------------------------------------------------------------
   Documentation.

   The product docs are Mintlify deployments and stay there — this section is
   the crawlable index that points at them. `where` names the host so a reader
   knows they are leaving, and the outbound links carry no `nofollow`, so the
   relationship is visible to a crawler.
--------------------------------------------------------------------------- */

export const DOCS = [
  {
    name: "Solana Developer Resources",
    where: "GitHub",
    href: "https://github.com/Udoka-AM/Solana-developer-resources",
    line:
      "An open collection for getting started on Solana — the reading, tooling, and reference material worth having in order, rather than scattered across a dozen tabs.",
  },
  {
    name: "Arc",
    where: "Mintlify",
    href: "https://arc-doc.mintlify.site/",
    line:
      "Ledger invariants, the settlement state machine, and the chaos suite that proves them.",
  },
  {
    name: "Agents Circle",
    where: "Mintlify",
    href: "https://agent-circle.mintlify.app/",
    line:
      "One specification, two runtimes: PDA custody on Solana against a singleton on EVM.",
  },
  {
    name: "RetinaOS",
    where: "Mintlify",
    href: "https://retinaos.mintlify.app/",
    line:
      "Public API surface, refresh ceilings, and the wallet reputation model, stated up front.",
  },
];
