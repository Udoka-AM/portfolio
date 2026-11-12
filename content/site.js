// Identity and links. Everything the chrome needs, in one place.

export const SITE = {
  name: "Udoka A.M.",

  // The legal name is rare enough to be globally unique, which makes it the
  // strongest identity signal available — it goes in structured data and the
  // footer while "Udoka A.M." stays the display brand. The variants exist so
  // every spelling anyone might type resolves to the same entity.
  legalName: "Abasi-ibiangake Monday Udoka",
  alternateNames: [
    "Udoka AM",
    "Udoka A. M.",
    "Udoka A.M",
    "Abasi-ibiangake Udoka",
    "Monday Udoka",
  ],
  role: "Builder",
  // The one line every surface repeats: X, LinkedIn, this page, the meta tags.
  tagline: "Money infrastructure you can verify.",
  intro:
    "I build payment, payout and trading infrastructure across Solana, Tempo, Stellar, Hyperliquid and Zcash, and every claim on this page names the network it ran on.",
  focus:
    "Three years Solana-native. Now building on each chain for the primitive it does best, in the open, with contributors welcome.",
};

// href values are real URLs so the footer works before anything else is built.
export const LINKS = [
  { label: "github.com/Udoka-AM", href: "https://github.com/Udoka-AM" },
  { label: "x.com/Udoka_AM", href: "https://x.com/Udoka_AM" },
  { label: "linkedin.com/in/udokaam", href: "https://linkedin.com/in/udokaam" },
  { label: "udoka.am@gmail.com", href: "mailto:udoka.am@gmail.com" },
];

// Not rendered in the footer — these exist so search engines can collapse
// every profile into one entity rather than several strangers sharing a name.
export const PROFILES = [
  "https://github.com/Udoka-AM",
  "https://x.com/Udoka_AM",
  "https://linkedin.com/in/udokaam",
  "https://web.facebook.com/udoka.am/",
  "https://www.instagram.com/udoka_am/",
  "https://www.threads.com/@udoka.am",
  "https://medium.com/@Udoka_AM",
  "https://substack.com/@udokaam",
  "https://dev.to/udoka_am",
  "https://hashnode.com/@Uddy",
];

export const NAV = [
  { label: "Building", href: "#building" },
  { label: "Receipts", href: "#receipts" },
  { label: "Projects", href: "#projects" },
  { label: "Writing", href: "#writing" },
  { label: "Work with me", href: "#work-with-me" },
];

// The hero's one call to action. Point it at the newest build report.
export const LATEST_REPORT = {
  label: "Read the latest build report",
  href: "/writing/three-years-on-solana-two-months-across-five-chains/",
};
