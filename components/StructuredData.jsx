import { PROJECTS } from "@/content/projects";
import { DOCS } from "@/content/docs";
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
  const data = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${ORIGIN}/#person`,
    name: SITE.legalName,
    alternateName: [SITE.name, ...SITE.alternateNames],
    description: SITE.intro,
    url: ORIGIN,
    email: "udoka.am@gmail.com",
    jobTitle: SITE.role,
    sameAs: PROFILES,
    knowsAbout: [
      "Backend engineering",
      "Blockchain infrastructure",
      "Stablecoin payments",
      "Solana",
      "Developer relations",
      "Technical documentation",
    ],
    mainEntityOfPage: { "@type": "WebPage", "@id": `${ORIGIN}/` },
    subjectOf: DOCS.map((d) => ({
      "@type": "TechArticle",
      name: `${d.name} documentation`,
      abstract: d.line,
      url: d.href,
      author: { "@id": `${ORIGIN}/#person` },
    })),
    // Only projects with a public destination are worth asserting.
    workExample: PROJECTS.filter((p) => p.href).map((p) => ({
      "@type": "SoftwareSourceCode",
      name: p.name,
      abstract: p.line,
      url: p.href,
      programmingLanguage: p.tags,
      author: { "@id": `${ORIGIN}/#person` },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
