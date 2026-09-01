export const dynamic = "force-static";

const SITE = "https://udokaam.dev";

export default function sitemap() {
  // Single-page site: the sections are fragments of one document, so the
  // sitemap has one entry. It exists so crawlers have a declared entry point
  // and a lastModified signal, not to pad the index.
  return [
    {
      url: `${SITE}/`,
      lastModified: new Date("2026-09-01"),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
