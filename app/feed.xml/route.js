import { getAllPosts, portableHtml } from "@/lib/posts";
import { SITE } from "@/content/site";

// Prerendered to out/feed.xml by the static export.
export const dynamic = "force-static";

const ORIGIN = "https://udokaam.dev";

const esc = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// CDATA cannot contain "]]>"; split it across two sections if it ever appears.
const cdata = (s = "") => `<![CDATA[${String(s).replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;

/**
 * Full-text RSS 2.0 feed of every published post.
 *
 * This is what makes a post portable: feed readers subscribe to it, and the
 * platform importers read it — dev.to (Settings → Extensions → "Publishing to
 * DEV from RSS") creates drafts with canonical_url already pointing here, and
 * Hashnode and Medium importers accept the item links. Content is the rendered
 * HTML with absolute URLs, so images and links survive the trip.
 */
export function GET() {
  const posts = getAllPosts();
  const latest = posts[0]?.date;

  const items = posts
    .map((p) => {
      const url = `${ORIGIN}/writing/${p.slug}/`;
      const image = p.cover ? `${ORIGIN}${p.cover}` : `${ORIGIN}/writing/${p.slug}/og.png`;
      return `    <item>
      <title>${esc(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      ${p.date ? `<pubDate>${new Date(`${p.date}T00:00:00Z`).toUTCString()}</pubDate>` : ""}
      <dc:creator>${esc(SITE.name)}</dc:creator>
      ${p.topic ? `<category>${esc(p.topic)}</category>` : ""}
      <description>${esc(p.blurb)}</description>
      <media:content url="${image}" medium="image" />
      <content:encoded>${cdata(portableHtml(p.html, ORIGIN))}</content:encoded>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>${esc(SITE.name)} — Writing</title>
    <link>${ORIGIN}/</link>
    <atom:link href="${ORIGIN}/feed.xml" rel="self" type="application/rss+xml" />
    <description>${esc(SITE.tagline)} Build reports and long-form engineering writing.</description>
    <language>en</language>
    ${latest ? `<lastBuildDate>${new Date(`${latest}T00:00:00Z`).toUTCString()}</lastBuildDate>` : ""}
    <image>
      <url>${ORIGIN}/favicon-512.png</url>
      <title>${esc(SITE.name)} — Writing</title>
      <link>${ORIGIN}/</link>
    </image>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
