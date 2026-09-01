/* ---------------------------------------------------------------------------
   Writing.

   `topic` fills the tile's bracketed eyebrow. `href` is optional — entries
   without one render as a tile with no link rather than a dead one, so an
   unpublished piece can sit here safely.
--------------------------------------------------------------------------- */

export const WRITING = [
  {
    title: "The journal that balanced and lied",
    topic: "mutation testing",
    words: "1,400 words",
    blurb:
      "Sixteen tests passed against a settlement saga whose compensation order was reversed. What a balanced journal does not tell you, and what mutation testing does.",
  },
  {
    title: "Why Polygon settles slower than Ethereum",
    topic: "finality",
    words: "900 words",
    blurb:
      "Block time is not settlement time. Where the difference comes from, and why a payments system has to care about the second number.",
  },
  {
    title: "The same protocol, twice: PDAs and a singleton",
    topic: "cross-runtime",
    words: "1,600 words",
    blurb:
      "One custody specification implemented on Solana and on EVM. Where the account model forces the accounting to diverge, and where the security properties have to hold anyway.",
  },
];
