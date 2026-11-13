import { PROJECTS } from "@/content/projects";
import { FLAGSHIP } from "@/content/flagship";
import { DOCS } from "@/content/docs";
import { getAllPosts } from "@/lib/posts";
import { SITE, PROFILES } from "@/content/site";

const ORIGIN = "https://udokaam.dev";

/**
 * JSON-LD describing the person and what they made.
 *
 * The documentation lives on Mintlify, so it cannot be indexed under this
 * domain. What this does instead is state the relationship explicitly — these
 * works are authored by this person, and here is where each one lives — so a
 * crawler arriving here has a machine-readable route to all of it.
 */
export default function StructuredData() {
  const posts = getAllPosts();

  const data = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${ORIGIN}/#person`,
    name: SITE.legalName,
    alternateName: [SITE.name, ...SITE.alternateNames],
    description: `${SITE.role}. ${SITE.tagline} ${SITE.intro}`,
    url: ORIGIN,
    email: "udoka.am@gmail.com",
    jobTitle: ["Builder", "Software Engineer", "Developer Relations"],
    sameAs: PROFILES,
    knowsAbout: [
      "Stablecoin payments",
      "Cross-border payouts",
      "Blockchain infrastructure",
      "AI trading agents",
      "Solana",
      "Tempo",
      "Stellar",
      "Hyperliquid",
      "Zcash",
      "Backend engineering",
      "Developer relations",
      "Technical documentation",
    ],
    mainEntityOfPage: { "@type": "WebPage", "@id": `${ORIGIN}/` },
    subjectOf: [
      ...posts.map((p) => ({
        "@type": "TechArticle",
        name: p.title,
        abstract: p.blurb,
        url: `${ORIGIN}/writing/${p.slug}/`,
        ...(p.date ? { datePublished: p.date } : {}),
        author: { "@id": `${ORIGIN}/#person` },
      })),
      ...DOCS.map((d) => ({
      "@type": "TechArticle",
      name: `${d.name} documentation`,
      abstract: d.line,
      url: d.href,
      author: { "@id": `${ORIGIN}/#person` },
      })),
    ],
    // The flagships are products, so they are asserted as applications with
    // this person as creator; that is the link search engines and AI
    // assistants need to connect the name to the work.
    workExample: [
      ...FLAGSHIP.map((p) => ({
        "@type": "SoftwareApplication",
        "@id": `${ORIGIN}/#${p.id}`,
        name: p.name,
        applicationCategory: "FinanceApplication",
        description: p.problem,
        url: (p.links.find((l) => !l.href.includes("github.com")) ?? p.links[0]).href,
        sameAs: p.links.map((l) => l.href),
        creator: { "@id": `${ORIGIN}/#person` },
      })),
      // Only projects with a public destination are worth asserting.
      ...PROJECTS.filter((p) => p.href).map((p) => ({
      "@type": "SoftwareSourceCode",
      name: p.name,
      abstract: p.line,
      url: p.href,
      programmingLanguage: p.tags,
      author: { "@id": `${ORIGIN}/#person` },
      })),
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
