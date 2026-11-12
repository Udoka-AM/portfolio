/* ---------------------------------------------------------------------------
   Receipts.

   One figure per cell, each linking to the transaction or the evidence doc it
   came from. If a number cannot be linked to something a stranger can check,
   it does not belong here.
--------------------------------------------------------------------------- */

export const RECEIPTS = [
  {
    value: "91 s",
    what: "Mainnet USDC to naira in a Nigerian bank account, wallet approval included",
    who: "Nelo",
    net: "Solana mainnet",
    href: "https://solscan.io/tx/JtGPZSkEx6ZuQqXLDYchr7Cj1YshdVHh1UMkW5bUqPBQg8CthxcntqEFsLoLgLLHYekgTiP6msnqPaccdTFsAdq",
  },
  {
    value: "74 s",
    what: "2.90 USDC.e left a Tempo vault; ₦3,891.48 reached a Nigerian bank",
    who: "Corridor",
    net: "Tempo mainnet",
    href: "https://explore.tempo.xyz/tx/0x730f513c548447b043d420f2460a96e19aa01b6d17e451e922ded4bf87183be7",
  },
  {
    value: "98.3%",
    what: "Line coverage across 246 tests, including an invariant suite for the vault",
    who: "Agent Circle",
    net: "HyperEVM testnet",
    href: "https://github.com/Agents-Circle/agent-circle-evm#status",
  },
  {
    value: "0.1%",
    what: "Refund linkability on sealed bids, against 100% for the naive design",
    who: "sealForge",
    net: "Zcash testnet",
    href: "https://github.com/Udoka-AM/sealForge/blob/main/docs/evidence/linkability.md",
  },
  {
    value: "8",
    what: "Findings in a Solana lending-protocol audit, five critical, each with a test that runs the exploit",
    who: "MetaLend audit",
    net: "Rektoff cohort",
    href: "https://github.com/Udoka-AM/Solana-Lending-Protocol-AUDIT",
  },
  {
    value: "Acquired",
    what: "Solana Foundation grant, then sold to a Nigerian academic institution",
    who: "SprintIQ",
    net: "Solana",
    href: "https://github.com/Udoka-AM/SprintIQ",
  },
];
