import { readFileSync, readdirSync, existsSync, openSync, readSync, closeSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";
import hljs from "highlight.js/lib/core";
import bash from "highlight.js/lib/languages/bash";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import rust from "highlight.js/lib/languages/rust";
import python from "highlight.js/lib/languages/python";
import yaml from "highlight.js/lib/languages/yaml";
import json from "highlight.js/lib/languages/json";
import toml from "highlight.js/lib/languages/ini";
import go from "highlight.js/lib/languages/go";
import sql from "highlight.js/lib/languages/sql";
import xml from "highlight.js/lib/languages/xml";
import css from "highlight.js/lib/languages/css";
import diff from "highlight.js/lib/languages/diff";

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

/**
 * Code blocks are highlighted here, at build time, so readers get coloured
 * code without a highlighter shipping to the browser. Only the languages the
 * writing actually uses are registered; anything else renders as plain text
 * under its own label. Colours live in post.module.css (the .hl-* classes).
 */
for (const [name, lang] of Object.entries({ bash, javascript, typescript, rust, python, yaml, json, toml, go, sql, xml, css, diff })) {
  hljs.registerLanguage(name, lang);
}
hljs.registerAliases(["sh", "shell", "zsh", "console"], { languageName: "bash" });
hljs.registerAliases(["js", "jsx", "mjs"], { languageName: "javascript" });
hljs.registerAliases(["ts", "tsx"], { languageName: "typescript" });
hljs.registerAliases(["rs"], { languageName: "rust" });
hljs.registerAliases(["py"], { languageName: "python" });
hljs.registerAliases(["yml"], { languageName: "yaml" });
hljs.registerAliases(["html", "svg"], { languageName: "xml" });
hljs.configure({ classPrefix: "hl-" });

// What the label above each block says. The fence's own name is the fallback.
const LANG_LABELS = {
  bash: "Bash", sh: "Shell", shell: "Shell", zsh: "Zsh", console: "Terminal",
  javascript: "JavaScript", js: "JavaScript", jsx: "JSX", mjs: "JavaScript",
  typescript: "TypeScript", ts: "TypeScript", tsx: "TSX",
  rust: "Rust", rs: "Rust", python: "Python", py: "Python",
  yaml: "YAML", yml: "YAML", json: "JSON", toml: "TOML", go: "Go",
  sql: "SQL", html: "HTML", xml: "XML", svg: "SVG", css: "CSS", diff: "Diff",
  solidity: "Solidity", text: "Output", txt: "Output", plaintext: "Text",
};

const escapeHtml = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const PUBLIC = path.join(process.cwd(), "public");

/**
 * Intrinsic size of a PNG served from public/, read from its IHDR header so
 * the browser can reserve the right box before the image arrives. Anything
 * else (remote, other formats, missing file) just renders without it.
 */
function pngSize(src) {
  if (!src?.startsWith("/") || !/\.png$/i.test(src)) return null;
  const file = path.join(PUBLIC, decodeURI(src));
  if (!file.startsWith(PUBLIC) || !existsSync(file)) return null;
  const buf = Buffer.alloc(24);
  const fd = openSync(file, "r");
  try {
    readSync(fd, buf, 0, 24, 0);
  } finally {
    closeSync(fd);
  }
  if (buf.toString("ascii", 12, 16) !== "IHDR") return null;
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

const escapeAttr = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

/**
 * Section headings get stable ids and a "#" link, so any section of a post can
 * be linked to directly — the URL in the address bar after clicking it is the
 * share link for that section. Ids are deduped per document; `collected`
 * gathers the h2s for the contents list. Both reset at the start of each parse.
 */
let slugCounts = new Map();
let collected = [];

function slugify(text) {
  const base =
    String(text)
      .toLowerCase()
      .replace(/<[^>]+>/g, "")
      .replace(/&[a-z#0-9]+;/g, "")
      .replace(/[^\p{L}\p{N}\s-]/gu, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 80) || "section";
  const n = slugCounts.get(base) ?? 0;
  slugCounts.set(base, n + 1);
  return n ? `${base}-${n}` : base;
}

const stripTags = (html) =>
  html.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");

marked.use({
  hooks: {
    preprocess(md) {
      slugCounts = new Map();
      collected = [];
      return md;
    },
  },
  renderer: {
    heading({ tokens, depth }) {
      const inner = this.parser.parseInline(tokens);
      const plain = stripTags(inner);
      if (depth === 1 || depth > 4) return `<h${depth}>${inner}</h${depth}>\n`;
      const id = slugify(plain);
      if (depth === 2) collected.push({ id, text: plain });
      return `<h${depth} id="${id}">${inner}<a class="anchor" href="#${id}" aria-label="Link to this section: ${escapeAttr(plain)}">#</a></h${depth}>\n`;
    },
    // Figures are exported at 3200–4000px for sharpness. Sized attributes plus
    // lazy loading keep them from shifting the page or loading all at once.
    image({ href, title, text }) {
      const size = pngSize(href);
      const dims = size ? ` width="${size.width}" height="${size.height}"` : "";
      const t = title ? ` title="${escapeAttr(title)}"` : "";
      return `<img src="${escapeAttr(href)}" alt="${escapeAttr(text)}"${t}${dims} loading="lazy" decoding="async">`;
    },
    // A paragraph that is only an image is a figure: it gets its own wider
    // column in the post layout instead of being squeezed into the prose.
    paragraph(token) {
      const inner = (token.tokens ?? []).filter((t) => !(t.type === "text" && !t.text.trim()));
      if (inner.length === 1 && inner[0].type === "image") {
        return `<figure>${this.parser.parseInline(token.tokens)}</figure>\n`;
      }
      return false;
    },
    // Fenced code: a header naming the language, then the highlighted source.
    code({ text, lang }) {
      const id = (lang ?? "").trim().split(/\s+/)[0].toLowerCase();
      const known = id && hljs.getLanguage(id);
      const body = known ? hljs.highlight(text, { language: id, ignoreIllegals: true }).value : escapeHtml(text);
      const label = LANG_LABELS[id] ?? (id ? id.toUpperCase() : "Code");
      const cls = id ? ` class="language-${escapeAttr(id)}"` : "";
      return (
        `<div class="code-block" data-lang="${escapeAttr(id || "text")}">` +
        `<div class="code-head"><span class="code-lang">${escapeHtml(label)}</span></div>` +
        `<pre><code${cls}>${body.replace(/\n$/, "")}</code></pre>` +
        `</div>\n`
      );
    },
    // Wide tables scroll inside their own box on small screens rather than
    // pushing the whole page sideways.
    table(token) {
      const html = marked.Renderer.prototype.table.call(this, token);
      return `<div class="table-scroll" role="region" tabindex="0" aria-label="Table">${html}</div>\n`;
    },
  },
});

/**
 * YAML parses an unquoted `date: 2024-09-20` into a Date, not a string. The
 * sort compares dates as strings and a Date has no localeCompare, so it has to
 * be normalised on the way in. Everything downstream wants ISO anyway.
 */
function toISODate(value) {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

function read(file) {
  const slug = file.replace(/\.md$/, "");
  const { data, content } = matter(readFileSync(path.join(DIR, file), "utf8"));

  // Word count is derived, never typed — a hand-maintained number goes stale
  // the moment the prose changes.
  const words = content.trim().split(/\s+/).filter(Boolean).length;

  const rendered = marked.parse(content);
  const toc = collected;
  // The first standalone image is the cover; feeds and previews can use it.
  const cover = content.match(/^!\[[^\]]*\]\((\/[^)\s]+)/m)?.[1] ?? null;

  return {
    slug,
    title: data.title ?? slug,
    topic: data.topic ?? "",
    date: toISODate(data.date),
    blurb: data.blurb ?? "",
    draft: data.draft === true,
    words,
    readingMinutes: Math.max(1, Math.round(words / 220)),
    // The first image is usually the cover and sits above the fold: load it now.
    html: rendered.replace(' loading="lazy"', ' fetchpriority="high"'),
    toc,
    cover,
  };
}

export function getAllPosts({ includeDrafts = false } = {}) {
  if (!existsSync(DIR)) return [];
  return readdirSync(DIR)
    // A leading underscore marks a note to myself, not a post — notes can sit
    // alongside the writing without becoming routes.
    .filter((f) => f.endsWith(".md") && !f.startsWith("_"))
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
  return getAllPosts({ includeDrafts: true }).map(({ html, toc, ...rest }) => rest);
}

/**
 * Post HTML for use off this site (the RSS feed): site-relative links and
 * images become absolute, and the in-page "#" heading links are dropped since
 * they mean nothing inside a feed reader or an importer like dev.to.
 */
export function portableHtml(html, origin) {
  return html
    .replace(/<a class="anchor"[^>]*>#<\/a>/g, "")
    .replace(/ (src|href)="\/(?!\/)/g, ` $1="${origin}/`)
    .replace(/ fetchpriority="high"/, ' loading="lazy"');
}
