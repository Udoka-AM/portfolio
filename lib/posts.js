import { readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

/**
 * Posts are markdown files in content/writing/. Read at build time only —
 * the site is a static export, so none of this ships to the browser.
 *
 * Frontmatter:
 *   title    required
 *   topic    required — the bracketed eyebrow on the tile
 *   date     ISO yyyy-mm-dd, or omitted while a piece is still a draft
 *   blurb    required — the tile's summary and the page's meta description
 *   draft    true keeps it off the site entirely
 */
const DIR = path.join(process.cwd(), "content", "writing");

marked.setOptions({ mangle: false, headerIds: true });

function read(file) {
  const slug = file.replace(/\.md$/, "");
  const { data, content } = matter(readFileSync(path.join(DIR, file), "utf8"));

  // Word count is derived, never typed — a hand-maintained number goes stale
  // the moment the prose changes.
  const words = content.trim().split(/\s+/).filter(Boolean).length;

  return {
    slug,
    title: data.title ?? slug,
    topic: data.topic ?? "",
    date: data.date ?? null,
    blurb: data.blurb ?? "",
    draft: data.draft === true,
    words,
    readingMinutes: Math.max(1, Math.round(words / 220)),
    html: marked.parse(content),
  };
}

export function getAllPosts({ includeDrafts = false } = {}) {
  if (!existsSync(DIR)) return [];
  return readdirSync(DIR)
    .filter((f) => f.endsWith(".md"))
    .map(read)
    .filter((p) => includeDrafts || !p.draft)
    // Newest first; undated drafts sort last.
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
}

export function getPost(slug) {
  return getAllPosts({ includeDrafts: true }).find((p) => p.slug === slug) ?? null;
}

/** What the homepage tiles render. Drafts appear, but without a link. */
export function getPostSummaries() {
  return getAllPosts({ includeDrafts: true }).map(({ html, ...rest }) => rest);
}
