# Writing — how a post gets published and syndicated

## Publishing here

One markdown file per post in this directory. The filename is the URL slug, so
`why-polygon-settles-slower-than-ethereum.md` becomes
`https://udokaam.dev/writing/why-polygon-settles-slower-than-ethereum/`.

Frontmatter:

```yaml
---
title: "The full title"
topic: "the bracketed eyebrow"
blurb: "One or two sentences. Used on the tile and as the meta description."
date: 2026-09-12   # omit while drafting
draft: false       # true keeps it noindex and unlinked
---
```

Word count and reading time are derived from the prose — never write them by
hand, they will go stale.

A draft still builds a page so it can be previewed, but it is excluded from the
sitemap, marked `noindex`, and its tile on the homepage renders unlinked. To
publish: set `draft: false`, add a `date`, push. That is the whole deploy.

Files starting with `_` (like this one) are ignored by the router.

## What every post gets automatically

- **Share card.** `scripts/og-images.mjs` draws a 1200×630 card (topic, title,
  byline) into `public/writing/<slug>/og.png` on every build. That is what X,
  LinkedIn, WhatsApp, Slack, Telegram and Discord show when the link is pasted.
  The files are gitignored; run `npm run og` to regenerate them locally.
- **Share buttons** at the top and bottom of the post: X, LinkedIn, Facebook,
  WhatsApp, Telegram, Reddit, Hacker News, Bluesky, Threads, email, copy link,
  and the phone's own share sheet (which reaches every other installed app).
- **Section links.** Every heading has a `#` link; its URL points at that
  section, so a reader can share one part of a long piece.
- **RSS.** `https://udokaam.dev/feed.xml` carries the full text of every
  published post, with absolute image URLs.

## Syndicating without giving away the ranking

The point of writing here rather than on a platform is that the search value
accrues to udokaam.dev. Syndication keeps that intact **only** if the copy
declares this site as canonical. Without it, you are competing against yourself
with identical text, and the platform's domain authority wins.

Order matters:

1. Publish here first.
2. Request indexing for the URL in Google Search Console and wait until it is
   indexed. This establishes which copy is the original.
3. Only then syndicate.

Per platform:

| Platform | How to set canonical |
|---|---|
| **Dev.to** | Easiest: Settings → Extensions → "Publishing to DEV Community from RSS", feed `https://udokaam.dev/feed.xml`, tick "Mark the RSS source as the canonical URL by default". New posts arrive as drafts with the canonical set. Manually: `canonical_url:` in the post's frontmatter. |
| **Hashnode** | "Original article URL" in post settings. |
| **Medium** | Use the import tool at `medium.com/p/import` and paste the udokaam.dev URL — it sets the canonical for you. Pasting the text into a new story does **not**. |
| **Substack** | Check the post settings for a canonical field before relying on one; it has historically not offered it. If there is none, publish an excerpt with a link back rather than the full text. |

Substack is the odd one out because it is a newsletter first. Email delivery is
its value — the web archive is a side effect, and that archive is what competes
with this site. Treat it as a distribution channel, not a mirror.

## Where the links live

Profiles are listed in `content/site.js` under `PROFILES`, which feeds the
`sameAs` array in the page's structured data. That is what lets a search engine
treat all these accounts as one person rather than several.
