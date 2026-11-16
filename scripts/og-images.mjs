/**
 * Builds the 1200×630 share card for every post into
 * public/writing/<slug>/og.png. Runs before `next build` (see package.json).
 *
 * Why a script and not app/…/opengraph-image.js: the site is a static export
 * served by GitHub Pages, which picks Content-Type from the file extension.
 * The file convention emits an extensionless `opengraph-image`, which Pages
 * serves as application/octet-stream — and X, LinkedIn and WhatsApp then
 * refuse to show the card. A real .png in public/ avoids that entirely.
 *
 * Fonts come from @fontsource (WOFF, which satori reads), so the build makes
 * no network requests.
 */
import { readFileSync, readdirSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import matter from "gray-matter";
import { ImageResponse } from "next/og.js";

const require = createRequire(import.meta.url);
const ROOT = process.cwd();
const DIR = path.join(ROOT, "content", "writing");
const OUT = path.join(ROOT, "public", "writing");

const font = (pkg, file) => readFileSync(path.join(path.dirname(require.resolve(`${pkg}/package.json`)), "files", file));

const fonts = [
  { name: "Bricolage", data: font("@fontsource/bricolage-grotesque", "bricolage-grotesque-latin-800-normal.woff"), weight: 800 },
  { name: "Bricolage", data: font("@fontsource/bricolage-grotesque", "bricolage-grotesque-latin-600-normal.woff"), weight: 600 },
  { name: "Mono", data: font("@fontsource/geist-mono", "geist-mono-latin-500-normal.woff"), weight: 500 },
];

// satori takes plain { type, props } trees, so no JSX or React import needed.
const h = (type, style, ...children) => ({
  type,
  props: { style: { display: "flex", ...style }, children: children.length === 1 ? children[0] : children },
});

const BRAND = "linear-gradient(90deg, #22d3ee, #3b82f6 38%, #8b5cf6 70%, #ec4899)";

function titleSize(t) {
  const n = t.length;
  if (n <= 48) return 72;
  if (n <= 80) return 62;
  if (n <= 115) return 54;
  return 46;
}

function mark(size) {
  // The UD mark from public/udoka-mark.svg, as four boxes on a 128 grid.
  const u = size / 128;
  const r = (x, y, w, hh) =>
    h("div", { position: "absolute", left: x * u, top: y * u, width: w * u, height: hh * u, background: "#e8eae6" });
  return h(
    "div",
    { position: "relative", width: size, height: size, display: "flex" },
    r(6, 14, 50, 100),
    r(68, 14, 52, 22),
    r(68, 92, 52, 22),
    r(98, 14, 22, 100),
  );
}

function card({ title, topic, minutes }) {
  return h(
    "div",
    {
      width: 1200,
      height: 630,
      display: "flex",
      flexDirection: "column",
      background: "#0f1214",
      backgroundImage: "radial-gradient(rgba(232,234,230,0.09) 1.5px, transparent 1.5px)",
      backgroundSize: "28px 28px",
      color: "#e8eae6",
      fontFamily: "Bricolage",
    },
    h("div", { height: 10, width: "100%", backgroundImage: BRAND }),
    h(
      "div",
      { display: "flex", flexDirection: "column", flex: 1, padding: "56px 72px 52px" },
      topic
        ? h(
            "div",
            {
              fontFamily: "Mono",
              fontSize: 22,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: "#7dd3fc",
              marginBottom: 26,
            },
            topic,
          )
        : h("div", { display: "flex" }),
      h(
        "div",
        {
          fontSize: titleSize(title),
          fontWeight: 800,
          lineHeight: 1.08,
          letterSpacing: -1.5,
          display: "flex",
          maxWidth: 1056,
        },
        title,
      ),
      h("div", { flex: 1, display: "flex" }),
      h(
        "div",
        {
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: "1px solid #2b3235",
          paddingTop: 26,
        },
        h(
          "div",
          { display: "flex", alignItems: "center" },
          mark(44),
          h("div", { fontSize: 30, fontWeight: 600, marginLeft: 18 }, "Udoka A.M."),
        ),
        h(
          "div",
          { fontFamily: "Mono", fontSize: 22, letterSpacing: 1.5, color: "#8a948e", display: "flex" },
          `udokaam.dev/writing${minutes ? `  ·  ${minutes} min read` : ""}`,
        ),
      ),
    ),
  );
}

const files = readdirSync(DIR).filter((f) => f.endsWith(".md") && !f.startsWith("_"));

for (const file of files) {
  const slug = file.replace(/\.md$/, "");
  const { data, content } = matter(readFileSync(path.join(DIR, file), "utf8"));
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const res = new ImageResponse(
    card({ title: data.title ?? slug, topic: data.topic ?? "", minutes: Math.max(1, Math.round(words / 220)) }),
    { width: 1200, height: 630, fonts },
  );
  const buf = Buffer.from(await res.arrayBuffer());
  mkdirSync(path.join(OUT, slug), { recursive: true });
  writeFileSync(path.join(OUT, slug, "og.png"), buf);
  console.log(`og  ${slug}/og.png  ${(buf.length / 1024).toFixed(0)}KB`);
}
