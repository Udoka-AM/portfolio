/* ---------------------------------------------------------------------------
   The position.

   Replaces the trial balance. Countable things carry a figure; things that
   genuinely are not countable carry a phrase instead. Nothing here is derived
   from anything else — every value is stated because it can be defended.

   `wide` promotes an entry to a full-width cell, for values that need room to
   explain themselves rather than assert a total.
--------------------------------------------------------------------------- */

export const FACTS = [
  {
    key: "Developers reached",
    value: "5,000+",
    note: "Talks, workshops, livestreams, YouTube, GitHub, docs, and posts",
  },
  {
    key: "Running since",
    value: "2022",
    note: "Hours are an input, not an outcome",
  },
  {
    key: "Events",
    value: "20+",
    note: "Conference talks, workshops, and livestreams — including the MagicBlock integration workshop at Web3Lagos 2025",
  },
  {
    key: "Ecosystems served",
    value: "9",
    note: "Solana · Arweave · WeaveDB · MagicBlock · QuickNode · Polytope Labs · Codecademy · Ingressive · University of Benin, Nigeria",
  },
  {
    key: "Documentation",
    value: "4",
    note: "Three product doc sites, plus an open Solana resource collection",
  },
  {
    key: "Runtimes targeted",
    value: "3",
    note: "Solana · EVM · Node",
  },
  {
    key: "Frameworks",
    value:
      "Rust · Anchor · Solidity · Foundry · TypeScript · Node.js · NestJS · Next.js · React · " +
      "Tailwind · Prisma · PostgreSQL · pgvector · Docker · web3.js · Mintlify",
    words: true,
    wide: true,
    note:
      "What the work is built on, across every repository. Named rather than counted, since the transitive dependency tree runs to hundreds.",
  },
];
