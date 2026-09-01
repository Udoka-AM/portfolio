// Identity and links. Everything the chrome needs, in one place.

export const SITE = {
  name: "Udoka A.M.",
  role: "Software engineer",
  intro:
    "Software engineer building backend, blockchain, and cloud infrastructure and making it usable by the developers who adopt it.",
  focus:
    "Currently focused on agentic finance, stablecoin rails, and onchain markets. Nigeria, open to relocation.",
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

// `keep` marks the one link that survives the mobile breakpoint.
export const NAV = [
  { label: "Work", href: "#work" },
  { label: "Docs", href: "#docs" },
  { label: "Writing", href: "#writing" },
  { label: "CV", href: "#cv", keep: true },
];
