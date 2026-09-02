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
  role: "Software engineer",
  intro:
    "Software engineer building around blockchain, AI and cloud technologies while making it usable by the developers who adopt it.",
  focus:
    "Currently interested in agentic finance, cross-border stablecoin rails, onchain markets, and data security infrastructure.",
  // Used for <title>, og:title, and the JSON-LD person block.
  tagline: "Backend, blockchain, and developer-facing infrastructure.",
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
];

export const NAV = [
  { label: "Projects", href: "#projects" },
  { label: "Docs", href: "#docs" },
  { label: "Writing", href: "#writing" },
];
