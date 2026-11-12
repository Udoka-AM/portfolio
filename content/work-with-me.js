/* ---------------------------------------------------------------------------
   Work with me.

   One route per kind of visitor. Every route ends somewhere real: an email
   with the subject already filled in, or the place the work lives.
--------------------------------------------------------------------------- */

const mail = (subject) =>
  `mailto:udoka.am@gmail.com?subject=${encodeURIComponent(subject)}`;

export const ROUTES = [
  {
    who: "Investors",
    line: "Monthly build reports in public, and a deck on request.",
    links: [
      { label: "Latest build report", href: "/writing/three-years-on-solana-two-months-across-five-chains/" },
      { label: "Request the deck", href: mail("Investor: deck request") },
    ],
  },
  {
    who: "Partners and integrations",
    line: "Payout partners, anchors, exchanges, wallets and fintechs moving money into and out of Africa.",
    links: [{ label: "Start a conversation", href: mail("Partnership") }],
  },
  {
    who: "Ecosystems and grants",
    line: "Chain-native builds on Solana, Tempo, Stellar, Hyperliquid and Zcash, shipped in the open.",
    links: [{ label: "Talk ecosystems", href: mail("Ecosystem / grant") }],
  },
  {
    who: "Roles, contributions and advisory",
    line: "Payments infrastructure, protocol engineering and developer relations.",
    links: [
      { label: "Request my CV", href: mail("Role / advisory: CV request") },
      { label: "LinkedIn", href: "https://linkedin.com/in/udokaam" },
    ],
  },
  {
    who: "Contributors",
    line: "Every project here is open source. Pick an issue, open a pull request.",
    links: [
      { label: "Udoka-AM", href: "https://github.com/Udoka-AM" },
      { label: "CorridorHub", href: "https://github.com/CorridorHub" },
      { label: "Agents-Circle", href: "https://github.com/Agents-Circle" },
    ],
  },
  {
    who: "Press and speaking",
    line: "Talks, workshops and interviews on stablecoin rails, agentic finance and building in Africa.",
    links: [{ label: "Invite me", href: mail("Press / speaking") }],
  },
];
