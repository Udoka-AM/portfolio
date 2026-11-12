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
  // Shown after the role in the hero and in every title and meta tag. Kept
  // broad on purpose: the projects show the payments depth, this line keeps
  // engineering and developer-relations roles in view.
  tagline: "Software engineering and developer relations.",
  intro:
    "I build across Solana, Tempo, Stellar, Hyperliquid and Zcash: payments and payouts, trading infrastructure, privacy tooling, and the docs and developer experience that get other builders shipping. Every claim on this page names the network it ran on.",
  focus:
    "Five years in web3, from developer relations to protocol engineering. Open to software engineering and developer relations roles, and always to contributors and collaborators.",
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
// Set `href` to a published article to make the hero button live. While it is
// null the button shows as "coming soon" and links nowhere.
export const LATEST_REPORT = {
  label: "Build report",
  href: null,
};
