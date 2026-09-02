/* ---------------------------------------------------------------------------
   Worked with.

   `logo` points at a file in public/logos/. Entries without one fall back to a
   wordmark, so a missing asset degrades instead of breaking the row.

   Every logo here was taken from the organisation's own GitHub account and
   checked by eye. Three are wordmarks because no real mark could be sourced:
   University of Benin and bchainAfrica have GitHub identicons rather than
   logos, and NFTNG has no GitHub account and an empty site.

   `via` and `formerly` carry qualifications that would otherwise be lost.
--------------------------------------------------------------------------- */

export const WORKED_WITH = [
  { name: "QuickNode", logo: "/logos/quicknode.png" },
  { name: "Solana Foundation", via: "SuperteamNG", logo: "/logos/solana-foundation.png" },
  { name: "Arweave", logo: "/logos/arweave.png" },
  { name: "MagicBlock", logo: "/logos/magicblock.png" },
  { name: "Polytope Labs", logo: "/logos/polytope-labs.jpg" },
  { name: "Codecademy", logo: "/logos/codecademy.png" },
  { name: "web3bridge", logo: "/logos/web3bridge.png" },
  { name: "Ingressive for Good", logo: "/logos/ingressive-for-good.jpg" },
  { name: "Blockchain Uniben", logo: "/logos/blockchain-uniben.jpg" },
  { name: "University of Benin" },
  { name: "Seedless Labs", logo: "/logos/seedless-labs.png" },
  { name: "bchainAfrica" },
  { name: "NFTNG" },
  { name: "Yativo", formerly: "Zinari Finance", logo: "/logos/yativo.png" },
];
