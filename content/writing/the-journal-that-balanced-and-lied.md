---
title: "The journal that balanced and lied"
topic: "mutation testing"
blurb: "Sixteen tests passed against a settlement saga whose compensation order was reversed. What a balanced journal does not tell you, and what mutation testing does."
draft: true
---

> Scaffold. Replace everything below, then set `draft: false` and add a
> `date: YYYY-MM-DD` line to the frontmatter to publish it.

Arc's settlement saga moves money between Europe and Africa in steps, and every
step has a compensating action that undoes it. The ledger is double-entry, so
after any sequence — success or rollback — debits equal credits.

That property is exactly what made the bug invisible.

## The failure

<!-- What the compensation order was, what you changed it to, and why sixteen
     tests still passed. Be specific about which invariant held. -->

## Why balance is not correctness

A trial balance answers one question: does the arithmetic agree? It cannot
answer whether the entries describe what actually happened.

<!-- The distinction between an invariant that constrains totals and one that
     constrains sequence. This is the core of the piece. -->

## What mutation testing found

<!-- The mutant that survived. What it proved about the suite rather than the
     code — the tests asserted on final state and never on order. -->

## The assertion that was missing

<!-- The test you wrote afterwards. Show it. -->

## What I take from it

<!-- Short. Where else this class of bug hides: anything with a compensating
     action, anything where an invariant is cheap to satisfy accidentally. -->
<!-- Yes. Write the file, push, it's live.

content/writing/my-new-post.md

The filename becomes the URL — that file publishes at udokaam.dev/writing/my-new-post/.

Frontmatter at the top, then prose in markdown:

---
title: "The full title, as it should read on the page"
topic: "the bracketed eyebrow"
blurb: "One or two sentences. Used on the homepage tile and as the meta description."
date: 2026-09-12
draft: false
---

Your first paragraph.

## A section

More prose.

Then commit and push to main. The Action builds and deploys — same pipeline as everything else, no separate step. Typically live in under two minutes.

What you get automatically: the route, the homepage tile, per-post title and meta description, canonical URL, og:type: article, TechArticle structured data, a sitemap entry, and the derived word count and reading time.

While drafting, set draft: true and omit date. The page still builds so you can read it at the real URL, but it's noindex, absent from the sitemap, and its tile shows "Draft" with nothing to click. Flip to draft: false plus a date when it's ready — that's the publish action.

To see it before pushing:

npm --prefix /Users/udoka/portfolio run dev

Then open localhost:3000/writing/my-new-post/.

One thing to get right first time: the filename is the permanent URL. Renaming it later breaks any link anyone has shared and forfeits whatever indexing that URL earned. Pick the slug when you pick the title — short, keyword-bearing, no dates. why-polygon-settles-slower-than-ethereum is doing real work in search; post-1 isn't.

The three scaffolds are already in that folder with outlines, so the fastest start is filling one of those in rather than beginning from empty. -->

