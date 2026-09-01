/* ---------------------------------------------------------------------------
   The trial balance.

   Debits are what has been built. Credits are what it was built on top of —
   the ecosystems, the developers, the open source. Both columns sum to the
   same figure. The difference is zero, which is the whole point.
--------------------------------------------------------------------------- */

export const DEBITS = [
  {
    account: "Systems shipped",
    value: 5,
    note: "Arc · Agents Circle · RetinaOS · bagsMarkets · Orynth",
  },
  { account: "Runtimes targeted", value: 3, note: "Solana · EVM · Node" },
  { account: "Documentation sites published", value: 3, note: "one per system" },
  { account: "Tests green", value: 124, note: "38 Anchor · 86 Foundry" },
  {
    account: "Developers reached",
    value: 3000,
    note: "conferences, workshops, communities, livestreams",
  },
];

// TODO: ecosystems count is a placeholder pending the full historical list.
export const CREDITS_FIXED = [
  {
    account: "Ecosystems served",
    value: 7,
    note: "Solana · Arweave · WeaveDB · MagicBlock · Codecademy · Ingressive · UNIBEN",
  },
  { account: "Open source depended on", value: 11, note: "runtimes, frameworks, libraries" },
];

export const DR_TOTAL = DEBITS.reduce((sum, e) => sum + e.value, 0);

const CR_FIXED_TOTAL = CREDITS_FIXED.reduce((sum, e) => sum + e.value, 0);

// Hours are the balancing entry, so they are derived, never typed. Change any
// figure above and this moves to keep the columns in agreement — which is the
// only way a trial balance is ever allowed to balance.
export const CREDITS = [
  ...CREDITS_FIXED,
  {
    account: "Hours invested",
    value: DR_TOTAL - CR_FIXED_TOTAL,
    note: "the balancing entry, as it always is",
  },
];

export const CR_TOTAL = CREDITS.reduce((sum, e) => sum + e.value, 0);

export const LEDGER_CAPTION =
  "Everything on the left was built on everything on the right. The columns agree because they have to — a ledger that does not balance is a ledger that is lying, and finding out which is the job.";
