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
    key: "Systems shipped",
    value: "7",
    note: "Arc · Agents Circle · RetinaOS · bagsMarkets · Orynth · Fiat-Crypto Tracker · StakeZone",
  },
  {
    key: "Runtimes targeted",
    value: "3",
    note: "Solana · EVM · Node",
  },
  {
    key: "Documentation sites",
    value: "3",
    note: "Published and maintained alongside the systems they describe",
  },
  {
    key: "Ecosystems served",
    value: "7",
    note: "Solana · Arweave · WeaveDB · MagicBlock · Codecademy · Ingressive · University of Benin, Nigeria",
  },
  {
    key: "Running since",
    value: "2022",
    note: "Hours are an input, not an outcome",
  },
  {
    key: "Developers reached",
    value: "5,000+",
    wide: true,
    note:
      "Across conference talks, workshops, livestreams, YouTube, GitHub, documentation, and posts. " +
      "Different channels on different denominators — the surface area is the claim, not a single settled total.",
  },
  {
    key: "Frameworks",
    value: "Anchor · Foundry · Next.js · React · Node · Postgres · web3.js",
    words: true,
    wide: true,
    note:
      "What the work is built on. Named rather than counted, since the transitive dependency tree runs to hundreds.",
  },
];
