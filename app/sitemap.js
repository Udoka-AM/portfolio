import { getAllPosts } from "@/lib/posts";

export const dynamic = "force-static";

const SITE = "https://udokaam.dev";

export default function sitemap() {
  // Single-page site: the sections are fragments of one document, so the
  // sitemap has one entry. It exists so crawlers have a declared entry point
  // and a lastModified signal, not to pad the index.
  return [
    {
      url: `${SITE}/`,
      lastModified: new Date("2026-09-03"),
      changeFrequency: "monthly",
      priority: 1,
    },
    // Drafts are excluded — getAllPosts omits them by default.
    ...getAllPosts().map((p) => ({
      url: `${SITE}/writing/${p.slug}/`,
      lastModified: p.date ? new Date(p.date) : new Date("2026-09-03"),
      changeFrequency: "yearly",
      priority: 0.8,
    })),
  ];
}
